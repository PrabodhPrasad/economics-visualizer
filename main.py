from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests

app=FastAPI()
def fetchdata(country, indicator, startyear, endyear):
    url=f"http://api.worldbank.org/v2/country/{country}/indicator/{indicator}"
    response=requests.get(url, params={
        "format": "json",
        "date": f"{startyear}:{endyear}",
        "per_page": 100
    })

    data=response.json()
    if len(data)<2:
        return [], []
    years, values=[], []
    for entry in data[1]:
        if entry["value"] is not None:
            years.append(int(entry["date"]))
            values.append(entry["value"])
    
    combined=sorted(zip(years, values))
    years, values=zip(*combined)
    return years, values

@app.get("/getgdp")
def getgdp(
    country: str=Query(..., min_length=2, max_length=3),
    startyear: int=Query(1960, ge=1960, le=2025),
    endyear: int=Query(2025, ge=1960, le=2025),
):
    years, values = fetchdata(country, "NY.GDP.MKTP.CD", startyear, endyear)
    return {"years": years, "values": values}