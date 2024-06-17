from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from .models import ExchangeRate

class ExchangeRateTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.base_currency = 'USD'
        self.target_currencies = ['CAD', 'EUR']
        self.start_date = (date.today() - timedelta(days=30)).strftime('%Y-%m-%d')
        self.end_date = date.today().strftime('%Y-%m-%d')
        
        # Pre-populate the database with some exchange rates
        self.existing_rate = ExchangeRate.objects.create(
            base_currency='USD',
            target_currency='CAD',
            date=self.start_date,
            rate=1.25
        )

    def test_fetch_exchange_rates_from_api(self):
        url = reverse('get_exchange_rates')
        response = self.client.get(url, {
            'base_currency': self.base_currency,
            'target_currencies': ','.join(self.target_currencies),
            'start_date': self.start_date,
            'end_date': self.end_date
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('rates', response.data)
        self.assertIn(self.start_date, response.data['rates'])
        self.assertIn('CAD', response.data['rates'][self.start_date])
        self.assertEqual(float(response.data['rates'][self.start_date]['CAD']), 1.25)

    def test_fetch_exchange_rates_and_store_in_db(self):
        new_start_date = (date.today() - timedelta(days=7)).strftime('%Y-%m-%d')
        new_end_date = date.today().strftime('%Y-%m-%d')

        url = reverse('get_exchange_rates')
        response = self.client.get(url, {
            'base_currency': self.base_currency,
            'target_currencies': ','.join(self.target_currencies),
            'start_date': new_start_date,
            'end_date': new_end_date
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('rates', response.data)

        # Check if the data is saved in the database
        for target_currency in self.target_currencies:
            for single_date in response.data['rates']:
                rate = float(response.data['rates'][single_date][target_currency])
                exists = ExchangeRate.objects.filter(
                    base_currency=self.base_currency,
                    target_currency=target_currency,
                    date=single_date,
                    # rate=rate
                ).exists()
                self.assertTrue(exists)
