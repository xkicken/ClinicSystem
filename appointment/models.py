from django.db import models
from django.contrib.auth.models import User

class Specialty(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Patient(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    firstName = models.CharField(max_length=150)
    lastName = models.CharField(max_length=150)

    phone = models.CharField(max_length=15)
    address = models.CharField(max_length=255)
    dateOfBirth = models.DateField()

    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other')
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)

    emergencyContact = models.CharField(max_length=255)
    emergencyContactPhone = models.CharField(max_length=15)

    def __str__(self):
        return f"{self.firstName} {self.lastName}"

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.user.get_full_name()


class TimeSlot(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)

    date = models.DateField()
    startTime = models.TimeField()
    endTime = models.TimeField()

    is_booked = models.BooleanField(default=False)

    class Meta:
        unique_together = ('doctor', 'date', 'startTime')

    def __str__(self):
        return f"{self.doctor} - {self.date} {self.startTime}"


class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)

    timeSlot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)

    STATUS_CHOICES = [
        ('BOOKED', 'Booked'),
        ('CANCELLED', 'Cancelled'),
        ('DONE', 'Completed')
    ]

    appointmentStatus = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='BOOKED'
    )

    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient} {self.doctor} - {self.timeSlot}"
