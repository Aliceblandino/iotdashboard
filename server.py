from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Permette richieste da altri domini 
azioni_file = "azioni.json"  #File condiviso tra server e simulatore

# Funzione per salvare un'azione nel file
def set_azione(dataKey, valore):
    azioni = {}
    if os.path.exists(azioni_file):
        try:
            with open(azioni_file, "r") as f:
                azioni = json.load(f)
        except:
            pass  #per ignorare errori di lettura
    azioni[dataKey] = valore
    try:
        with open(azioni_file, "w") as f:
            json.dump(azioni, f)
    except Exception as e:
        print("Errore salvataggio azione:", e)

# Funzione per leggere un'azione dal file
def get_azione(dataKey):
    if not os.path.exists(azioni_file):
        return 0
    try:
        with open(azioni_file, "r") as f:
            azioni = json.load(f)
        return azioni.get(dataKey, 0)
    except:
        return 0

# Endpoint per ricevere l'azione manuale dal frontend
@app.route('/manual_action', methods=['POST'])
def manual_action():
    data = request.get_json()
    dataKey = data.get('dataKey')
    valore = data.get('valore')

    if dataKey is None or valore is None:
        return jsonify({"status": "error", "message": "Dati mancanti"}), 400

    set_azione(dataKey, valore)
    print(f"Azione ricevuta: {dataKey} = {valore}")
    return jsonify({"status": "success", "message": f"Azione ricevuta per {dataKey} con valore {valore}"}), 200

# Funzione accessibile da simulazionedati.py
def get_valore(dataKey):
    return get_azione(dataKey)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
