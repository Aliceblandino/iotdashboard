import React, { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { sendManualActionFlask } from "./flaskService" //per usare flask, da capire se è da togliere o meno
import { sendManualAction } from "./action"; // o "./influxService" se lo hai lì

function SensorBlock({ title, dataKey, unit, data, minSafe, maxSafe }) {
  const [loading, setLoading] = useState(false)
  const [lastValue, setLastValue] = useState(null)
  const [animate, setAnimate] = useState(false)

  const latestValue = data?.length ? data[data.length - 1][dataKey] : null
  const isAlert = latestValue < minSafe || latestValue > maxSafe

  const formatValue = (val) => {
    if (val == null) return "--"
    if (title.includes("pH")) return val.toFixed(2)
    if (unit === "°C") return val.toFixed(1)
    if (unit === "%") return Math.round(val)
    return val.toFixed(0)
  }

  useEffect(() => {
    if (lastValue !== null && lastValue !== latestValue) {
      setAnimate(true)
      const t = setTimeout(() => setAnimate(false), 600)
      return () => clearTimeout(t)
    }
    setLastValue(latestValue)
  }, [latestValue])

  // 💧 Pulsante azione manuale
  const handleManualAction = async () => {
    setLoading(true);
    const valore=-5;
    try {
      await sendManualAction(dataKey, valore); //invia id e valore
      //setLastAction(valore); //aggiorna stato ultima azione
    } catch (err) {
      alert("❌ Errore durante l'invio dell'azione manuale");
    } finally {
      setLoading(false);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-2xl p-4 flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-gray-500 text-sm">Caricamento dati...</p>
      </div>
    )
  }
  console.log("Rendering SensorBlock:", title, data);
  console.log("datakey:", dataKey);
  console.log("urlimi dati:", data.slice(-5));
  return (
    <div
      className={`rounded-2xl shadow-md p-4 transition transform hover:scale-105 ${
        isAlert
          ? "bg-red-200 animate-pulse border border-red-500"
          : "bg-white border border-green-200"
      }`}
    >
      <h3 className="text-lg font-semibold text-green-800 mb-2">{title}</h3>

      {/* Valore attuale */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-gray-600">Valore attuale:</p>
        <p
          className={`text-xl font-bold ${
            isAlert ? "text-red-600" : "text-green-700"
          }`}
        >
          {latestValue ? latestValue.toFixed(2) : "--"} {unit}
        </p>
      </div>

      {/* Mini grafico */}
      <div className="w-full h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.slice(-20)}>
            <XAxis hide dataKey="_time" />
            <YAxis hide />
            <Tooltip />
             <Line type="monotone" dataKey={dataKey} stroke="#16a34a" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Descrizione */}
      <p className="text-sm text-gray-500 mt-2">
        {title} ideale tra <strong>{minSafe}</strong> e <strong>{maxSafe}</strong> {unit}
      </p>

      {/* Pulsante */}
      <div className="flex gap-2 mt-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
          disabled={loading}
          onClick={() => handleManualAction()}
        >
          Manual action
        </button>
      </div>
    </div>
  )
}

export default SensorBlock
