from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import TaskViewSet, ProjectViewSet
from .auth_views import register_user, login_user, logout_user, get_user_profile

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register_user, name='register'),
    path('auth/login/', login_user, name='login'),
    path('auth/logout/', logout_user, name='logout'),
    path('auth/user/', get_user_profile, name='user-profile'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
