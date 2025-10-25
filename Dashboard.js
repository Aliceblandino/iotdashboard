// Dashboard.js
import React, { useEffect, useState } from "react"
import SensorBlock from "./SensorBlock"
import { useNavigate } from "react-router-dom"
import { getSensorData } from "./influxService"
import { ManualActionButton } from "./action" // se vuoi usare il bottone centralizzato

function Dashboard({ selectedPlant }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // 🔄 Recupera i dati periodicamente da InfluxDB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rows = await getSensorData(selectedPlant)
        setData(rows)
      } catch (err) {
        console.error("Errore nel caricamento dati:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [selectedPlant])

  if (loading) return <p className="text-center text-gray-500">Caricamento dati...</p>

  const sensors = [
    { id: "temperaturaC", title: "🌡️ Temperatura", unit: "°C", min: 18, max: 28 },
    { id: "umiditaAria", title: "💧 Umidità Aria", unit: "%", min: 40, max: 70 },
    { id: "luce_percentuale", title: "💡 Luce", unit: "%", min: 30, max: 90 },
    { id: "co2_grezzo", title: "🫁 CO₂", unit: "ppm", min: 300, max: 600 },
    { id: "umiditaTerreno_percentuale", title: "🌱 Umidità Terreno", unit: "%", min: 30, max: 80 },
    { id: "conducibilita_grezza", title: "⚡ Conducibilità", unit: "", min: 100, max: 500 },
    { id: "pH", title: "🧪 pH", unit: "", min: 5.5, max: 7.5 },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {sensors.map((s) => (
        <div key={s.id} className="relative" onClick={() => navigate(`/sensor/${s.id}`)}>
          <SensorBlock
            title={s.title}
            //id={s.id}
            dataKey={s.id}
            unit={s.unit}
            data={data}
            minSafe={s.min}
            maxSafe={s.max}
          />

          {/* Esempio: bottone azione manuale in basso a destra del blocco */}
          <div className="absolute bottom-2 right-2">
            <ManualActionButton sensorName={s.id} percent={3} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default Dashboard
