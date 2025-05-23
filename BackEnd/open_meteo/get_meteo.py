import requests
import json

latitude = "52.52"
longitude = "13.41"

temperature = "temperature_2m"
humidity = "relative_humidity_2m"
precipitation = "precipitation"
radiation = "shortwave_radiation"

url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&hourly={temperature},{humidity},{precipitation},{radiation}"

response = requests.get(url=url)
content = response.json()

hourly = content["hourly"]

data = []

for i in range(len(hourly["time"])):
    data.append({
        "datetime": hourly["time"][i],
        "temperature": hourly["temperature_2m"][i],
        "humidity": hourly["relative_humidity_2m"][i],
        "precipitation": hourly["precipitation"][i],
        "radiation": hourly["shortwave_radiation"][i]
    })

with open("weather_parsed.json", "w", encoding="utf-8") as file:
    json.dump(data, file, indent=4)

print("✅ File salvato: weather_parsed.json")