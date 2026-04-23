from django.contrib import admin
from .models import Specialty, Patient, Doctor, TimeSlot, Appointment
admin.site.register(Specialty)
admin.site.register(Patient)
admin.site.register(Doctor)
admin.site.register(TimeSlot)
admin.site.register(Appointment)
# Register your models here.
