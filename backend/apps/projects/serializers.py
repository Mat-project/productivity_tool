from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectTask
from api.serializers import TaskSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    team_members = UserSerializer(many=True, read_only=True)
    team_member_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    task_count = serializers.SerializerMethodField()
    completed_task_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'status', 'owner',
            'team_members', 'team_member_ids', 'start_date', 'end_date',
            'created_at', 'updated_at', 'task_count', 'completed_task_count'
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def get_task_count(self, obj):
        return obj.tasks.count()

    def get_completed_task_count(self, obj):
        return obj.tasks.filter(task__status='completed').count()

    def create(self, validated_data):
        team_member_ids = validated_data.pop('team_member_ids', [])
        project = Project.objects.create(
            owner=self.context['request'].user,
            **validated_data
        )
        if team_member_ids:
            team_members = User.objects.filter(id__in=team_member_ids)
            project.team_members.set(team_members)
        return project

    def update(self, instance, validated_data):
        team_member_ids = validated_data.pop('team_member_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if team_member_ids is not None:
            team_members = User.objects.filter(id__in=team_member_ids)
            instance.team_members.set(team_members)
        return instance

class ProjectTaskSerializer(serializers.ModelSerializer):
    task = TaskSerializer(read_only=True)
    task_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ProjectTask
        fields = ['id', 'project', 'task', 'task_id', 'created_at']
        read_only_fields = ['created_at']

    def create(self, validated_data):
        return ProjectTask.objects.create(**validated_data)

class ProjectDetailSerializer(ProjectSerializer):
    tasks = TaskSerializer(many=True, source='tasks.task_set', read_only=True)
