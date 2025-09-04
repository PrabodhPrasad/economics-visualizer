from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
from groq import Groq
import uvicorn
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static", html=True), name="static")

@app.get("/")
async def readindex():
    return FileResponse(os.path.join("static", "index.html"))

client=Groq(api_key="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")

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

@app.get("/gdp")
def gdp(
    country: str=Query(..., min_length=2, max_length=3),
    startyear: int=Query(1960, ge=1960, le=2025),
    endyear: int=Query(2025, ge=1960, le=2025),
):
    years, values = fetchdata(country, "NY.GDP.MKTP.CD", startyear, endyear)
    return {"years": years, "values": values}

@app.get("/imports")
def imports(
    country: str = Query(..., min_length=2, max_length=3),
    startyear: int = Query(1960, ge=1960, le=2025),
    endyear: int = Query(2025, ge=1960, le=2025),
):
    years, values = fetchdata(country, "NE.IMP.GNFS.CD", startyear, endyear)
    return {"years": years, "values": values}

@app.get("/exports")
def exports(
    country: str = Query(..., min_length=2, max_length=3),
    startyear: int = Query(1960, ge=1960, le=2025),
    endyear: int = Query(2025, ge=1960, le=2025),
):
    years, values = fetchdata(country, "NE.EXP.GNFS.CD", startyear, endyear)
    return {"years": years, "values": values}

@app.get("/debt")
def debt(
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

@app.post("/chat")
async def chat_endpoint(request: Request):
    body=await request.json()
    messages=body.get("messages", [])

    chat_completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
    )
    responsetext=chat_completion.choices[0].message.content

    return {"response": responsetext}

@app.get("/mapdata")
def mapdata(variable: str=Query("gdp"), year: int=Query(2020)):
    if variable=="gdp":
        indicator="NY.GDP.MKTP.CD"
        is_currency=True
    elif variable=="imports":
        indicator="NE.IMP.GNFS.CD"
        is_currency=True
    elif variable=="exports":
        indicator="NE.EXP.GNFS.CD"
        is_currency=True
    elif variable=="debt":
        indicator="GC.DOD.TOTL.GD.ZS"
        is_currency=False
    else:
        return {"error": "Invalid variable"}

    url=f"http://api.worldbank.org/v2/country/all/indicator/{indicator}"
    response=requests.get(url, params={
        "format": "json",
        "date": year,
        "per_page": 300
    })

    data=response.json()
    if len(data)<2:
        return {"locations": [], "values": [], "hoverText": []}

    locations=[]
    values=[]
    hoverText=[]

    for entry in data[1]:
        iso3=entry["countryiso3code"]
        value=entry["value"]
        name=entry["country"]["value"]
        if iso3 and value is not None:
            locations.append(iso3)
            values.append(value)
            label=f"{name} ({iso3}) {variable.upper()}: "
            label+=f"${value:,.0f}" if is_currency else f"{value:.2f}% of GDP"
            hoverText.append(label)

    return {
        "locations": locations,
        "values": values,
        "hoverText": hoverText
    }

if __name__=="__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)