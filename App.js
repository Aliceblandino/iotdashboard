// App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import SensorDetail from "./SensorDetail";
import SideMenu from "./SideMenu";
import PlantSelector from "./PlantSelector";
import NewPlantPage from "./NewPlantPage";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);

  return (
    <Router>
      {/* Se non è stata selezionata una pianta, mostra il selettore */}
      {!selectedPlant ? (
        <PlantSelector onSelect={(plant) => setSelectedPlant(plant)} />
      ) : (
        <div className="relative min-h-screen w-screen">
          {/* Sfondo */}
          <img
            src="/sfondo.jpg"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay con contenuto principale */}
          <div className="relative flex min-h-screen bg-green-50 bg-opacity-50">
            {/* Side Menu */}
            <SideMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onSelectPlant={(name) => {
                if (name === "newplant") {
                  window.location.href = "/newplant";
                } else {
                  setSelectedPlant(name);
                  setMenuOpen(false);
                }
              }}
            />

            {/* Contenuto principale */}
            <div className="flex-1 p-4">
              {/* Top Bar */}
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-4xl font-bold drop-shadow-lg text-green-800">
                  {selectedPlant} Dashboard
                </h1>
                <button
                  className="px-3 py-2 bg-green-200 rounded hover:bg-green-300 font-semibold"
                  onClick={() => setMenuOpen(true)}
                >
                  ☰ Menu
                </button>
              </div>

              {/* Pagine gestite da React Router */}
              <Routes>
                <Route
                  path="/"
                  element={<Dashboard selectedPlant={selectedPlant} />}
                />
                <Route path="/sensor/:id" element={<SensorDetail />} />
                <Route path="/newplant" element={<NewPlantPage />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
