import uuid

from django.db import transaction
from rest_framework import serializers

from .models import Child, Course, Enrollment, Parent, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_superuser']


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'amount', 'payment_status', 'transaction_id', 'enrolled_at']


class ChildSerializer(serializers.ModelSerializer):
    enrollments = EnrollmentSerializer(many=True, read_only=True)

    class Meta:
        model = Child
        fields = ['id', 'first_name', 'last_name', 'date_of_birth', 'gender', 'program', 'enrollments']


class EnrolledChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = ['id', 'first_name', 'last_name']


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    child = EnrolledChildSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'child', 'payment_status', 'enrolled_at']


class TeacherCourseSerializer(serializers.ModelSerializer):
    enrollments = CourseEnrollmentSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'course_id', 'title', 'description', 'course_type', 'price', 'enrollments']


class ChildRegistrationSerializer(serializers.Serializer):
    """One child entry submitted as part of parent registration."""
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=Child.GENDER_CHOICES, required=False, allow_null=True)
    program = serializers.ChoiceField(choices=Child.PROGRAM_CHOICES, required=False, allow_null=True)
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=False, allow_null=True)


def mock_charge(amount):
    """Simulated payment gateway: always succeeds and returns a fake transaction id."""
    return f"MOCK-{uuid.uuid4().hex[:12]}"


class ParentRegisterSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    password = serializers.CharField(write_only=True)
    address = serializers.CharField()
    phone_number = serializers.CharField(required=False, allow_blank=True)
    children = ChildRegistrationSerializer(many=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

    def validate_children(self, value):
        if not value:
            raise serializers.ValidationError("At least one child is required")
        return value

    def create(self, validated_data):
        children_data = validated_data.pop('children')

        with transaction.atomic():
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                password=validated_data['password'],
                role='3',
            )
            parent = Parent.objects.create(
                parent=user,
                address=validated_data['address'],
                phone_number=validated_data.get('phone_number', ''),
            )
            for child_data in children_data:
                course = child_data.pop('course', None)
                child = Child.objects.create(parent=parent, **child_data)
                if course is not None:
                    Enrollment.objects.create(
                        child=child,
                        course=course,
                        amount=course.price,
                        payment_status='paid',
                        transaction_id=mock_charge(course.price),
                    )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.USER_ROLE)
