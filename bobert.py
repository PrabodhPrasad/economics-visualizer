import streamlit as st
import requests
import plotly.graph_objects as go
from streamlit_plotly_events import plotly_events
import plotly.io as pio
from groq import Groq
client = Groq(api_key="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")

st.title("chart")
if "plots" not in st.session_state:
    st.session_state.plots=[]

if "history" not in st.session_state:
    st.session_state.history = []

#getgdp
def getgdp(country, startyear=1960, endyear=2025):
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

#getexp
def getexp(country, startyear=1960, endyear=2025):
    url=f"http://api.worldbank.org/v2/country/{country}/indicator/NE.EXP.GNFS.CD"
    response=requests.get(url, {"format":"json", "date":f"{startyear}:{endyear}", "per_page":100})

    years=[]
    exps=[]
    if len(response.json())>1:
        for entry in response.json()[1]:
            years.append(int(entry['date']))
            exps.append(entry['value'])

    combined=sorted(zip(years, exps))
    years, exps=zip(*combined)
    return years, exps

#getimp
def getimp(country, startyear=1960, endyear=2025):
    url=f"http://api.worldbank.org/v2/country/{country}/indicator/NE.IMP.GNFS.CD"
    response=requests.get(url, {"format":"json", "date":f"{startyear}:{endyear}", "per_page":100})

    years=[]
    imps=[]
    if len(response.json())>1:
        for entry in response.json()[1]:
            years.append(int(entry['date']))
            imps.append(entry['value'])

    combined=sorted(zip(years, imps))
    years, imps=zip(*combined)
    return years, imps

#getdebt
def getdebt(country, startyear=1960, endyear=2025):
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
    "exports": getexp,
    "imports": getimp
}

col1, col2, col3, col4=st.columns(4)
with col1:
    countryinput=st.text_input("country code")
with col2:
    variableinput=st.selectbox("choice", options=list(functions.keys()))
with col3:
    startyear=st.number_input("start year", min_value=1960, max_value=2025, value=2000)
with col4:
    endyear=st.number_input("end year", min_value=1960, max_value=2025, value=2025)

if st.button("add") and startyear<endyear:
    if (len(countryinput) in [2, 3]) and countryinput.isalpha():
        years, values = functions[variableinput](countryinput, startyear=startyear, endyear=endyear)
        st.session_state.plots.append({
            "x": years,
            "y": values,
            "label": f"{variableinput} of {countryinput}",
            "variable":variableinput,
            "country":countryinput
        })

pio.templates.default="plotly"
fig=go.Figure()
for trace in st.session_state.plots:
    fig.add_trace(go.Scatter(
        x=trace["x"],
        y=trace["y"],
        mode="lines+markers",
        name=trace["label"]
    ))

fig.update_layout(
    yaxis=dict(tickformat=".2s", tickprefix="$"),
    clickmode="event+select"
)
selectpoints=plotly_events(fig, click_event=True, hover_event=False)
if selectpoints:
    clicked=selectpoints[0]
    traceindex=clicked["curveNumber"]
    trace=st.session_state.plots[traceindex]
    variable=trace["variable"]
    country=trace["country"]
    clickedyear=clicked["x"]
    clickedvalue=clicked["y"]
    st.markdown(f"year: **{clickedyear}**, value: **{clickedvalue:,.2f}**, variable: **{variable}**, country: **{country}**")
    
    questions=st.text_input("questions")

    if "lastclicked" not in st.session_state or st.session_state.lastclicked!=(clickedyear, clickedvalue, variable, country):
        st.session_state.lastclicked=(clickedyear, clickedvalue, variable, country)
        message={
            "role": "system",
            "content": (
                f"Year: {clickedyear}, Value: {clickedvalue:.2f}, "
                f"Variable: {variable}, Country: {country}. "
                "This is the data context for the conversation."
            )
        }
        st.session_state.history=[message]
    
    if questions.strip():
        st.session_state.history.append({"role": "user", "content": questions})
        chat_completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=st.session_state.history
        )
        airesponse=chat_completion.choices[0].message.content
        st.session_state.history.append({"role": "assistant", "content": airesponse})
        st.write(airesponse)