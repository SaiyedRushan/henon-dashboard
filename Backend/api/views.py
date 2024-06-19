from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ExchangeRate
from .serializers import ExchangeRateSerializer
import requests
from django.utils.dateparse import parse_date
from rest_framework.renderers import JSONRenderer

# from django_ratelimit.decorators import ratelimit
from asgiref.sync import sync_to_async
import asyncio
import aiohttp
from datetime import timedelta, datetime

@sync_to_async
def save_to_db(base_currency, target_currency, rates):
    for date, rate in rates.items():
        ExchangeRate.objects.update_or_create(base_currency=base_currency, target_currency=target_currency, date=date, defaults={'rate': rate[target_currency]})

@sync_to_async
def fetch_from_db(base_currency, target_currency, start_date, end_date):
    return ExchangeRate.objects.filter(base_currency=base_currency, target_currency=target_currency, date__gte=start_date, date__lte=end_date)

async def fetch_from_api(base_currency, target_currency, start_date, end_date):
    async with aiohttp.ClientSession() as session:
        async with session.get(f'https://api.frankfurter.app/{start_date}..{end_date}', params={'from': base_currency, 'to': target_currency}) as response:
            if response.status == 200:
                data = await response.json()
                return data['rates']
            else:
                return None


# @ratelimit(key='ip', rate='20/m')
async def get_exchange_rates(request):
  base_currency = request.GET.get('base_currency')
  target_currencies = request.GET.get('target_currencies')
  start_date = request.GET.get('start_date')
  end_date = request.GET.get('end_date')

  if not target_currencies or not start_date or not end_date:
    return Response({'error': 'target_currency, start_date and end_date are required'}, status=400)

  start_date=parse_date(start_date)
  end_date=parse_date(end_date)

  rates = {}
  tasks = []

  for target_currency in target_currencies.split(','):
    exchange_rates = await fetch_from_db(base_currency, target_currency, start_date, end_date)
    
    if await sync_to_async(exchange_rates.exists)():  
      print('Using cached exchange rates')
      exchange_rates_list = await sync_to_async(list)(exchange_rates)
      serializer = ExchangeRateSerializer(exchange_rates_list, many=True)
      for rate in serializer.data:
          rates.setdefault(rate['date'], {})[target_currency] = rate['rate']
    else: 
      print('Calling api and saving exchange rates')
      fetched_rates = await fetch_from_api(base_currency, target_currency, start_date, end_date)
      if fetched_rates:
        for date, rate in fetched_rates.items():
            rates.setdefault(date, {})[target_currency] = rate[target_currency]
            
        # Schedule saving the data to the database asynchronously
        task = asyncio.create_task(save_to_db(base_currency, target_currency, fetched_rates))
        tasks.append(task)
      else:
        return Response({'error': 'Failed to fetch exchange rates'}, status=500)
  
  if tasks: 
    await asyncio.gather(*tasks)
  
  response = Response({
    'amount': 1,
    'base': base_currency,
    'start_date': start_date,
    'end_date': end_date,
    'rates': rates
  }, status=200)

  response.accepted_renderer = JSONRenderer()
  response.accepted_media_type = 'application/json'
  response.renderer_context = {}
  
  return response