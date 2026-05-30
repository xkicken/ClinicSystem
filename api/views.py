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