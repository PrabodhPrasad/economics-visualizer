import streamlit as st
import requests
import plotly.graph_objects as go
st.title("chart")

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
    gdpurl=f"http://api.worldbank.org/v2/country/{country}/indicator/NY.GDP.MKTP.CD"
    gdp_response = requests.get(gdpurl, {"format":"json", "date":f"{startyear}:{endyear}", "per_page":100})
    gdpdata={}
    if len(gdp_response.json())>1:
        for entry in gdp_response.json()[1]:
            if entry["value"] is not None:
                gdpdata[int(entry["date"])]=entry["value"]

    debturl=f"http://api.worldbank.org/v2/country/{country}/indicator/GC.DOD.TOTL.GD.ZS"
    debtresponse=requests.get(debturl, {"format":"json", "date":f"{startyear}:{endyear}", "per_page":100})
    debtdata={}
    if len(debtresponse.json())>1:
        for entry in debtresponse.json()[1]:
            if entry["value"] is not None:
                debtdata[int(entry["date"])]=entry["value"]

    commonyears = sorted(set(gdpdata.keys()) & set(debtdata.keys()))
    years=[]
    debtusd=[]
    for year in commonyears:
        years.append(year)
        debtusd.append(gdpdata[year]*(debtdata[year]/100))
    return years, debtusd

functions={
    "gdp": getgdp,
    "debt": getdebt,
}

if "plots" not in st.session_state:
    st.session_state.plots = []
col1, col2=st.columns(2)
with col1:
    countryinput=st.text_input("country code")
with col2:
    variableinput=st.selectbox("choice", options=list(functions.keys()))

if st.button("add"):
    if (len(countryinput) in [2, 3]) and countryinput.isalpha():
        years, values = functions[variableinput](countryinput)
        st.session_state.plots.append({
            "x": years,
            "y": values,
            "label": f"{variableinput} of {countryinput}"
        })

fig=go.Figure()
for trace in st.session_state.plots:
    fig.add_trace(go.Scatter(
        x=trace["x"],
        y=trace["y"],
        mode="lines+markers",
        name=trace["label"]
    ))

fig.update_layout(
    yaxis=dict(tickformat="$,")
)
st.plotly_chart(fig)