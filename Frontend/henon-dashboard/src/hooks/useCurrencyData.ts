import axios from "axios"
import { useEffect, useState } from "react"

interface CurrencyData {
  rates: {
    [date: string]: {
      [key: string]: any
    }
  }
  // You can add more properties if the API returns additional information
  [key: string]: any
}

export default function useCurrencyData(baseCurrency: string, currencies: string[], startDate: string, endDate: string) {
  const [data, setData] = useState<CurrencyData>({ rates: {} })

  useEffect(() => {
    const fetchData = async () => {
      const targetCurrencies = currencies.filter((currency) => currency !== baseCurrency).join(",")
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/exchange-rates?base_currency=${baseCurrency}&target_currencies=${targetCurrencies}&start_date=${startDate}&end_date=${endDate}`)
      const data = response.data
      setData(data)
    }

    fetchData()
  }, [baseCurrency, currencies, startDate, endDate])

  return data
}
