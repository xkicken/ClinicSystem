from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import *
from django.utils import timezone
from datetime import timedelta, datetime

def home(request):
    doctors = Doctor.objects.select_related('specialty', 'account').all()
    return render(request, 'appointment/home.html', {'doctors': doctors})

def profile(request):
    return render(request, 'appointment/profile.html')
# Create your views here.
def doctor_dashboard(request):
    return render(request, 'appointment/doctor_dashboard.html')

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

    print(patient_data)

    return render(request, "appointment/user_dashboard.html", {
        "patient_data": patient_data
    })

@login_required
def calendar(request):
    user = request.user

    group = user.groups.first().name if user.groups.exists() else None
    if group == "Doctor":
        appointments = Appointment.objects.select_related(
            'patient', 'time_slot', 'time_slot__doctor'
        ).filter(time_slot__doctor_id=user.id, appointment_status='BOOKED')

        events = []
        for apt in appointments:
            events.append({
                'id': apt.id,
                'title': f"{apt.patient.first_name} {apt.patient.last_name}",
                'start': f"{apt.time_slot.date}T{apt.time_slot.start_time}",
                'end': f"{apt.time_slot.date}T{apt.time_slot.end_time}",
            })

        return render(request, "appointment/calendar.html", {
            "data": events
        })
    elif group == "User":
        patients = Patient.objects.filter(account_id=user.id)

        events = []

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
        print(events)
        return render(request, "appointment/calendar.html", {
            "data": events
        })

    return render(request, "appointment/calendar.html")

def booking(request):
    patient_id = request.GET.get('patient')

    doctor_id = request.GET.get('doctor')

    start_date = request.GET.get('start_date')

    time_slots = TimeSlot.objects.filter(doctor_id=doctor_id, booked=False)

    local_date = timezone.now().date()


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

        print("doctor id exist")
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

def booking_confirm(request):
    doctor_id = request.GET.get('doctor')
    time_slot_id = request.GET.get('time_slot')
    patient_id = request.GET.get('patient')
    appointment = Appointment.objects.select_related(
        'time_slot','patient','time_slot__doctor'
    )

    appointment, created = Appointment.objects.get_or_create(
        time_slot_id=time_slot_id, patient_id=patient_id, time_slot__doctor_id=doctor_id
    )
    return render(request, "appointment/booking_confirm.html",{
        "appointment":appointment
    })

