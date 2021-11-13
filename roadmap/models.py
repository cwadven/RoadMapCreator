from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

from accounts.models import Profile


class RoadMap(models.Model):
    title = models.CharField(max_length=64, db_index=True)
    description = models.TextField(null=True)
    account = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True)
    image = models.ImageField(default=None, upload_to='roadmap_image/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class BaseNode(models.Model):
    account = models.ForeignKey(Profile, on_delete=models.CASCADE)
    roadmap = models.ForeignKey(RoadMap, on_delete=models.CASCADE)
    name = models.CharField(max_length=64, db_index=True)
    description = models.TextField(null=True)
    in_degree = models.ManyToManyField("self", through="BaseNodeInDegree", symmetrical=False, related_name="income_degree", null=True, blank=True)
    out_degree = models.ManyToManyField("self", through="BaseNodeOutDegree", symmetrical=False, related_name="outcome_degree", null=True, blank=True)
    difficulty = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(5)])
    display_level = models.PositiveIntegerField()
    hex_color_code = models.CharField(max_length=9)
    active_count = models.IntegerField(default=0, db_index=True)
    image = models.ImageField(default=None, upload_to='node_image/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class UserNode(models.Model):
    account = models.ForeignKey(Profile, on_delete=models.CASCADE)
    active_node = models.ForeignKey(BaseNode, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.account} {self.active_node}"


class BaseNodeInDegree(models.Model):
    from_basenode = models.ForeignKey(BaseNode, on_delete=models.CASCADE, related_name='in_degree_from')
    to_basenode = models.ForeignKey(BaseNode, on_delete=models.CASCADE, related_name='in_degree_to')
    weight = models.IntegerField(default=0)


class BaseNodeOutDegree(models.Model):
    from_basenode = models.ForeignKey(BaseNode, on_delete=models.CASCADE, related_name='out_degree_from')
    to_basenode = models.ForeignKey(BaseNode, on_delete=models.CASCADE, related_name='out_degree_to')
    weight = models.IntegerField(default=0)
