from django.contrib.auth.models import User, Group
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import *

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user_group, _ = Group.objects.get_or_create(name='User')
            user.groups.add(user_group)
            UserProfile.objects.create(user=user)
            return Response({
                'detail': 'Registered successfully.'
            }, status=status.HTTP_201_CREATED)
        return Response({
            'detail': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class MeView (APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        group = user.groups.first().name if user.groups.exists() else None
        profile_id = user.userprofile.id if hasattr(user, 'userprofile') else None
        return  Response({
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'group': group,
            'profile_id': profile_id,
        })