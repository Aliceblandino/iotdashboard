import React from "react";
import { useNavigate } from "react-router-dom";

function NewPlantPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50 text-center p-4">
      <h1 className="text-4xl font-bold text-green-700 mb-6">
        Coming Soon 🌱
      </h1>
      <p className="text-lg text-green-800 mb-8">
        Nope
      </p>

      <button
        className="px-6 py-3 bg-green-200 hover:bg-green-300 rounded-lg text-green-900 font-semibold"
        onClick={() => navigate("/")} // torna al PlantSelector
      >
        ← Back
      </button>
    </div>
  );
}

export default NewPlantPage;
