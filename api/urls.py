from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('auth/register', views.RegisterView.as_view()),
    path('auth/login', views.LoginView.as_view()),
    path('auth/refresh', views.RefreshView.as_view()),
    path('auth/me/', views.MeView.as_view()),
    path('dashboard/user/', views.UserDashboardView.as_view()),
    path('patient/<int:id>/appointment/next/', views.PatientNextAppointmentView.as_view()),
    path('appointments/', views.AppointmentListCreateView.as_view()),
    path('doctors/', views.DoctorListView.as_view()),
    path('timeslots/', views.TimeSlotListView.as_view()),
    path('calendar/', views.CalendarView.as_view()),
    path('appointments/<int:id>/', views.AppointmentDetailView.as_view()),
    path('patients/', views.PatientListCreateView.as_view()),
    path('patients/<int:id>/', views.PatientDetailView.as_view()),
    path('profiles/<int:id>/', views.ProfileView.as_view()),
    path('auth/change-password/', views.ChangePasswordView.as_view()),
    path('dashboard/doctor/', views.DoctorDashboardView.as_view()),
]
