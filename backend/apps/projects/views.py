from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer
from django.shortcuts import get_object_or_404

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(members=user)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if project.owner != request.user:
            return Response(
                {'error': 'Only project owner can add members'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            from django.contrib.auth.models import User
            user = User.objects.get(id=user_id)
            project.members.add(user)
            return Response({'status': 'member added'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if project.owner != request.user:
            return Response(
                {'error': 'Only project owner can remove members'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            from django.contrib.auth.models import User
            user = User.objects.get(id=user_id)
            if user == project.owner:
                return Response(
                    {'error': 'Cannot remove project owner'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            project.members.remove(user)
            return Response({'status': 'member removed'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
