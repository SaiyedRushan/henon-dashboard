import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"
import { ColDef } from "ag-grid-community"
import { useEffect, useState } from "react"
import useDeviceType from "../hooks/useDeviceType"

export default function Grid({ data, currencies, baseCurrency }: { data: any; currencies: any[]; baseCurrency: string }) {
  const [rowData, setRowData] = useState([])
  const [colDefs, setColDefs] = useState<ColDef[]>([])
  const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  }
  const isMobile = useDeviceType()

  useEffect(() => {
    if (data) {
      const rowData = Object.keys(data.rates).map((date) => ({
        date,
        ...data.rates[date],
      }))

      const targetCurrencies = currencies.filter((currency) => currency !== baseCurrency)
      const colDefs = [{ headerName: "Date", field: "date" }, ...targetCurrencies.map((currency) => ({ headerName: currency, field: currency }))]

      setColDefs(colDefs)
      setRowData(rowData as any)
    }
  }, [data, baseCurrency, currencies])

  const saveColumnState = (event: any) => {
    localStorage.setItem("gridState", JSON.stringify(event.api.getColumnState()))
  }

  const onFirstDataRendered = (event: any) => {
    const savedState = localStorage.getItem("gridState")
    if (savedState) {
      event.api.applyColumnState({
        state: JSON.parse(savedState),
        applyOrder: true,
      })
    }
  }

  return (
    <div className='ag-theme-quartz' style={{ height: 400, minWidth: 250 }}>
      <AgGridReact rowData={rowData} columnDefs={colDefs} defaultColDef={defaultColDef} autoSizeStrategy={{ type: isMobile ? "fitCellContents" : "fitGridWidth" }} onFirstDataRendered={onFirstDataRendered} onColumnMoved={saveColumnState} onSortChanged={saveColumnState} />
    </div>
  )
}
