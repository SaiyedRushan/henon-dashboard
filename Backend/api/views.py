from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ExchangeRate
from .serializers import ExchangeRateSerializer
import requests
from django.utils.dateparse import parse_date


@api_view(['GET'])
def get_exchange_rates(request):
  base_currency = request.GET.get('base_currency')
  target_currencies = request.GET.get('target_currencies')
  start_date = request.GET.get('start_date')
  end_date = request.GET.get('end_date')

  if not target_currencies or not start_date or not end_date:
    return Response({'error': 'target_currency, start_date and end_date are required'}, status=400)

  start_date=parse_date(start_date)
  end_date=parse_date(end_date)

  rates = {}
  for target_currency in target_currencies.split(','):
    exchange_rates = ExchangeRate.objects.filter(base_currency=base_currency, target_currency=target_currency, date__gte=start_date, date__lte=end_date)
    
    if exchange_rates.exists():
      print('Using cached exchange rates')
      serializer = ExchangeRateSerializer(exchange_rates, many=True)
      for rate in serializer.data:
          rates.setdefault(rate['date'], {})[target_currency] = rate['rate']
    else: 
      print('Calling api and saving exchange rates')
      response = requests.get(f'https://api.frankfurter.app/{start_date}..{end_date}', params={'from': base_currency, 'to': target_currency})
      if response.status_code == 200:
        data = response.json()
        for date, rate in data['rates'].items():
          rates.setdefault(date, {})[target_currency] = rate[target_currency]
          ExchangeRate.objects.create(base_currency=base_currency, target_currency=target_currency, date=date, rate=rate[target_currency])
      else:
        return Response({'error': 'Failed to fetch exchange rates'}, response.status_code)
  
  return Response({
    'amount': 1,
    'base': base_currency,
    'start_date': start_date,
    'end_date': end_date,
    'rates': rates
  })