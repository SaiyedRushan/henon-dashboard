from django.urls import path
from .views import get_exchange_rates

urlpatterns = [
    path('exchange-rates/', get_exchange_rates, name='get_exchange_rates'),
]