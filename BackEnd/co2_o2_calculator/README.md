# 📘 CO₂/O₂ Summary Calculator

## 🌱 Descrizione del progetto

Questo script calcola la quantità di **CO₂ assorbita** e **O₂ prodotta** giornalmente da un insieme di specie vegetali, in base a:

- al meteo orario (temperatura, umidità, radiazione solare)
- ai coefficienti di assorbimento per specie
- alla quantità o superficie coltivata

Il risultato è una **tabella giornaliera** di output in formato CSV e visibile in console.

---

## 🔁 Flusso dati

| Origine dati       | Ora (simulazione)   | In futuro               |
|--------------------|---------------------|--------------------------|
| `weather.json`     | File statico        | ➡️ API Open-Meteo live  |
| `plants.json`      | File statico        | ➡️ Query da API Flask   |
| `coefficients.json`| File statico        | ➡️ Query da Database    |

Tutto viene elaborato dalla funzione `calculate_co2_o2_hourly()`  
I risultati giornalieri sono aggregati e salvati in `tabella_risultati.csv`.

---

## 📂 File principali

| File                   | Descrizione                                                   |
|------------------------|----------------------------------------------------------------|
| `co2_o2_calculator.py` | Funzione principale di calcolo orario CO₂/O₂                  |
| `plants.json`          | Specie vegetali e quantità o superficie (simulati)            |
| `species_rates_lowercase.json` | Coefficienti assorbimento per specie (kg/h per unità)     |
| `weather.json`         | Dati meteo orari ottenuti da Open-Meteo API                   |

---

## 📥 Esempi di input

### 🔸 `plants.json`  
👉 *Simulato — Simone dovrà creare una route che prende i dati dal frontend e li salva nel DB*

```json
[
  { "species": "quercia", "quantity": 5 },
  { "species": "pino", "quantity": 10 },
  { "species": "mais", "area_m2": 300 }
]
```

### 🔸 `coefficients.json`  
👉 *Simulato — Alice dovrà salvare questi coefficienti nel DB e restituirli con una query*

```json
{
  "quercia": 0.0015,
  "pino": 0.0013,
  "mais": 0.0002
}
```

### 🔸 `weather.json`  
👉 *Simulato — Simone dovrà usare Open-Meteo API e generare una struttura così*

```json
{
  "datetime": "2025-05-23T14:00",
  "temperature": 12.1,
  "humidity": 47,
  "precipitation": 0.0,
  "radiation": 472.8
}
```

---

## ▶️ Come eseguire

Assicurati di avere Python installato e la libreria `pandas`:

```bash
cd BackEnd/
python co2_o2_calculator.py
```

Output:
- ✅ Tabella stampata in console
- ✅ File `tabella_risultati.csv` generato con tutti i valori giornalieri

---

## 📌 ISTRUZIONI PER DOMANI — COSA RESTA DA COLLEGARE

✅ Il modulo di calcolo è completo, testato, e documentato.  
🎯 Ora deve essere integrato nel backend:

- 👨‍💻 **Simone**: creare una route Flask che accetta il JSON di piante dal frontend e lo passa alla funzione
- 🧠 **Alice**: salvare i coefficienti nel database, creare query, e restituire un dizionario compatibile
- ☁️ **Simone**: gestire la chiamata a Open-Meteo API, estrarre dati e formattarli in `weather_data`

---

Tutti i file `.json` di esempio sono già **pronti come struttura**, il resto è solo cablare 🔌
