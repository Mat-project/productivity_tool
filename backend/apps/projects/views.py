from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Project, ProjectTask
from .serializers import (
    ProjectSerializer,
    ProjectDetailSerializer,
    ProjectTaskSerializer
)

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            Q(owner=user) | Q(team_members=user)
        ).distinct()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer

    @action(detail=True, methods=['post'])
    def add_task(self, request, pk=None):
        project = self.get_object()
        serializer = ProjectTaskSerializer(data={
            'project': project.id,
            'task_id': request.data.get('task_id')
        })
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def remove_task(self, request, pk=None):
        project = self.get_object()
        task_id = request.data.get('task_id')
        
        try:
            project_task = ProjectTask.objects.get(
                project=project,
                task_id=task_id
            )
            project_task.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProjectTask.DoesNotExist:
            return Response(
                {'error': 'Task not found in project'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def add_team_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if project.owner != request.user:
            return Response(
                {'error': 'Only project owner can add team members'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        project.team_members.add(user_id)
        return Response(status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def remove_team_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if project.owner != request.user:
            return Response(
                {'error': 'Only project owner can remove team members'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        project.team_members.remove(user_id)
        return Response(status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        user = request.user
        projects = self.get_queryset()
        
        return Response({
            'total_projects': projects.count(),
            'owned_projects': projects.filter(owner=user).count(),
            'team_projects': projects.filter(team_members=user).exclude(owner=user).count(),
            'completed_projects': projects.filter(status='completed').count(),
            'in_progress_projects': projects.filter(status='in_progress').count(),
            'planning_projects': projects.filter(status='planning').count(),
            'on_hold_projects': projects.filter(status='on_hold').count(),
        })
