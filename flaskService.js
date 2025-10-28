// flaskService.js
//const url="http://localhost:5000/azione-manuale";//locale
//const url="http://
//const url="http://172.16.62.247:5000/azione-manuale"; //uni
export const url="http://192.168.1.39:5050/manual_action"; //casa

export async function sendManualActionFlask(valore) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: valore }), // -3, 0, +3
    })

    if (!res.ok) throw new Error("Server non raggiungibile")
    const data = await res.json()
    console.log("Azione inviata al server Flask:", data)
    return data
  } catch (err) {
    console.error("Errore invio al server Flask:", err)
    throw err
  }
}
