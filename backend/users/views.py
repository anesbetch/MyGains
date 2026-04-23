import os
import requests as http_requests
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser, PasswordResetToken
from .serializers import UserSerializer, UserRegisterSerializer, UserLoginSerializer


def _send_email(to_email, subject, html):
    api_key = os.getenv('RESEND_API_KEY', '')
    if not api_key:
        return
    try:
        http_requests.post(
            'https://api.resend.com/emails',
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={
                'from': 'MyGains <noreply@mygains.it.com>',
                'to': [to_email],
                'subject': subject,
                'html': html,
            },
            timeout=8,
        )
    except Exception:
        pass


def _send_welcome_email(to_email, first_name):
    html = f'''
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2 style="color:#1a3c34;">Welcome to MyGains, {first_name}! 💪</h2>
      <p>Your account has been created successfully. You're now part of the MyGains community.</p>
      <p>Start browsing our fitness products and reach your goals.</p>
      <a href="https://mygains.it.com/shop" style="display:inline-block;background:#40916c;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
        Start Shopping
      </a>
      <p style="color:#888;font-size:0.85rem;">MyGains — Your fitness journey starts here.</p>
    </div>
    '''
    _send_email(to_email, 'Welcome to MyGains! 💪', html)


def _send_reset_email(to_email, reset_url):
    api_key = os.getenv('RESEND_API_KEY', '')
    if not api_key:
        return
    try:
        http_requests.post(
            'https://api.resend.com/emails',
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            json={
                'from': 'MyGains <noreply@mygains.it.com>',
                'to': [to_email],
                'subject': 'Reset your MyGains password',
                'html': f'''
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
                  <h2 style="color:#1a3c34;">Reset your password</h2>
                  <p>Click the button below to reset your password. This link expires in 1 hour.</p>
                  <a href="{reset_url}" style="display:inline-block;background:#40916c;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin:16px 0;">
                    Reset Password
                  </a>
                  <p style="color:#888;font-size:0.85rem;">If you didn't request this, ignore this email.</p>
                </div>
                ''',
            },
            timeout=8,
        )
    except Exception:
        pass


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return CustomUser.objects.filter(id=self.request.user.id)
        return CustomUser.objects.none()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            _send_welcome_email(user.email, user.first_name or user.email.split('@')[0])
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(username=serializer.validated_data['email'],
                                password=serializer.validated_data['password'])
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def forgot_password(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        try:
            user = CustomUser.objects.get(email=email)
            token = PasswordResetToken.objects.create(user=user)
            frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            reset_url = f"{frontend_url}/reset-password?token={token.token}"
            _send_reset_email(user.email, reset_url)
        except CustomUser.DoesNotExist:
            pass
        return Response({'message': 'If that email is registered, a reset link has been sent.'})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def reset_password(self, request):
        token_value = request.data.get('token', '').strip()
        new_password = request.data.get('password', '').strip()
        if not token_value or not new_password:
            return Response({'error': 'Token and password are required'}, status=400)
        if len(new_password) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=400)
        try:
            token = PasswordResetToken.objects.get(token=token_value)
        except PasswordResetToken.DoesNotExist:
            return Response({'error': 'Invalid or expired reset link'}, status=400)
        if not token.is_valid():
            return Response({'error': 'This reset link has expired. Please request a new one.'}, status=400)
        token.user.set_password(new_password)
        token.user.save()
        token.used = True
        token.save()
        return Response({'message': 'Password updated successfully. You can now log in.'})
