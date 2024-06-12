import { Line } from "react-chartjs-2"
import { ChartData, ChartOptions } from "chart.js"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"
import { useEffect, useState } from "react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const options: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Currency Exchange Rates",
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Date",
      },
    },
    y: {
      title: {
        display: true,
        text: "Exchange Rate",
      },
    },
  },
}

const LineChart = ({ data, currencies, baseCurrency }: { data: any; currencies: any[]; baseCurrency: string }) => {
  const [chartData, setChartData] = useState<ChartData<"line">>({ labels: [], datasets: [] })
  useEffect(() => {
    if (data) {
      const targetCurrencies = currencies.filter((currency) => currency !== baseCurrency).join(",")
      const labels = Object.keys(data.rates)
      const datasets = targetCurrencies.split(",").map((currency, index) => {
        const currencyRates = labels.map((date) => data.rates[date][currency])
        return {
          label: `${currency}`,
          data: currencyRates,
          borderColor: `hsl(${(index * 360) / targetCurrencies.length}, 100%, 40%)`,
          backgroundColor: `hsla(${(index * 360) / targetCurrencies.length}, 100%, 40%, 0.5)`,
        }
      })
      const chartData = {
        labels,
        datasets,
      }
      setChartData(chartData)
    }
  }, [data, baseCurrency, currencies])

  return (
    <div style={{ marginBottom: 20, position: "relative", minWidth: 300, minHeight: 200 }}>
      <Line data={chartData} options={options} />
    </div>
  )
}

export default LineChart
