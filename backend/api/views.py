from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Task, Project
from .serializers import TaskSerializer, ProjectSerializer, UserSerializer
from django.utils import timezone

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'due_date', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user)
        
        # Status filter
        status = self.request.query_params.get('status', None)
        if status and status != 'all':
            queryset = queryset.filter(status=status)
            
        # Priority filter
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
            
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
            
        # Due date filter
        due_date = self.request.query_params.get('due_date', None)
        if due_date == 'overdue':
            queryset = queryset.filter(due_date__lt=timezone.now())
        elif due_date == 'today':
            today = timezone.now().date()
            queryset = queryset.filter(due_date__date=today)
        elif due_date == 'week':
            week_start = timezone.now().date()
            week_end = week_start + timezone.timedelta(days=7)
            queryset = queryset.filter(due_date__date__range=[week_start, week_end])
            
        return queryset

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        tasks = self.get_queryset()
        overdue_count = tasks.filter(
            status__in=['todo', 'in_progress'],
            due_date__lt=timezone.now()
        ).count()
        
        return Response({
            'total': tasks.count(),
            'completed': tasks.filter(status='completed').count(),
            'in_progress': tasks.filter(status='in_progress').count(),
            'todo': tasks.filter(status='todo').count(),
            'overdue': overdue_count,
            'high_priority': tasks.filter(priority='high').count(),
        })

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        project = self.get_object()
        tasks = Task.objects.filter(project=project)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        projects = self.get_queryset()
        return Response({
            'total': projects.count(),
            'active': projects.filter(status='active').count(),
            'completed': projects.filter(status='completed').count(),
            'on_hold': projects.filter(status='on_hold').count(),
        })
