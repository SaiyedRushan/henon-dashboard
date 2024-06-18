import axios from "axios"
import { useEffect, useState } from "react"

interface CurrencyData {
  rates: {
    [date: string]: {
      [key: string]: any
    }
  }
  [key: string]: any
}

export default function useCurrencyData(baseCurrency: string, currencies: string[], startDate: string, endDate: string) {
  const [data, setData] = useState<CurrencyData>({ rates: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData({ rates: {} })
        setLoading(true)
        const targetCurrencies = currencies.filter((currency) => currency !== baseCurrency).join(",")
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/exchange-rates/?base_currency=${baseCurrency}&target_currencies=${targetCurrencies}&start_date=${startDate}&end_date=${endDate}`)
        const data = response.data
        setData(data)
      } catch (err: any) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [baseCurrency, currencies, startDate, endDate])

  return { data, loading, error }
}
