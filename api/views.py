from django.contrib.auth.models import User, Group
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.conf import settings

from .serializers import *

COOKIE_SECURE = False
COOKIE_SAMESITE = "Lax"

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user_group, _ = Group.objects.get_or_create(name='User')
            user.groups.add(user_group)
            UserProfile.objects.create(user=user)
            return Response({
                'detail': 'Registered successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response({
            'detail': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class MeView (APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        group = user.groups.first().name if user.groups.exists() else None
        profile_id = user.userprofile.id if hasattr(user, 'userprofile') else None
        return  Response({
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'group': group,
            'profile_id': profile_id,
        })

def _set_auth_cookies(response, refresh):
    access = refresh.access_token
    response.set_cookie(
        "access_token",
        str(access),
        max_age=int(access.lifetime.total_seconds()),
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )
    response.set_cookie(
        "refresh_token",
        str(refresh),
        max_age=int(refresh.lifetime.total_seconds()),
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        response = Response({"detail": "Login successful."})
        _set_auth_cookies(response, refresh)
        return response

class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.COOKIES.get("refresh_token")
        if not token:
            return Response({"detail": "No refresh token."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(token)
            response = Response({"detail": "Token refreshed."})
            _set_auth_cookies(response, refresh)
            return response
        except TokenError:
            return Response({"detail": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

class SpecialtyListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        specialties = Specialty.objects.all()
        return Response(
            SpecialtySerializer(specialties, many=True).data
        )


class DoctorListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        doctors = Doctor.objects.select_related('specialty', 'account').all()
        return Response(
            DoctorSerializer(doctors, many=True).data
        )


class AddDoctorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.groups.filter(name='Admin').exists():
            return Response({
                'detail': 'Forbidden.'
            }, status=status.HTTP_403_FORBIDDEN)

        user_data = {
            'username': request.data.get('username'),
            'first_name': request.data.get('first_name'),
            'last_name': request.data.get('last_name'),
            'email': request.data.get('email'),
            'password': request.data.get('password'),
        }
        user_serializer = RegisterSerializer(data=user_data)
        if not user_serializer.is_valid():
            return Response({
                user_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        user = user_serializer.save()
        doctor_group, _ = Group.objects.get_or_create(name='Doctor')
        user.groups.add(doctor_group)

        doctor_serializer = DoctorSerializer(data={
            'specialty_id': request.data.get('specialty_id'),
            'phone': request.data.get('phone'),
        })
        if not doctor_serializer.is_valid():
            user.delete()
            return Response({
                doctor_serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        doctor_serializer.save(account=user)
        return Response({
            'detail': 'Doctor created.'
        }, status=status.HTTP_201_CREATED)


class DoctorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        doctor = Doctor.objects.select_related('specialty', 'account').get(id=id)
        return Response({
            DoctorSerializer(doctor).data
        })

    def patch(self, request, id):
        if not request.user.groups.filter(name='Admin').exists():
            return Response({
                'detail': 'Forbidden.'
            }, status=status.HTTP_403_FORBIDDEN)
        doctor = Doctor.objects.get(id=id)
        serializer = DoctorSerializer(doctor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response({
            serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        if not request.user.groups.filter(name='Admin').exists():
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        Doctor.objects.get(id=id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PatientListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patients = Patient.objects.filter(account=request.user)
        return Response(PatientSerializer(patients, many=True).data)

    def post(self, request):
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(account=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_patient(self, id, user):
        patient = Patient.objects.get(id=id)
        if patient.account != user and not user.groups.filter(name='Admin').exists():
            return None, Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return patient, None

    def get(self, request, id):
        patient, err = self._get_patient(id, request.user)
        if err:
            return err
        return Response(PatientSerializer(patient).data)

    def patch(self, request, id):
        patient, err = self._get_patient(id, request.user)
        if err:
            return err
        serializer = PatientSerializer(patient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        patient, err = self._get_patient(id, request.user)
        if err:
            return err
        patient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TimeSlotListView(APIView):
    permission_classes = [IsAuthenticated]
    DAYS_PER_PAGE = 4

    def get(self, request):
        qs = TimeSlot.objects.select_related('doctor', 'doctor__account').filter(date__gte=timezone.localtime().date())

        doctor_id = request.query_params.get('doctor')
        booked = request.query_params.get('booked')
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)
        if booked is not None:
            qs = qs.filter(booked=booked.lower() == 'true')

        try:
            page = max(0, int(request.query_params.get('page', 0)))
        except (TypeError, ValueError):
            page = 0

        dates = list(qs.values_list('date', flat=True).distinct().order_by('date'))
        page_count = (len(dates) + self.DAYS_PER_PAGE - 1) // self.DAYS_PER_PAGE

        page_dates = dates[page * self.DAYS_PER_PAGE:(page + 1) * self.DAYS_PER_PAGE]
        page_qs = qs.filter(date__in=page_dates).order_by('date', 'start_time')

        return Response({
            'results': TimeSlotSerializer(page_qs, many=True).data,
            'page': page,
            'page_count': page_count,
            'has_next': page < page_count - 1,
            'has_previous': page > 0,
        })

class AppointmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        group = user.groups.first().name if user.groups.exists() else None

        if group == 'Doctor':
            qs = Appointment.objects.select_related(
                'patient', 'time_slot', 'time_slot__doctor'
            ).filter(time_slot__doctor__account=user)
        elif group == 'Admin':
            qs = Appointment.objects.select_related(
                'patient', 'time_slot', 'time_slot__doctor'
            ).all()
        else:
            patient_ids = Patient.objects.filter(account=user).values_list('id', flat=True)
            qs = Appointment.objects.select_related(
                'patient', 'time_slot', 'time_slot__doctor'
            ).filter(patient_id__in=patient_ids)

        return Response(AppointmentSerializer(qs, many=True).data)

    def post(self, request):
        serializer = AppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        patient = serializer.validated_data['patient']
        time_slot = serializer.validated_data['time_slot']

        if patient.account != request.user and not request.user.groups.filter(name='Admin').exists():
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        if time_slot.booked or Appointment.objects.filter(time_slot=time_slot).exists():
            return Response({'detail': 'This time slot is no longer available.'},
                            status=status.HTTP_409_CONFLICT)

        appointment = Appointment.objects.create(patient=patient, time_slot=time_slot)
        time_slot.booked = True
        time_slot.save(update_fields=['booked'])

        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


class AppointmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_appointment(self, id, user):
        appointment = Appointment.objects.select_related(
            'patient', 'time_slot', 'time_slot__doctor', 'time_slot__doctor__account'
        ).get(id=id)
        is_patient_owner = appointment.patient.account == user
        is_doctor = appointment.time_slot.doctor.account == user
        is_admin = user.groups.filter(name='Admin').exists()
        if not (is_patient_owner or is_doctor or is_admin):
            return None, Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return appointment, None

    def get(self, request, id):
        appointment, err = self._get_appointment(id, request.user)
        if err:
            return err
        return Response(AppointmentSerializer(appointment).data)

    def patch(self, request, id):
        appointment, err = self._get_appointment(id, request.user)
        if err:
            return err

        serializer = AppointmentSerializer(appointment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()

        if appointment.appointment_status == 'CANCELLED' and appointment.time_slot.booked:
            appointment.time_slot.booked = False
            appointment.time_slot.save(update_fields=['booked'])

        return Response(AppointmentSerializer(appointment).data)


class CalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        group = user.groups.first().name if user.groups.exists() else None
        events = []

        if group == 'Doctor':
            appointments = Appointment.objects.select_related(
                'patient', 'time_slot'
            ).filter(time_slot__doctor__account=user, appointment_status='BOOKED')
            for apt in appointments:
                events.append({
                    'id': apt.id,
                    'title': f"{apt.patient.first_name} {apt.patient.last_name}",
                    'start': f"{apt.time_slot.date}T{apt.time_slot.start_time}",
                    'end': f"{apt.time_slot.date}T{apt.time_slot.end_time}",
                })
        else:
            patients = Patient.objects.all() if group == 'Admin' else Patient.objects.filter(account=user)
            for p in patients:
                for apt in Appointment.objects.select_related('time_slot').filter(patient=p):
                    events.append({
                        'id': apt.id,
                        'title': f"{p.first_name} {p.last_name}",
                        'start': f"{apt.time_slot.date}T{apt.time_slot.start_time}",
                        'end': f"{apt.time_slot.date}T{apt.time_slot.end_time}",
                    })

        return Response(events)


class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_patient(self, user):
        patient = Patient.objects.get(id=id)
        if patient.account != user and not user.groups.filter(name='Admin').exists():
            return None, Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return patient, None

    def get(self, request):
        patients = Patient.objects.filter(account=request.user)
        return Response(PatientSerializer(patients, many=True).data)

class PatientNextAppointmentView(APIView):
    permission_classes = [IsAuthenticated]
    def _get_patient(self, id, user):
        patient = Patient.objects.get(id=id)
        if patient.account != user and not user.group.filter(name='admin').exists():
            return None, Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return patient, None

    def get(self, request, id):
        patient, err  = self._get_patient(id,request.user)
        if err:
            return err

        next_appointment = (
            Appointment.objects
            .select_related('time_slot', 'time_slot__doctor', 'time_slot__doctor__account')
            .filter(patient=patient,appointment_status='BOOKED', time_slot__date__gte=timezone.localtime().date())
            .order_by('time_slot__date', 'time_slot__start_time')
            .first()
        )
        if next_appointment is None:
            return Response({'next_appointment': None})
        return Response({'next_appointment': AppointmentSerializer(next_appointment).data})


class DoctorDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.groups.filter(name='Doctor').exists():
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        appointments = Appointment.objects.select_related(
            'patient', 'time_slot', 'time_slot__doctor'
        ).filter(
            time_slot__doctor__account=request.user,
            appointment_status='BOOKED',
            time_slot__date=timezone.localtime().date()
        )
        return Response(AppointmentSerializer(appointments, many=True).data)


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.groups.filter(name='Admin').exists():
            return Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)

        doctors = Doctor.objects.select_related('account', 'specialty').all()
        users = User.objects.prefetch_related('patients').filter(groups__name='User')

        return Response({
            'doctors': DoctorSerializer(doctors, many=True).data,
            'users': [
                {
                    'user': UserSerializer(u).data,
                    'patients': PatientSerializer(u.patients.all(), many=True).data,
                }
                for u in users
            ],
        })


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_profile(self, id, user):
        profile = UserProfile.objects.select_related('user').get(id=id)
        if profile.user != user and not user.groups.filter(name='Admin').exists():
            return None, Response({'detail': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        return profile, None

    def get(self, request, id):
        profile, err = self._get_profile(id, request.user)
        if err:
            return err
        return Response(UserProfileSerializer(profile).data)

    def patch(self, request, id):
        profile, err = self._get_profile(id, request.user)
        if err:
            return err
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)