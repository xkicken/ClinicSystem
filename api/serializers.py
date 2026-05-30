from rest_framework import serializers
from django.contrib.auth.models import User
from appointment.models import Specialty, Patient, Doctor, TimeSlot, Appointment, UserProfile


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'phone', 'address', 'profile_picture']


class DoctorSerializer(serializers.ModelSerializer):
    account = UserSerializer(read_only=True)
    specialty = SpecialtySerializer(read_only=True)
    specialty_id = serializers.PrimaryKeyRelatedField(
        queryset=Specialty.objects.all(), source='specialty', write_only=True
    )

    class Meta:
        model = Doctor
        fields = ['id', 'account', 'specialty', 'specialty_id', 'phone']


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'address',
            'date_of_birth', 'gender', 'emergency_contact', 'emergency_contact_phone'
        ]
        # 'account' is set automatically from request.user, not exposed


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'doctor', 'date', 'start_time', 'end_time', 'booked']


class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(), source='patient', write_only=True
    )
    time_slot = TimeSlotSerializer(read_only=True)
    time_slot_id = serializers.PrimaryKeyRelatedField(
        queryset=TimeSlot.objects.all(), source='time_slot', write_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_id', 'time_slot', 'time_slot_id',
            'appointment_status', 'created_at', 'updated_at'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)