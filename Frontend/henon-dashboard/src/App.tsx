import { useMemo, useState } from "react"

import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import useCurrencyData from "./hooks/useCurrencyData"
import LineChart from "./components/LineChart"
import Grid from "./components/Grid"
import { ClipLoader } from "react-spinners"

function App() {
  const currencies = useMemo(() => ["USD", "CAD", "EUR"], [])
  const today = new Date().toISOString().split("T")[0]
  const twoYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().split("T")[0]

  const [baseCurrency, setBaseCurrency] = useState("USD")
  const [startDate, setStartDate] = useState(twoYearsAgo)
  const [endDate, setEndDate] = useState(today)

  const { data, loading, error }: { data: any; loading: boolean; error: any } = useCurrencyData(baseCurrency, currencies, startDate, endDate)

  const getDateMonthsAgo = (monthsAgo: number): string => {
    const date = new Date()
    date.setMonth(date.getMonth() - monthsAgo)
    return date.toISOString().split("T")[0]
  }

  const getDateYearsAgo = (yearsAgo: number): string => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - yearsAgo)
    return date.toISOString().split("T")[0]
  }

  if (error) return <p>Error: {error.message}</p>

  return (
    <Container>
      <Box display={"flex"} justifyContent={"center"}>
        <h1>Exchange Rates</h1>
      </Box>

      <Box gap={2} m={1} display={"flex"} justifyContent={"center"}>
        <TextField
          id='startDate'
          label='Start Date'
          type='date'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: twoYearsAgo,
            max: today,
          }}
        />
        <TextField
          id='endDate'
          label='End Date'
          type='date'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            min: twoYearsAgo,
            max: today,
          }}
        />
        <FormControl>
          <InputLabel id='base-label'>From</InputLabel>
          <Select value={baseCurrency} labelId='base-label' label='From' onChange={(e) => setBaseCurrency(e.target.value as string)}>
            {currencies.map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currency}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box justifyContent={"center"} display={"flex"} m={3} gap={2}>
        <Button variant='contained' onClick={() => setStartDate(getDateMonthsAgo(1))}>
          1M
        </Button>
        <Button variant='contained' onClick={() => setStartDate(getDateMonthsAgo(3))}>
          3M
        </Button>
        <Button variant='contained' onClick={() => setStartDate(getDateMonthsAgo(6))}>
          6M
        </Button>
        <Button variant='contained' onClick={() => setStartDate(getDateYearsAgo(1))}>
          1Y
        </Button>
        <Button variant='contained' onClick={() => setStartDate(twoYearsAgo)}>
          2Y
        </Button>
      </Box>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          Loading <ClipLoader size={50} color={"#123abc"} loading={loading} />
        </div>
      ) : (
        <>
          <div>
            <LineChart data={data} currencies={currencies} baseCurrency={baseCurrency} />
          </div>
          <Grid data={data} currencies={currencies} baseCurrency={baseCurrency} />
        </>
      )}
    </Container>
  )
}

export default App
