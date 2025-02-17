from rest_framework import serializers
from .models import Task
from apps.projects.serializers import UserSerializer

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'created_at', 'updated_at',
                 'due_date', 'completed', 'completed_at', 'project', 'project_name',
                 'assigned_to', 'created_by', 'priority', 'status']
        read_only_fields = ['created_at', 'updated_at', 'created_by']

    def create(self, validated_data):
        user = self.context['request'].user
        task = Task.objects.create(created_by=user, **validated_data)
        return task
