import React from "react";
import { useNavigate } from "react-router-dom";

function SideMenu({ open, onClose, onSelectPlant }) {
  const navigate = useNavigate(); 
  return (
    <div
      className={`fixed top-0 right-0 h-full w-64 bg-green-100 shadow-lg transform z-50 ${
        open ? "translate-x-0" : "translate-x-[100%]"
      } transition-transform duration-300`}
    >
      <div className="p-4">
        <button
          className="mb-4 px-2 py-1 bg-green-200 rounded hover:bg-green-300"
          onClick={onClose}
        >
          ✖ Chiudi
        </button>

        <h1 className="text-lg font-bold mb-3">Le tue piante:</h1>

        <div className="flex flex-col gap-2">
          <button
            className="px-2 py-1 rounded bg-green-100 hover:bg-green-200 cursor-pointer text-left"
            onClick={() => onSelectPlant("Pina")}
          >
            🌿 Pina
          </button>

          <button
            className="px-2 py-1 rounded bg-green-100 hover:bg-green-200 cursor-pointer text-left font-semibold"
            onClick={() => {
              navigate("/newplant"); // naviga alla pagina "Coming Soon"
              onClose(); // chiude il menu
            }}
          >
            + add new plant
          </button>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
