import { useMemo, useState } from "react"

import { Box, Container, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import useCurrencyData from "./hooks/useCurrencyData"
import LineChart from "./components/LineChart"
import Grid from "./components/Grid"

function App() {
  const currencies = useMemo(() => ["USD", "CAD", "EUR"], [])
  const today = new Date().toISOString().split("T")[0]
  const twoYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().split("T")[0]

  const [baseCurrency, setBaseCurrency] = useState("USD")
  const [startDate, setStartDate] = useState(twoYearsAgo)
  const [endDate, setEndDate] = useState(today)

  const data = useCurrencyData(baseCurrency, currencies, startDate, endDate)

  return (
    <Container>
      <h1>Henon Dashboard</h1>

      <Box gap={2} m={1} display={"flex"}>
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

      <LineChart data={data} currencies={currencies} baseCurrency={baseCurrency} />

      <Grid data={data} currencies={currencies} baseCurrency={baseCurrency} />
    </Container>
  )
}

export default App
