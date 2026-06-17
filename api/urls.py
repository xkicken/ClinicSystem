from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('auth/register', views.RegisterView.as_view()),
    path('auth/login', views.LoginView.as_view()),
    path('auth/refresh', views.RefreshView.as_view()),
    path('auth/me/', views.MeView.as_view()),
    path('dashboard/user/', views.UserDashboardView.as_view()),
    path('patient/<int:id>/appointment/next/', views.PatientNextAppointmentView.as_view())
]
