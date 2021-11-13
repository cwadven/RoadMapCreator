from django.contrib.auth.models import AbstractUser


class Profile(AbstractUser):
    def __str__(self):
        return f"{self.username}"
