from celery import shared_task
from .models import ExchangeRate
from django.core.management import call_command

@shared_task
def save_rates_to_db(rates, base_currency, target_currency):
  print(f'Saving exchange rates for {base_currency} to {target_currency}')
  for date, rate in rates.items():
    ExchangeRate.objects.update_or_create(base_currency=base_currency, target_currency=target_currency, date=date, rate=rate[target_currency])

@shared_task
def run_management_command(base_currency, target_currencies):
  call_command('fetch_exchange_rates', base_currency, *target_currencies)
