import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSensorData } from "./influxService";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { sendManualAction } from "./action";

// Mappa sensori: titoli, unità, descrizioni e soglie
const sensorsInfo = {
  temperaturaC: {
    title: "🌡️ Temperatura",
    unit: "°C",
    description: "Temperatura ideale tra 18 e 28 °C per la pianta domestica.",
    minSafe: 18,
    maxSafe: 28
  },
  umiditaAria: {
    title: "💧 Umidità Aria",
    unit: "%",
    description: "Umidità dell’aria ottimale per la crescita e la fotosintesi.",
    minSafe: 40,
    maxSafe: 70
  },
  luce_percentuale: {
    title: "💡 Luce",
    unit: "%",
    description: "Percentuale di luce disponibile per la fotosintesi.",
    minSafe: 30,
    maxSafe: 90
  },
  co2_grezzo: {
    title: "🫁 CO₂",
    unit: "ppm",
    description: "Livello di CO₂ nell’aria; valori ottimali 300–600 ppm.",
    minSafe: 300,
    maxSafe: 600
  },
  umiditaTerreno_percentuale: {
    title: "🌱 Umidità Terreno",
    unit: "%",
    description: "Umidità del terreno per mantenere le radici sane.",
    minSafe: 30,
    maxSafe: 80
  },
  conducibilita_grezza: {
    title: "⚡ Conducibilità",
    unit: "",
    description: "Conducibilità del terreno, indicativa della quantità di nutrienti.",
    minSafe: 100,
    maxSafe: 500
  },
  pH: {
    title: "🧪 pH",
    unit: "",
    description: "Valore del pH del terreno, ottimale tra 5.5 e 7.5.",
    minSafe: 5.5,
    maxSafe: 7.5
  }
};

function SensorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [lastValue, setLastValue] = useState(null);

  const sensor = sensorsInfo[id] || { title: id, description: "", unit: "", minSafe: 0, maxSafe: 100 };
  const { minSafe, maxSafe } = sensor;

  const latestValue = data.length > 0 ? data[data.length - 1][id] : null;
  const isAlert = latestValue < minSafe || latestValue > maxSafe;

  useEffect(() => {
    const fetchData = async () => {
      const rows = await getSensorData();
      setData(rows);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (lastValue !== null && lastValue !== latestValue) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(t);
    }
    setLastValue(latestValue);
  }, [latestValue]);

  const formatValue = (val) => {
    if (val == null) return "--";
    if (id === "pH") return val.toFixed(2);
    if (sensor.unit === "%") return Math.round(val);
    if (sensor.unit === "°C") return val.toFixed(1);
    return val.toFixed(0);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 p-2 rounded-md shadow-sm text-xs">
          <p className="font-semibold text-green-700">{sensor.title}</p>
          <p>{new Date(label).toLocaleTimeString()}</p>
          <p>{formatValue(payload[0].value)} {sensor.unit}</p>
        </div>
      );
    }
    return null;
  };

  const handleManualAction = async () => {
    setLoading(true);
    const media = (minSafe + maxSafe) / 2;
    const delta = media * 0.15;
    const valore = Math.round(latestValue > media ? -delta : delta);
    alert(`Invio azione manuale con valore: ${valore}`);

    try {
      await sendManualAction(id, valore);
      setLastAction(valore);
    } catch (err) {
      alert("❌ Errore durante l'invio dell'azione manuale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 rounded-2xl shadow-lg max-w-4xl mx-auto transition ${
      isAlert ? "bg-red-100 border border-red-400 animate-pulse-3" : "bg-white"
    }`}>

      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-green-700 hover:text-green-900 font-semibold"
      >
        ← Torna alla Dashboard
      </button>

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-bold text-green-800">{sensor.title}</h2>
        <p
          className={`text-xl font-bold transition ${
            isAlert ? "text-red-600 animate-pulse" : "text-green-700"
          } ${animate ? "scale-105" : ""}`}
        >
          {formatValue(latestValue)} {sensor.unit}
        </p>
      </div>

      <p className="text-gray-600 mb-4">{sensor.description}</p>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="_time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey={id} stroke="#16a34a" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-2 mt-4">
        <button
          className={`px-3 py-1 rounded-md text-white transition ${
            isAlert
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-green-500 hover:bg-green-600"
          }`}
          disabled={loading}
          onClick={handleManualAction}
        >
          Manual action
        </button>
      </div>
    </div>
  );
}

export default SensorDetail;