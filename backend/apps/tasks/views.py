from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from django.utils import timezone

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(
            project__members=user
        ).select_related('project', 'assigned_to', 'created_by')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        task = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            from django.contrib.auth.models import User
            user = User.objects.get(id=user_id)
            if user not in task.project.members.all():
                return Response(
                    {'error': 'User is not a member of the project'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            task.assigned_to = user
            task.save()
            return Response({'status': 'task assigned'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.completed = True
        task.completed_at = timezone.now()
        task.status = 'done'
        task.save()
        return Response({'status': 'task completed'})

    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        task = self.get_object()
        task.completed = False
        task.completed_at = None
        task.status = 'todo'
        task.save()
        return Response({'status': 'task reopened'})
