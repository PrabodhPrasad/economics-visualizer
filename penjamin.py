#imports
import requests
import plotly.graph_objects as go

#getgdp
def getgdp(country, startyear=2013, endyear=2025):
    url=f"http://api.worldbank.org/v2/country/{country}/indicator/NY.GDP.MKTP.CD"
    response=requests.get(url, {"format":"json", "date":f"{startyear}:{endyear}", "per_page":100})

    years=[]
    gdps=[]
    if len(response.json())>1:
        for entry in response.json()[1]:
            years.append(int(entry['date']))
            gdps.append(entry['value'])

    combined=sorted(zip(years, gdps))
    years, gdps=zip(*combined)
    return years, gdps

#getdebt
def getdebt(country, startyear=2013, endyear=2025):
    url=f"http://api.worldbank.org/v2/country/{country}/indicator/GC.DOD.TOTL.GD.ZS"
    response=requests.get(url, {"format":"json", "date":f"{startyear}:{endyear}", "per_page":100})

    years=[]
    debts=[]
    if len(response.json())>1:
        for entry in response.json()[1]:
            years.append(int(entry['date']))
            debts.append(entry['value'])

    combined=sorted(zip(years, debts))
    years, debts=zip(*combined)
    return years, debts


kody=input()
countries=kody.split(",")
functions={
    "gdp": getgdp,
    "debt": getdebt,
}
functionchoice=input()
fig=go.Figure()

for code in countries:
    years, choice=functions[functionchoice](code)
    if years and choice:
        fig.add_trace(go.Scatter(
            x=years,
            y=choice,
            mode='lines+markers',
            name=code))

fig.update_layout(
    yaxis=dict(tickformat="$,")
)
fig.show()