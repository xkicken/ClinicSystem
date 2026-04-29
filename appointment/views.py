from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import *

def home(request):
    doctors = Doctor.objects.select_related('specialty', 'account').all()
    return render(request, 'appointment/home.html', {'doctors': doctors})

def profile(request):
    return render(request, 'appointment/profile.html')
# Create your views here.
def doctor_dashboard(request):
    return render(request, 'appointment/doctor_dashboard.html')
def patient_dashboard(request):
    return render(request, 'appointment/patient_dashboard.html')

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

        return render(request, "appointment/calendar.html", {
            "data": events
        })

    return render(request, "appointment/calendar.html")


