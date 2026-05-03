from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import *
from django.utils import timezone
from datetime import timedelta, datetime
from .forms import *
from django.core.exceptions import PermissionDenied

def home(request):
    doctors = Doctor.objects.select_related('specialty', 'account').all()
    return render(request, 'appointment/home.html', {'doctors': doctors})
# Create your views here.
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

@login_required
def booking(request):
    userID = request.user.id
    patient_id = request.GET.get('patient')
    patient = Patient.objects.get(id=patient_id)
    doctor_id = request.GET.get('doctor')
    time_slots = TimeSlot.objects.filter(doctor_id=doctor_id, booked=False)
    if userID == patient.account.id:
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
    userID = request.user.id
    doctor_id = request.GET.get('doctor')
    time_slot_id = request.GET.get('time_slot')
    patient_id = request.GET.get('patient')
    patient = Patient.objects.get(id=patient_id)
    if userID == patient.account.id:
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
    appointment = get_object_or_404(Appointment.objects.select_related('time_slot', 'patient', 'time_slot__doctor'), id=id)
    if request.user.id != appointment.patient.account.id:
        raise PermissionDenied

    edit_mode = request.GET.get('edit') == 'true'

    form = BookingForm(request.POST or None, instance=appointment)

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

    if request.user.id != user_profile.user.id:
        raise PermissionDenied

    edit_mode = request.GET.get('edit', '').lower() == 'true'

    user_form = UserForm(
        request.POST or None,
        instance=user_profile.user
    )

    profile_form = ProfileForm(
        request.POST or None,
        request.FILES or None,
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