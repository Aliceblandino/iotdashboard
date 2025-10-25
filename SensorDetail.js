import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSensorData } from "./influxService";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { sendManualAction } from "./action"; // o "./influxService" se lo hai lì

//Mappa sensori: titoli, unità e descrizioni
const sensorsInfo = {
  temperaturaC: { title: "🌡️ Temperatura", unit: "°C", description: "Temperatura ideale tra 18 e 28 °C per la pianta domestica." },
  umiditaAria: { title: "💧 Umidità Aria", unit: "%", description: "Umidità dell’aria ottimale per la crescita e la fotosintesi." },
  luce_percentuale: { title: "💡 Luce", unit: "%", description: "Percentuale di luce disponibile per la fotosintesi." },
  co2_grezzo: { title: "🫁 CO₂", unit: "ppm", description: "Livello di CO₂ nell’aria; valori ottimali 300–600 ppm." },
  umiditaTerreno_percentuale: { title: "🌱 Umidità Terreno", unit: "%", description: "Umidità del terreno per mantenere le radici sane." },
  conducibilita_grezza: { title: "⚡ Conducibilità", unit: "", description: "Conducibilità del terreno, indicativa della quantità di nutrienti." },
  pH: { title: "🧪 pH", unit: "", description: "Valore del pH del terreno, ottimale tra 5.5 e 7.5." },
};

function SensorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const sensor = sensorsInfo[id] || { title: id, description: "", unit: "" };

  // 📥 Carica dati
  useEffect(() => {
    const fetchData = async () => {
      const rows = await getSensorData();
      setData(rows);
    };
    fetchData();
  }, []);

  const latestValue = data && data.length > 0 ? data[data.length - 1][id] : null;

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

  // 💧 Pulsante azione manuale
  const handleManualAction = async () => {
    setLoading(true);
    const valore=-5;
    try {
      await sendManualAction(id, valore); //invia id e valore
      //setLastAction(valore); //aggiorna stato ultima azione
    } catch (err) {
      alert("❌ Errore durante l'invio dell'azione manuale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl shadow-lg max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-green-700 hover:text-green-900 font-semibold"
      >
        ← Torna alla Dashboard
      </button>

      <div className="flex justify-between items-end mb-2">
        <h2 className="text-3xl font-bold text-green-800">{sensor.title}</h2>
        <p className="text-lg text-gray-700">
          Valore attuale:{" "}
          <span className="font-semibold text-green-700">
            {formatValue(latestValue)} {sensor.unit}
          </span>
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
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
          disabled={loading}
          onClick={() => handleManualAction()}
        >
          Manual action
        </button>
      </div>

      {lastAction != null && (
        <p className="text-xs text-gray-700 mt-2">Ultima azione inviata: {lastAction}</p>
      )}
    </div>
  );
}

export default SensorDetail;
