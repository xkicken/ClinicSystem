from django.db import models
class Specialty(models.Model):
    specialtyID = models.AutoField(primary_key=True)
    specialtyName = models.CharField(max_length=255)

class Role(models.Model):
    roleID = models.AutoField(primary_key=True)
    roleName = models.CharField(max_length=255)

class Patient(models.Model):
    patientID = models.AutoField(primary_key=True)
    firstName = models.CharField(max_length=150)
    lastName = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.CharField(max_length=255)
    dateOfBirth = models.DateField()
    gender = models.CharField(max_length=10)
    emergencyContact = models.CharField(max_length=255)
    emergencyContactPhone = models.CharField(max_length=15)

class Doctor(models.Model):
    doctorID = models.AutoField(primary_key=True)
    firstName = models.CharField(max_length=150)
    lastName = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    specialty = models.ForeignKey(Specialty, on_delete=models.CASCADE)

class Appointment(models.Model):
    appointmentID = models.AutoField(primary_key=True)
    appointmentDate = models.DateField()
    appointmentTime = models.TimeField()
    patientID = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctorID = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    appointmentStatus = models.CharField(max_length=255)

class User(models.Model):
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=255)
    email = models.EmailField()
    role = models.ForeignKey(Role, on_delete=models.CASCADE)