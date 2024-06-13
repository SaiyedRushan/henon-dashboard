import { Line } from "react-chartjs-2"
import { ChartData, ChartOptions } from "chart.js"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js"
import { useEffect, useState } from "react"
import crosshair, { CrosshairOptions } from "chartjs-plugin-crosshair"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, crosshair)

const options: ChartOptions<"line"> & { plugins: { crosshair: CrosshairOptions } } = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Currency Exchange Rates",
    },
    tooltip: {
      mode: "index",
      intersect: false,
    },
    crosshair: {
      zoom: {
        enabled: true,
      },
      snap: {
        enabled: true,
      },
    },
  },
  scales: {
    x: {
      stacked: true,
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

  return <Line data={chartData} options={options} />
}

export default LineChart
