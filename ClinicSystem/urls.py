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
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('home/', home, name='home'),
    path('doctor_dashboard/', doctor_dashboard, name='doctor_dashboard'),
    path('user_dashboard/', user_dashboard, name='user_dashboard'),
    path("hijack/", include("hijack.urls")),
    path('accounts/', include('django.contrib.auth.urls')),
    path('calendar/', calendar, name='calendar'),
    path('booking/', booking, name='booking'),
    path('booking_confirm/', booking_confirm, name='booking_confirm'),
    path('patient/<int:id>/', patient_view, name='patient_view'),
    path('booking/view/<int:id>/', booking_view, name='booking_view'),
    path('profile/<int:id>/', profile, name='profile'),
    path('add_patient/', add_patient, name='add_patient'),
    path('delete_patient/<int:id>/', delete_patient, name='delete_patient')
]