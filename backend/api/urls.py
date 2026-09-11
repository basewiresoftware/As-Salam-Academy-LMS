from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views import (
    api_root,
    ChildCreateView,
    CourseView,
    CurrentUserView,
    LoginView,
    ParentDashboardView,
    PayEnrollmentView,
    RegisterView,
    TeacherDashboardView,
)

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('courses/', CourseView.as_view(), name='course-list-create'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('current_user/', CurrentUserView.as_view(), name='current-user'),
    path('teacher-dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    path('parent-dashboard/', ParentDashboardView.as_view(), name='parent-dashboard'),
    path('children/', ChildCreateView.as_view(), name='child-create'),
    path('enrollments/<int:pk>/pay/', PayEnrollmentView.as_view(), name='enrollment-pay'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api-auth/', include('rest_framework.urls')), 
]
