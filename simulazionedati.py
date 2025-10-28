from influxdb_client import InfluxDBClient, Point, WritePrecision
import random, time
import server, os, json

url = "http://localhost:8086"#locale
#url="http://192.168.1.39:8086"#casa
token = 'kDQ3hbRH1WX-7sBwdD5MTRbi3Mr4lrmDeiGT-7GdzuIiNyeHZGQ1rEvG2yKFH972nYwU6zsxT5-Hjt_gO63f8Q=='
org = "4e10ce55d8d7d9d5"
bucket = "datisensori"
client = InfluxDBClient(url=url, token=token, org=org)
write_api = client.write_api()
signal=random.choice([0,1,-1])
#azione=0

#0.FUNZIONI GENERALI
#gestisce la lettura del file azioni.json e resetta il valore dopo la lettura
def manualaction(dataKey):
    if not os.path.exists("azioni.json"):
        return 0
    try:
        with open("azioni.json", "r") as f:
            azioni = json.load(f)
            print("azioni:", azioni)
        valore = azioni.get(dataKey, 0)
        azioni[dataKey] = 0  # reset dopo lettura
        with open("azioni.json", "w") as f:
            json.dump(azioni, f)
        print("sei dentro manual action", valore)
        return valore
    except:
        return 0
#variazione: calcola il valore randomicamente delle varibaili
def variazione1():
    global tempC, humidity, luce, co2, soil, conduc, pH #, tempF
    tempC+=random.uniform(-0.5,0.5)
    humidity+=random.randint(-2,2)
    pH+=random.uniform(-0.3,0.3)
    luce+=random.randint(-3,3)
    co2+=random.randint(-3,3)
    soil+=random.randint(-3,3)
    conduc+=random.randint(-3,3)
    #tempF=tempC* 1.8 + 32 

#manualaction: genera una segquanza di valoripari a 0 se il bottone non è premuto, altrimenti genera una sequenza di valori pari a 3
def manual_action(): #per le prove
    #azione = server.get_azione()
    #if azione is None:
        return 0  # fallback
    #return azione

def normalizzazione(): #per evitare valori fuori scala
    global pHTrasmesso, humidityTrasmesso, soilTrasmesso, luceTrasmesso
    pHTrasmesso = max(0, min(pHTrasmesso, 14))
    humidityTrasmesso = max(0, min(humidityTrasmesso, 100))
    soilTrasmesso = max(0, min(soilTrasmesso, 100))
    luceTrasmesso = max(0, min(luceTrasmesso, 100))

#invio: invio dei dati a influx
def invio():
    point = (
            Point("misurazioni")
            .field("temperaturaC", tempCTrasmesso)
            #.field("temperaturaF", tempFTrasmesso)
            .field("umiditaAria", humidityTrasmesso)
            .field("luce_percentuale", luceTrasmesso)
            .field("co2_grezzo", co2Trasmesso)
            .field("umiditaTerreno_percentuale", soilTrasmesso)
            .field("conducibilita_grezza", conducTrasmesso)
            .field("pH", pHTrasmesso)
            .time(time.time_ns(), WritePrecision.NS)
        )
    write_api.write(bucket=bucket, org=org, record=point)
    print("invio riuscito")

print("Generatore Avviato")
#1.Generazione variabili iniziali
tempC=random.uniform(20, 30)
humidity=random.randint(40, 70)
luce=random.randint(0, 100)
co2=random.randint(300, 600)
soil=random.randint(30, 80)
conduc=random.randint(100, 500)
pH=random.uniform(5.5, 7.5)
#tempF=tempC* 1.8 + 32 #da capire
print("Temperatura Iniziale: ", tempC, " Umidita Iniziale: ", humidity, " Luce Iniziale: ", luce, " CO2 Iniziale: ", co2, " Soil Iniziale: ", soil, " Conduc Iniziale: ", conduc, " pH Iniziale: ", pH)
while True:
    #2.creiamo il nuovo valore da trasmettere tenendo conto del valore del pulsante
    tempCTrasmesso=tempC+manualaction("temperaturaC")
    humidityTrasmesso=humidity+manualaction("umiditaAria")
    luceTrasmesso=luce+manualaction("luce_percentuale")
    co2Trasmesso=co2+manualaction("co2_grezzo")
    soilTrasmesso=soil+manualaction("umiditaTerreno_percentuale")
    conducTrasmesso=conduc+manualaction("conducibilita_grezza")
    pHTrasmesso=pH+manualaction("pH")
    normalizzazione()
    #tempFTrasmesso=tempF+manualaction()
    print("TemperaturaTrasmessa: ", tempCTrasmesso," Umidita Trasmessa:  ", humidityTrasmesso, " Luce Trasmessa: ", luceTrasmesso, " CO2 Trasmessa: ", co2Trasmesso, " Soil Trasmessa: ", soilTrasmesso, " Conduc Trasmessa: ", conducTrasmesso, " pH Trasmessa: ", pHTrasmesso,)
    #3.Invio dei dati a influx
    invio()
    #4.Aggiornamento variabili con i valori trasmessi
    tempC=tempCTrasmesso
    humidity=humidityTrasmesso
    luce=luceTrasmesso
    co2=co2Trasmesso
    soil=soilTrasmesso
    conduc=conducTrasmesso
    pH=pHTrasmesso
    #tempF=tempFTrasmesso
    print("Nuovo Temperatura:    ", tempC , " Nuovo Umidita: ", humidity, " Nuovo Luce: ", luce, " Nuovo CO2: ", co2, " Nuovo Soil: ", soil, " Nuovo Conduc: ", conduc, " Nuovo pH: ", pH)
    #5.Variazione casuale delle variabili
    variazione1()
    print("VARIAZIONE:")
    print("Temperatura+var  : ", tempC, "Umidità+var: ", humidity, " Luce+var: ", luce, " CO2+var: ", co2, " Soil+var: ", soil, " Conduc+var: ", conduc, " pH+var: ", pH)
    time.sleep(5)