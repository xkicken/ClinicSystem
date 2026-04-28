from django.shortcuts import render
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
def calendar(request):
    return render(request, 'appointment/calendar.html')