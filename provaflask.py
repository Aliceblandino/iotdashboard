# simulazionedati.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from influxdb_client import InfluxDBClient, Point, WritePrecision
import random, time
from threading import Thread

# --- CONFIG INFLUXDB ---
url = "http://localhost:8086"
token = 'kDQ3hbRH1WX-7sBwdD5MTRbi3Mr4lrmDeiGT-7GdzuIiNyeHZGQ1rEvG2yKFH972nYwU6zsxT5-Hjt_gO63f8Q=='
org = "4e10ce55d8d7d9d5"
bucket = "datisensori"


client = InfluxDBClient(url=url, token=token, org=org)
write_api = client.write_api()

# --- VARIABILI SENSORI ---
variabili = {
    "tempC": random.uniform(20, 30),
    "humidity": random.randint(40, 70),
    "luce": random.randint(0, 100),
    "co2": random.randint(300, 600),
    "soil": random.randint(30, 80),
    "conduc": random.randint(100, 500),
    "pH": random.uniform(5.5, 7.5)
}
variabili["tempF"] = variabili["tempC"] * 1.8 + 32

# --- STATO AZIONE MANUALE ---
stato_bottone = {"sensore": None, "azione": 0}  # azione: 0=niente, 1=diminuisci, 2=aumenta

# --- FUNZIONE FLASK PER RICEVERE AZIONI ---
app = Flask(__name__)
CORS(app)

@app.route("/azione-manuale", methods=["POST"])
def ricevi_azione():
    global stato_bottone
    data = request.get_json()
    sensore = data.get("sensore")
    azione = data.get("azione")  # 1=diminuisci, 2=aumenta
    stato_bottone = {"sensore": sensore, "azione": azione}
    print(f"📥 Comando ricevuto: {sensore}, azione {('−5%' if azione==1 else '+5%')}")
    return jsonify({"status": "ok"})

# --- LOOP PRINCIPALE SENSORI ---
def loop_sensori():
    global variabili, stato_bottone
    while True:
        sensore_modificato = None

        # --- APPLICA EVENTUALE AZIONE MANUALE ---
        if stato_bottone["sensore"] and stato_bottone["azione"] in [1, 2]:
            nome = stato_bottone["sensore"]
            if nome in variabili:
                delta = 0.05 * variabili[nome]  # 5% del valore corrente
                if stato_bottone["azione"] == 1:  # diminuisci
                    variabili[nome] -= delta
                else:  # aumenta
                    variabili[nome] += delta
                sensore_modificato = nome
                print(f"⚙️ Azione manuale immediata su {nome}: nuovo valore = {variabili[nome]:.2f}")
            stato_bottone = {"sensore": None, "azione": 0}  # reset

        # --- VARIAZIONE CASUALE SENSORI ---
        for chiave in variabili:
            if chiave == "tempF":
                continue
            if chiave == sensore_modificato:
                continue  # skip per il sensore modificato manualmente
            if chiave in ["humidity", "luce", "soil"]:
                variazione = random.choice([-0.03, 0, 0.03]) * variabili[chiave]
                variabili[chiave] = max(20, min(80, variabili[chiave] + variazione))
            elif chiave == "pH":
                variazione = random.choice([-0.03, 0, 0.03]) * variabili[chiave]
                variabili[chiave] = max(2, min(12, variabili[chiave] + variazione))
            else:  # tempC, co2, conduc
                variazione = random.choice([-0.03, 0, 0.03]) * variabili[chiave]
                variabili[chiave] = max(0, variabili[chiave] + variazione)

        # --- RICALCOLO TEMPERATURA F ---
        variabili["tempF"] = variabili["tempC"] * 1.8 + 32

        # --- SCRITTURA SU INFLUXDB ---
        point = (
            Point("misurazioni")
            .field("temperaturaC", variabili["tempC"])
            .field("temperaturaF", variabili["tempF"])
            .field("umiditaAria", variabili["humidity"])
            .field("luce_percentuale", variabili["luce"])
            .field("co2_grezzo", variabili["co2"])
            .field("umiditaTerreno_percentuale", variabili["soil"])
            .field("conducibilita_grezza", variabili["conduc"])
            .field("pH", variabili["pH"])
            .time(time.time_ns(), WritePrecision.NS)
        )
        write_api.write(bucket=bucket, org=org, record=point)

        # --- STAMPA IN CONSOLE TUTTI I VALORI ---
        print(f"📤 Dato inviato: {variabili}")

        time.sleep(10)

# --- AVVIO THREAD FLASK ---
def run_flask():
    app.run(host="0.0.0.0", port=5000)

# --- MAIN ---
if __name__ == "__main__":
    Thread(target=loop_sensori, daemon=True).start()
    run_flask()
