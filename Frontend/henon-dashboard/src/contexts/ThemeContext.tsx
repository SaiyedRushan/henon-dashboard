import React, { createContext, useContext, useMemo, useState } from "react"
import { ThemeProvider, createTheme, PaletteMode } from "@mui/material"

interface ThemeContextProps {
  toggleColorMode: () => void
  mode: PaletteMode
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined)

export const ThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>("light")

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
  }

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  )

  return (
    <ThemeContext.Provider value={{ toggleColorMode, mode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProviderWrapper")
  }
  return context
}
