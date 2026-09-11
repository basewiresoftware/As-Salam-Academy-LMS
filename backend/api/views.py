from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Child, Course, Enrollment, Parent, User
from .serializers import (
    ChildRegistrationSerializer,
    ChildSerializer,
    CourseSerializer,
    EnrollmentSerializer,
    LoginSerializer,
    ParentRegisterSerializer,
    TeacherCourseSerializer,
    UserSerializer,
    mock_charge,
)


@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'register': reverse('register', request=request, format=format),
        'login': reverse('login', request=request, format=format),
        'courses': reverse('course-list-create', request=request, format=format),
        'teacher-dashboard': reverse('teacher-dashboard', request=request, format=format),
        'parent-dashboard': reverse('parent-dashboard', request=request, format=format),
        'children': reverse('child-create', request=request, format=format),
    })


class CourseView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = ParentRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'role': user.role,
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        role = serializer.validated_data['role']

        try:
            user = User.objects.get(username=username, role=role)
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
            'role': user.role,
        }, status=status.HTTP_200_OK)


class TeacherDashboardView(APIView):
    """Classes taught by the logged-in teacher, with enrolled children per class."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != '1':
            return Response({"detail": "Not a teacher account"}, status=status.HTTP_403_FORBIDDEN)
        courses = Course.objects.filter(teacher=request.user).prefetch_related('enrollments__child')
        return Response(TeacherCourseSerializer(courses, many=True).data)


class CurrentUserView(APIView):
    """The logged-in user's own profile, used to restore a session on app relaunch."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ParentDashboardView(APIView):
    """The logged-in parent's children, with the classes each child is enrolled in."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != '3':
            return Response({"detail": "Not a parent account"}, status=status.HTTP_403_FORBIDDEN)
        try:
            parent = request.user.parent_profile
        except Parent.DoesNotExist:
            return Response({"detail": "Parent profile not found"}, status=status.HTTP_404_NOT_FOUND)
        children = parent.children.prefetch_related('enrollments__course')
        return Response(ChildSerializer(children, many=True).data)


class ChildCreateView(APIView):
    """Lets an already-registered parent add a child from the dashboard,
    optionally enrolling them in a course right away (unpaid until /pay/)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != '3':
            return Response({"detail": "Not a parent account"}, status=status.HTTP_403_FORBIDDEN)
        try:
            parent = request.user.parent_profile
        except Parent.DoesNotExist:
            return Response({"detail": "Parent profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChildRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        course = data.pop('course', None)

        child = Child.objects.create(parent=parent, **data)
        if course is not None:
            Enrollment.objects.create(child=child, course=course, amount=course.price)

        child.refresh_from_db()
        return Response(ChildSerializer(child).data, status=status.HTTP_201_CREATED)


class PayEnrollmentView(APIView):
    """Marks one of the logged-in parent's pending enrollments as paid."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != '3':
            return Response({"detail": "Not a parent account"}, status=status.HTTP_403_FORBIDDEN)
        try:
            parent = request.user.parent_profile
        except Parent.DoesNotExist:
            return Response({"detail": "Parent profile not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            enrollment = Enrollment.objects.select_related('child', 'course').get(pk=pk)
        except Enrollment.DoesNotExist:
            return Response({"detail": "Enrollment not found"}, status=status.HTTP_404_NOT_FOUND)

        if enrollment.child.parent_id != parent.id:
            return Response({"detail": "Not your child's enrollment"}, status=status.HTTP_403_FORBIDDEN)

        if enrollment.payment_status != 'paid':
            enrollment.payment_status = 'paid'
            enrollment.transaction_id = mock_charge(enrollment.amount)
            enrollment.save()

        return Response(EnrollmentSerializer(enrollment).data)
