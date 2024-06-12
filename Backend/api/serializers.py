from rest_framework import serializers
from .models import ExchangeRate

class ExchangeRateSerializer(serializers.ModelSerializer):
  class Meta:
      model = ExchangeRate
      fields = '__all__'