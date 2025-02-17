from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_projects')
    members = models.ManyToManyField(User, related_name='member_projects')
    status = models.CharField(
        max_length=20,
        choices=[
            ('planning', 'Planning'),
            ('in_progress', 'In Progress'),
            ('completed', 'Completed'),
            ('on_hold', 'On Hold')
        ],
        default='planning'
    )
    deadline = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']
