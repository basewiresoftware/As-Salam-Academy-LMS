from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    USER_ROLE = [
        ('0', 'Student'),
        ('1', 'Teacher'),
        ('2', 'Admin'),
        ('3', 'Parent'),
    ]
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=USER_ROLE)

    def __str__(self):
        return self.username


class Course(models.Model):
    COURSE_TYPE = [
        ('0', 'Youth Group'),
        ('1', 'Hifz'),
        ('2', 'Islamic Studies'),
    ]
    course_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    teacher = models.ForeignKey(User, related_name='courses_taught', on_delete=models.CASCADE, limit_choices_to={'role': '1'})
    course_type = models.CharField(max_length=10, choices=COURSE_TYPE)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    def __str__(self):
        return self.title


class Teacher(models.Model):
    teacher = models.OneToOneField(User, related_name='teacher_profile', on_delete=models.CASCADE, limit_choices_to={'role': '1'})
    address = models.TextField(max_length=500, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.teacher.username


class Parent(models.Model):
    parent = models.OneToOneField(User, related_name='parent_profile', on_delete=models.CASCADE, limit_choices_to={'role': '3'})
    address = models.TextField(max_length=500, blank=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.parent.username


class Child(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female')]
    PROGRAM_CHOICES = [
        ('quran', "Qur'an"),
        ('youth_program', 'Youth Program'),
        ('islamic_studies', 'Islamic Studies'),
    ]

    parent = models.ForeignKey(Parent, related_name='children', on_delete=models.CASCADE)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    program = models.CharField(max_length=20, choices=PROGRAM_CHOICES, blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Enrollment(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
    ]
    child = models.ForeignKey(Child, related_name='enrollments', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='enrollments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='pending')
    transaction_id = models.CharField(max_length=50, blank=True, null=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('child', 'course')

    def __str__(self):
        return f"{self.child} -> {self.course} ({self.payment_status})"
