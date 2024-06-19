from django.core.management.base import BaseCommand
from datetime import datetime, timedelta
from api.models import ExchangeRate
import requests

class Command(BaseCommand):
    help = 'Fetch and store exchange rates for the previous month'

    def add_arguments(self, parser):
        parser.add_argument('base_currency', type=str, help='Base currency')
        parser.add_argument('target_currencies', nargs='+', type=str, help='Target currencies')

    def handle(self, *args, **kwargs):
        base_currency = kwargs['base_currency']
        target_currencies = kwargs['target_currencies']

        today = datetime.today()
        first_day_of_current_month = today.replace(day=1)
        last_day_of_previous_month = first_day_of_current_month - timedelta(days=1)
        first_day_of_previous_month = last_day_of_previous_month.replace(day=1)

        for target_currency in target_currencies:
            response = requests.get(
                f'https://api.frankfurter.app/{first_day_of_previous_month.date()}..{last_day_of_previous_month.date()}',
                params={'from': base_currency, 'to': target_currency}
            )
            if response.status_code == 200:
                data = response.json()
                for date, rate in data['rates'].items():
                    ExchangeRate.objects.update_or_create(
                        base_currency=base_currency,
                        target_currency=target_currency,
                        date=date,
                        defaults={'rate': rate[target_currency]}
                    )
            else:
                self.stdout.write(self.style.ERROR(f"Failed to fetch data for {target_currency}"))

        self.stdout.write(self.style.SUCCESS('Successfully fetched and stored exchange rates for the previous month'))
