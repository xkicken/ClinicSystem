from django.db import models
from django.contrib.auth.models import User

class Specialty(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

# one user account may have multiple patients

class Patient(models.Model):
    account = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients')

    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)

    phone = models.CharField(max_length=15)
    address = models.CharField(max_length=255)
    date_of_birth = models.DateField()

    GENDER_CHOICES = [
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other')
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)

    emergency_contact = models.CharField(max_length=255)
    emergency_contact_phone = models.CharField(max_length=15)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['account', 'first_name', 'last_name', 'date_of_birth'],
                name='unique_patient_per_account'
            )
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Doctor(models.Model):
    account = models.OneToOneField(User, on_delete=models.CASCADE)

    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)

    def __str__(self):
        return self.account.get_full_name()


class TimeSlot(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.doctor} - {self.date} {self.start_time}"


class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    time_slot = models.OneToOneField(TimeSlot, on_delete=models.CASCADE)

    STATUS_CHOICES = [
        ('BOOKED', 'Booked'),
        ('CANCELLED', 'Cancelled'),
        ('DONE', 'Completed')
    ]

    appointment_status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='BOOKED'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient} {self.time_slot.doctor} - {self.time_slot.start_time}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    phone = models.CharField(max_length=15)
    address = models.CharField(max_length=255)

    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True,
        default='default_profile.png'
    )

    def __str__(self):
        return self.user.get_full_name()
