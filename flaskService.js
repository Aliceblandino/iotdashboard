// flaskService.js
export async function sendManualActionFlask(valore) {
  try {
    const res = await fetch("http://localhost:5000/azione-manuale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: valore }), // -3, 0, +3
    })

    if (!res.ok) throw new Error("Server non raggiungibile")
    const data = await res.json()
    console.log("✅ Azione inviata al server Flask:", data)
    return data
  } catch (err) {
    console.error("❌ Errore invio al server Flask:", err)
    throw err
  }
}
