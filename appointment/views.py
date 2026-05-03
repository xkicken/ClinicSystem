from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from django.contrib.auth.models import Group
from .models import *
from django.utils import timezone
from datetime import timedelta, datetime
from .forms import *
from django.core.exceptions import PermissionDenied

def home(request):
    doctors = Doctor.objects.select_related('specialty', 'account').all()
    specialties = Specialty.objects.all()

    total_doctors = doctors.count()
    total_specialties = specialties.count()
    
    context = {
        'doctors': doctors,
        'specialties': specialties,
        'total_doctors': total_doctors,
        'total_specialties': total_specialties,
    }
    
    return render(request, 'appointment/home.html', context)

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()

            user_group = Group.objects.get_or_create(name='User')[0]
            user.groups.add(user_group)

            UserProfile.objects.create(user=user)

            login(request, user)
            
            return redirect('user_dashboard')
    else:
        form = RegistrationForm()
    
    return render(request, 'registration/register.html', {'form': form})

def doctor_dashboard(request):
    user = request.user
    appointments = Appointment.objects.select_related(
        'patient', 'time_slot', 'time_slot__doctor'
    ).filter(time_slot__doctor__account=user.id, appointment_status='BOOKED', time_slot__date=timezone.localtime().date())
    return render(request, 'appointment/doctor_dashboard.html', {
        'appointments': appointments
    })

@login_required()
def user_dashboard(request):
    user = request.user
    patients = Patient.objects.filter(account_id=user.id)
    patient_data = []
    for p in patients:
        appointments = (
            Appointment.objects.select_related('time_slot', 'time_slot__doctor')
        .filter(patient_id=p.id, time_slot__date__gte=timezone.localtime().date())
        .order_by('time_slot__date','time_slot__start_time')
        .first()
        )

        patient_data.append({
            'patient': p,
            'appointment': appointments
        })
    return render(request, "appointment/user_dashboard.html", {
        "patient_data": patient_data
    })

@login_required
def calendar(request):
    user = request.user
    group = user.groups.first().name if user.groups.exists() else None
    events = []
    patients = None
    if group == "Doctor":
        appointments = Appointment.objects.select_related(
            'patient', 'time_slot', 'time_slot__doctor'
        ).filter(time_slot__doctor_id=user.id, appointment_status='BOOKED')
        pass
    elif group == "User":
        patients = Patient.objects.filter(account_id=user.id)
        pass
    elif group  == "Admin":
        patients = Patient.objects.all()
        pass

    if patients is None:
        return render(request, "appointment/calendar.html", {
        })
    else:
        pass

    for p in patients:
        appointments = Appointment.objects.select_related(
            'time_slot', 'time_slot__doctor'
        ).filter(patient_id=p.id)

        for apt in appointments:
            events.append({
                'id': apt.id,
                'title': f"{p.first_name} {p.last_name}",
                'start': f"{apt.time_slot.date}T{apt.time_slot.start_time}",
                'end': f"{apt.time_slot.date}T{apt.time_slot.end_time}",
            })

    return render(request, "appointment/calendar.html", {
        "data": events
    })
@login_required
def booking(request):
    user_id = request.user.id
    patient_id = request.GET.get('patient')
    patient = Patient.objects.get(id=patient_id)
    doctor_id = request.GET.get('doctor')
    time_slots = TimeSlot.objects.filter(doctor_id=doctor_id, booked=False)
    if user_id == patient.account.id:
        if doctor_id:
            selected_doctor = Doctor.objects.get(id=doctor_id)
            selected_doctor_json = {
                'id': selected_doctor.id,
                'first_name': selected_doctor.account.first_name,
                'last_name': selected_doctor.account.last_name,
                'specialty': selected_doctor.specialty.name if selected_doctor.specialty else None
            }
            selected_patient = Patient.objects.get(id=patient_id)
            selected_patient_json = {
                'id': selected_patient.id,
                'first_name': selected_patient.first_name,
                'last_name': selected_patient.last_name
            }

            time_slots_available = []
            for slot in time_slots:
                time_slots_available.append({
                    'start': f"{slot.date}T{slot.start_time}",
                    'end': f"{slot.date}T{slot.end_time}",
                    'extendedProps':{
                        'time_slot_id': slot.id
                    }
                })
            return render(request, "appointment/booking.html", {
                "doctors": Doctor.objects.all(),
                "selected_doctor": Doctor.objects.get(id=doctor_id),
                "selected_doctor_json": selected_doctor_json,
                "data": time_slots_available,
                "selected_patient": Patient.objects.get(id=patient_id),
                "selected_patient_json": selected_patient_json
            })

        return  render(request, "appointment/booking.html",{
            "doctors": Doctor.objects.all(),
            "selected_patient": Patient.objects.get(id=patient_id),
        })
    else:
        raise PermissionDenied

@login_required
def booking_confirm(request):
    user_id = request.user.id
    doctor_id = request.GET.get('doctor')
    time_slot_id = request.GET.get('time_slot')
    patient_id = request.GET.get('patient')
    patient = Patient.objects.get(id=patient_id)
    if user_id == patient.account.id:
        appointment = Appointment.objects.select_related(
            'time_slot','patient','time_slot__doctor'
        )

        appointment, created = Appointment.objects.get_or_create(
            time_slot_id=time_slot_id, patient_id=patient_id
        )

        if created:
            TimeSlot.objects.filter(id=time_slot_id).update(booked=True)
        
        return render(request, "appointment/booking_confirm.html",{
            "appointment":appointment
        })
    else:
        raise PermissionDenied

