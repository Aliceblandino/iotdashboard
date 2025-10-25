from influxdb_client import InfluxDBClient, Point, WritePrecision
import random, time
import server

url = "http://localhost:8086"
token = 'kDQ3hbRH1WX-7sBwdD5MTRbi3Mr4lrmDeiGT-7GdzuIiNyeHZGQ1rEvG2yKFH972nYwU6zsxT5-Hjt_gO63f8Q=='
org = "4e10ce55d8d7d9d5"
bucket = "datisensori"
client = InfluxDBClient(url=url, token=token, org=org)
write_api = client.write_api()
signal=random.choice([0,1,-1])
azione=0


#0.FUNZIONI GENERALI
#variazione: calcola il valore randomicamente delle varibaili
def bottone(): 
    global signal

def variazione1():
    global tempC, humidity, luce, co2, soil, conduc, pH, tempF
    tempC+=random.uniform(-0.5,0.5)
    humidity+=random.randint(-2,2)
    pH+=random.uniform(-0.3,0.3)
    luce+=random.randint(-3,3)
    co2+=random.randint(-3,3)
    soil+=random.randint(-3,3)
    conduc+=random.randint(-3,3)
    tempF=tempC* 1.8 + 32 #da capire
def variazione():
    global tempC, humidity, luce, co2, soil, conduc, pH, tempF
    variationt=random.uniform(-0.5,0.5)
    variationh=random.randint(-2,2)
    print("Variazione Temp: ", variationt, " Variazione Humidity: ", variationh, )
    tempC=tempC+variationt
    humidity=humidity+variationh
    pH+=random.uniform(-0.3,0.3)
    luce+=random.randint(-3,3)
    co2+=random.randint(-3,3)
    soil+=random.randint(-3,3)
    conduc+=random.randint(-3,3)
    tempF=tempC* 1.8 + 32 #da capire

#manualaction: genera una segquanza di valoripari a 0 se il bottone non è premuto, altrimenti genera una sequenza di valori pari a 3
def manualaction():
    azione = server.get_azione()
    if azione is None:
        return 0  # fallback
    return azione
    

#invio: invio dei dati a influx
def invio():
    point = (
            Point("misurazioni")
            .field("temperaturaC", tempCTrasmesso)
            .field("temperaturaF", tempFTrasmesso)
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
tempF=tempC* 1.8 + 32 #da capire
print("Temperatura Iniziale: ", tempC, " Umidita Iniziale: ", humidity, " Luce Iniziale: ", luce, " CO2 Iniziale: ", co2, " Soil Iniziale: ", soil, " Conduc Iniziale: ", conduc, " pH Iniziale: ", pH, " TempF Iniziale: ", tempF)
while True:
    #2.creiamo il nuovo valore da trasmettere tenendo conto del valore del pulsante
    tempCTrasmesso=tempC+manualaction()
    humidityTrasmesso=humidity+manualaction()
    luceTrasmesso=luce+manualaction()
    co2Trasmesso=co2+manualaction()
    soilTrasmesso=soil+manualaction()
    conducTrasmesso=conduc+manualaction()
    pHTrasmesso=pH+manualaction()
    tempFTrasmesso=tempF+manualaction()
    print("TemperaturaTrasmessa: ", tempCTrasmesso," Umidita Trasmessa:  ", humidityTrasmesso, " Luce Trasmessa: ", luceTrasmesso, " CO2 Trasmessa: ", co2Trasmesso, " Soil Trasmessa: ", soilTrasmesso, " Conduc Trasmessa: ", conducTrasmesso, " pH Trasmessa: ", pHTrasmesso, " TempF Trasmessa: ", tempFTrasmesso)
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
    tempF=tempFTrasmesso
    print("Nuovo Temperatura:    ", tempC , " Nuovo Umidita: ", humidity, " Nuovo Luce: ", luce, " Nuovo CO2: ", co2, " Nuovo Soil: ", soil, " Nuovo Conduc: ", conduc, " Nuovo pH: ", pH, " Nuovo TempF: ", tempF)
    #5.Variazione casuale delle variabili
    variazione1()
    print("VARIAZIONE:")
    print("Temperatura+var  : ", tempC, "Umidità+var: ", humidity, " Luce+var: ", luce, " CO2+var: ", co2, " Soil+var: ", soil, " Conduc+var: ", conduc, " pH+var: ", pH, " TempF+var: ", tempF)
    time.sleep(4)