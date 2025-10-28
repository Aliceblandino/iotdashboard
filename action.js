import React, { useState } from "react";
import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { config } from "./influxConfig";
import {url} from "./flaskService";

//funzione per inviare un'azione manuale al server Flask
export async function sendManualAction(sensorName = "temperaturaC", valore = 3) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataKey: sensorName, valore }),
    });
    const data = await response.json();
    console.log("Risposta server:", data);
    return data;
  } catch (error) {
    console.error("Errore durante l'invio:", error);
    throw error;
  }
}

//Bottone React riutilizzabile
export function ManualActionButton({ sensorName = "temperaturaC", percent = 3 }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const newValue = await sendManualAction(sensorName, percent);
      setResult(newValue.ricevuto ?? "ok");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`px-3 py-2 rounded-md font-semibold text-sm shadow-md ${
          loading
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-green-200 hover:bg-green-300 text-green-800"
        }`}
      >
        {loading ? "⏳ Invio..." : `⚙️ +${percent}% ${sensorName}`}
      </button>

      {result && <p className="text-xs text-green-700 mt-1">Risultato: {result}</p>}
      {error && <p className="text-xs text-red-600 mt-1">Errore: {error}</p>}
    </div>
  );
}
