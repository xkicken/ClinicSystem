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

    doctor_id = request.GET.get('doctor')

    start_date = request.GET.get('start_date')

    time_slots = TimeSlot.objects.filter(doctor_id=doctor_id, booked=False)

    local_date = timezone.now().date()

    if doctor_id:
        print("doctor id exist")
        if start_date:
            try:
                time_slots_available = []
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                print("start date exist")
                time_slots = time_slots.filter(date__gte=start_date_obj, date__lte=start_date_obj + timedelta(days=7))

                for slot in time_slots:
                    time_slots_available.append({
                        'id': slot.id,
                        'start': f"{slot.date}T{slot.start_time}",
                        'end': f"{slot.date}T{slot.end_time}",
                    })
                print(time_slots_available)
                return render(request, "appointment/booking.html", {
                    "doctor": Doctor.objects.all(),
                    "selected_doctor": Doctor.objects.get(id=doctor_id),
                    "data": time_slots_available
                })
            except ValueError:
                print("Invalid date format")

        else:
            sunday = local_date + timedelta(days=(0 - local_date.isoweekday()))
            print(sunday)
            time_slots_available = []
            time_slots = time_slots.filter(date__gte=sunday, date__lt=sunday + timedelta(days=7))

            for slot in time_slots:
                time_slots_available.append({
                    'id': slot.id,
                    'start': f"{slot.date}T{slot.start_time}",
                    'end': f"{slot.date}T{slot.end_time}",
                })
            # print(time_slots_available)
            return render(request, "appointment/booking.html", {
                "doctor": Doctor.objects.all(),
                "selected_doctor": Doctor.objects.get(id=doctor_id),
                "data": time_slots_available
            })

    return  render(request, "appointment/booking.html")

