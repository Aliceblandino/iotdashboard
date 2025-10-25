from flask import Flask, request, jsonify
from threading import Lock
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 
#CORS(app, origins=["http://172.16.62.247:3001"]) #per limitare solo al mio frontend ma meglio metterlo generale che gia non funziona niente
azione = {"tipo": None}
lock = Lock()

@app.route("/azione-manuale", methods=["POST"])
def azione_manuale():
    data = request.get_json()
    tipo = data.get("tipo")
    with lock:
        azione["tipo"] = tipo
    print(f"Richiesta azione ricevuta: {tipo}")
    return jsonify({"status": "ok", "azione": tipo})

def get_azione():
    with lock:
        valore = azione["tipo"]
        azione["tipo"] = None
    return valore

def manual_action():
    data = request.json
    sensor_id = data.get("id")
    valore = data.get("valore")  # può essere 0, -3, +3

    print(f"Azione manuale ricevuta per {sensor_id}: {valore}")

    # qui puoi interagire con le variabili del simulatore:
    # es: tempC += valore, o salvare il comando in una variabile globale

    return jsonify({"status": "ok", "ricevuto": valore})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