@login_required
def patient_view(request, id):
    patient = get_object_or_404(Patient, id=id)
    if request.user.id != patient.account.id:
        raise PermissionDenied

    edit_mode = request.GET.get('edit') == 'true'

    form = PatientForm(request.POST or None, instance=patient)

    if request.method == 'POST':
        if form.is_valid():
            form.save()
            return redirect('patient_view', patient.id)

    return render(request, "appointment/patient_view.html", {
        "patient": patient,
        "edit_mode": edit_mode,
        "form": form
    })

def booking_view(request, id):
    appointment = get_object_or_404(Appointment.objects.select_related('time_slot', 'patient'), id=id)
    if request.user.id == appointment.patient.account.id:
        form = BookingForm(request.POST or None, instance=appointment)
        pass
    elif request.user.id == appointment.time_slot.doctor.account.id:
        form = DoctorBookingForm(request.POST or None, instance=appointment)
        pass
    elif request.user.groups.filter(name='Admin').exists():
        form = DoctorBookingForm(request.POST or None, instance=appointment)
        pass
    else:
        raise PermissionDenied

    edit_mode = request.GET.get('edit') == 'true'

    if request.method == 'POST':
        if form.is_valid():
            form.save()
            return redirect('booking_view', id)

    return render(request, "appointment/booking_view.html", {
        "appointment": appointment,
        "edit_mode": edit_mode,
        "form": form
    })

@login_required
def profile(request, id):
    user_profile = get_object_or_404(
        UserProfile.objects.select_related('user'),
        id=id
    )

    if request.user.id == user_profile.user.id:
        pass
    elif request.user.groups.filter(name='Admin').exists():
        pass
    else:
        raise PermissionDenied

    edit_mode = request.GET.get('edit', '').lower() == 'true'

    user_form = UserForm(
        request.POST or None,
        instance=user_profile.user
    )

    profile_form = ProfileForm(
        request.POST or None,
        instance=user_profile
    )

    if request.method == 'POST':
        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            return redirect('profile', id=id)

    return render(request, "appointment/profile.html", {
        "user_profile": user_profile,
        "edit_mode": edit_mode,
        "user_form": user_form,
        "profile_form": profile_form
    })

@login_required()
def add_patient(request):
    if request.method == 'POST':
        form = PatientForm(request.POST)
        if form.is_valid():
            patient = form.save(commit=False)
            patient.account = request.user
            patient.save()
            return redirect('user_dashboard',)
    else:
        form = PatientForm()
    return render(request, 'appointment/add_patient.html', {'form': form})

def delete_patient(request, id):
    patient = get_object_or_404(Patient, id=id)
    if request.user.id != patient.account.id:
        raise PermissionDenied
    patient.delete()
    return redirect('user_dashboard')

def admin_dashboard(request):
    doctors = Doctor.objects.select_related('account').all()
    users = User.objects.prefetch_related('userprofile', 'patients').filter(groups__name='User')
    
    user_data = []
    for user in users:
        user_data.append({
            'user': user,
            'patients': user.patients.all()
        })

    return render(request, 'appointment/admin_dashboard.html', {
        'doctors': doctors,
        'users': user_data,
    })

def doctor_view(request, id):
    doctor = get_object_or_404(Doctor, id=id)
    if not request.user.groups.filter(name='Admin').exists():
        raise PermissionDenied

    edit_mode = request.GET.get('edit') == 'true'

    form = DoctorForm(
        request.POST or None,
        instance=doctor
    )

    user_form = UserForm(
        request.POST or None,
        instance=doctor.account
    )

    if request.method == 'POST':
        if form.is_valid() and user_form.is_valid():
            form.save()
            user_form.save()
            return redirect('doctor_view', doctor.id)

    return render(request, "appointment/doctor_view.html", {
        "doctor": doctor,
        "account": doctor.account,
        "edit_mode": edit_mode,
        "form": form,
        "user_form": user_form
    })

def delete_doctor(request, id):
    doctor = get_object_or_404(Doctor, id=id)
    if not request.user.groups.filter(name='Admin').exists():
        raise PermissionDenied
    doctor.delete()
    return redirect('admin_dashboard')

def add_doctor(request):
    if request.method == 'POST':
        doctor_form = DoctorForm(request.POST)
        user_form = UserForm(request.POST)
        
        if doctor_form.is_valid() and user_form.is_valid():
            user = user_form.save(commit=False)
            user.save()

            doctor = doctor_form.save(commit=False)
            doctor.account = user
            doctor.save()

            from django.contrib.auth.models import Group
            doctor_group = Group.objects.get(name='Doctor')
            user.groups.add(doctor_group)
            
            return redirect('admin_dashboard')
    else:
        doctor_form = DoctorForm()
        user_form = UserForm()
    
    return render(request, 'appointment/add_doctor.html', {
        'doctor_form': doctor_form,
        'user_form': user_form
    })