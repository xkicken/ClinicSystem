"""
URL configuration for ClinicSystem project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from appointment.views import *
urlpatterns = [
    path('/django/admin/', admin.site.urls),
    path('/django/accounts/', include('django.contrib.auth.urls')),
    path('/django/home/', home, name='home'),
    path('/django/register/', register, name='register'),
    path('/django/user_dashboard/', user_dashboard, name='user_dashboard'),
    path("/django/hijack/", include("hijack.urls")),
    path('/django/accounts/', include('django.contrib.auth.urls')),
    path('/django/calendar/', calendar, name='calendar'),
    path('/django/booking/', booking, name='booking'),
    path('/django/booking_confirm/', booking_confirm, name='booking_confirm'),
    path('/django/patient/<int:id>/', patient_view, name='patient_view'),
    path('/django/booking/view/<int:id>/', booking_view, name='booking_view'),
    path('/django/profile/<int:id>/', profile, name='profile'),
    path('/django/add_patient/', add_patient, name='add_patient'),
    path('/django/delete_patient/<int:id>/', delete_patient, name='delete_patient'),
    path('/django/doctor_dashboard/', doctor_dashboard, name='doctor_dashboard'),
    path('/django/admin_dashboard/', admin_dashboard, name='admin_dashboard'),
    path('/django/doctor/<int:id>/', doctor_view, name='doctor_view'),
    path('/django/delete_doctor/<int:id>/', delete_doctor, name='delete_doctor'),
    path('/django/add_doctor/', add_doctor, name='add_doctor'),
    path('/api/', include('api.urls'))
]
