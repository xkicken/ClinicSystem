from django.contrib import admin
from .models import Appointment, Patient, Doctor, Specialty, TimeSlot
# Register your models here.
admin.site.register(Appointment)
admin.site.register(Patient)
admin.site.register(Doctor)
admin.site.register(Specialty)
admin.site.register(TimeSlot)
