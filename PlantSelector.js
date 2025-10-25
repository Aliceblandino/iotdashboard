import React from "react";
import { useNavigate } from "react-router-dom";

function PlantSelector({ onSelect }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center h-screen text-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/sfondo.jpg')" }} // immagine di sfondo
    >
      {/* Overlay semi-trasparente per il testo */}
      <div className="bg-green-50 bg-opacity-80 p-6 rounded-lg">
        <h1 className="text-4xl font-bold text-green-700 mb-4">
          Welcome to Plant Dashboard
        </h1>
        <p className="text-lg text-green-800 mb-8">
          This our project for IoT course.<br />
          Made by Alice Blandino, Adele Pioli and Denise Cantoni.<br />
          Good luck with your plants ;)
        </p>

        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          Seleziona la tua pianta
        </h2>

        <button
          onClick={() => onSelect("Pina")}
          className="px-6 py-3 bg-green-200 hover:bg-green-300 rounded-lg text-green-900 font-semibold mb-4"
        >
          Pina
        </button>

        <button
          onClick={() => navigate("/newplant")}
          className="px-6 py-3 bg-green-100 hover:bg-green-200 rounded-lg text-green-900 font-semibold"
        >
          + add new plant
        </button>
      </div>
    </div>
  );
}

export default PlantSelector;
