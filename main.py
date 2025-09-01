from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "null"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

@app.get("/getimports")
def getimports(
    country: str = Query(..., min_length=2, max_length=3),
    startyear: int = Query(1960, ge=1960, le=2025),
    endyear: int = Query(2025, ge=1960, le=2025),
):
    years, values = fetchdata(country, "NE.IMP.GNFS.CD", startyear, endyear)
    return {"years": years, "values": values}

@app.get("/getexports")
def getexports(
    country: str = Query(..., min_length=2, max_length=3),
    startyear: int = Query(1960, ge=1960, le=2025),
    endyear: int = Query(2025, ge=1960, le=2025),
):
    years, values = fetchdata(country, "NE.EXP.GNFS.CD", startyear, endyear)
    return {"years": years, "values": values}

@app.get("/getdebt")
def getdebt(
    country: str = Query(..., min_length=2, max_length=3),
    startyear: int = Query(1960, ge=1960, le=2025),
    endyear: int = Query(2025, ge=1960, le=2025),
):
    gdp_years, gdp_values = fetchdata(country, "NY.GDP.MKTP.CD", startyear, endyear)
    debt_pct_years, debt_pct_values = fetchdata(country, "GC.DOD.TOTL.GD.ZS", startyear, endyear)
    gdp_dict = dict(zip(gdp_years, gdp_values))
    debt_usd_years = []
    debt_usd_values = []
    for year, debt_pct in zip(debt_pct_years, debt_pct_values):
        gdp = gdp_dict.get(year)
        if gdp is not None and debt_pct is not None:
            debt_usd = gdp * debt_pct / 100
            debt_usd_years.append(year)
            debt_usd_values.append(debt_usd)
    return {"years": debt_usd_years, "values": debt_usd_values}