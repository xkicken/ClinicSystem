from django.db import models

#Core Tables

class Specialty(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Patient(models.Model):
    firstName = models.CharField(max_length=150)
    lastName = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.CharField(max_length=255)
    dateOfBirth = models.DateField()
    gender = models.CharField(max_length=10)
    emergencyContact = models.CharField(max_length=255)
    emergencyContactPhone = models.CharField(max_length=15)

    def __str__(self):
        return f"{self.firstName} {self.lastName}"

class Doctor(models.Model):
    firstName = models.CharField(max_length=150)
    lastName = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.firstName} {self.lastName}"


class TimeSlot(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    date = models.DateField()
    startTime = models.TimeField()
    endTime = models.TimeField()

    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.doctor} {self.date} {self.startTime} - {self.endTime}"


class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
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

    def __str__(self):
        return f"{self.patient} {self.timeSlot.startTime} - {self.timeSlot.endTime}"
