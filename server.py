from flask import Flask, request, jsonify
from threading import Lock
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

azione = {"tipo": 0}
lock = Lock()

@app.route("/azione-manuale", methods=["POST"])
def azione_manuale():
    data = request.get_json()
    tipo = data.get("tipo", 0)
    with lock:
        azione["tipo"] = tipo
    print(f"✅ Richiesta azione ricevuta: {tipo}")
    return jsonify({"status": "ok", "azione": tipo})


def get_azione():
    """Restituisce il valore dell'azione (default 0) e lo resetta a 0"""
    with lock:
        valore = azione["tipo"]
        azione["tipo"] = 0
    return valore


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
