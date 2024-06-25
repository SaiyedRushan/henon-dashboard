import { useEffect, useMemo, useState } from "react"

import { Box, Button, Collapse, Container, CssBaseline, Fade, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import useCurrencyData from "./hooks/useCurrencyData"
import LineChart from "./components/LineChart"
import Grid from "./components/Grid"
import { ClipLoader } from "react-spinners"
import { useThemeContext } from "./contexts/ThemeContext"
import LightModeIcon from "@mui/icons-material/LightMode"
import DarkModeIcon from "@mui/icons-material/DarkMode"

function App() {
  const currencies = useMemo(() => ["USD", "CAD", "EUR"], [])
  const today = new Date().toISOString().split("T")[0]
  const twoYearsAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString().split("T")[0]

  const [baseCurrency, setBaseCurrency] = useState(() => localStorage.getItem("baseCurrency") || "USD")
  const [startDate, setStartDate] = useState(localStorage.getItem("startDate") || twoYearsAgo)
  const [endDate, setEndDate] = useState(localStorage.getItem("endDate") || today)
  const [fadeIn, setFadeIn] = useState(false)

  const { data, loading, error }: { data: any; loading: boolean; error: any } = useCurrencyData(baseCurrency, currencies, startDate, endDate)
  const { toggleColorMode, mode } = useThemeContext()

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

  useEffect(() => {
    setFadeIn(true)
  }, [])

  useEffect(() => {
    localStorage.setItem("baseCurrency", baseCurrency)
    localStorage.setItem("startDate", startDate)
    localStorage.setItem("endDate", endDate)
  }, [baseCurrency, startDate, endDate])

  if (error) return <p>Error: {error.message}</p>
  return (
    <Container>
      <CssBaseline />
      <Fade in={fadeIn} timeout={3000}>
        <Box display={"flex"} justifyContent={"center"}>
          <h1>Exchange Rates</h1>
          <Button onClick={toggleColorMode}>{mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}</Button>
        </Box>
      </Fade>

      <Collapse in={fadeIn} timeout={1000}>
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
      </Collapse>

      <Collapse in={fadeIn} timeout={1000}>
        <Box justifyContent={"center"} display={"flex"} m={3} gap={2}>
          <Button variant='contained' onClick={() => setStartDate(getDateMonthsAgo(1))} className='shift-up'>
            1M
          </Button>
          <Button variant='contained' onClick={() => setStartDate(getDateMonthsAgo(3))} className='shift-up'>
            3M
          </Button>
          <Button variant='contained' onClick={() => setStartDate(getDateMonthsAgo(6))} className='shift-up'>
            6M
          </Button>
          <Button variant='contained' onClick={() => setStartDate(getDateYearsAgo(1))} className='shift-up'>
            1Y
          </Button>
          <Button variant='contained' onClick={() => setStartDate(twoYearsAgo)} className='shift-up'>
            2Y
          </Button>
        </Box>
      </Collapse>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          Loading <ClipLoader size={50} color={"#123abc"} loading={loading} />
        </div>
      ) : (
        <>
          <LineChart data={data} currencies={currencies} baseCurrency={baseCurrency} />
          <Grid data={data} currencies={currencies} baseCurrency={baseCurrency} />
        </>
      )}
    </Container>
  )
}

export default App
