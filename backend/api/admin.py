from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Child, Course, Enrollment, Parent, Teacher, User


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'email', 'first_name', 'last_name')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')


admin.site.register(User, CustomUserAdmin)
admin.site.register(Course)
admin.site.register(Teacher)
admin.site.register(Parent)
admin.site.register(Child)
admin.site.register(Enrollment)
