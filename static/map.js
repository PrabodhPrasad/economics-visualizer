document.getElementById('update').addEventListener('click', () => {
    const selectedVariable=document.getElementById("variable").value;
    const selectedYear=parseInt(document.getElementById("yearinput").value)||2020;
    drawmap(selectedVariable, selectedYear);
});

async function fetchmapdata(variable, year=2020) {
    const response=await fetch(`http://localhost:8000/mapdata?variable=${variable}&year=${year}`);
    const data=await response.json();
    return data;
}

async function drawmap(variable="gdp", year=2020) {
    const data=await fetchmapdata(variable, year);
    const trace={
        type: 'choropleth',
        locations: data.locations,
        z: data.values,
        text: data.hoverText,
        colorscale: "Plasma",
        colorbar: { title: `Value (${year})` },
        autocolorscale: false,
        reversescale: true,
        marker: {
            line: {
                color: "#ccc5b9",
                width: 0.5
            }
        },
        hoverinfo: 'text'
    };

    const layout={
        geo: {
            projection: {
                type: 'orthographic',
                rotation: {
                    lon: 83,
                    lat: 20,
                    roll: 0
                }
            },
            bgcolor: '#fffcf2'
        },
        paper_bgcolor: '#fffcf2',
        margin: { t: 20, b: 0 },
    };
    Plotly.newPlot('mapplot', [trace], layout).then(plot=>{
        plot.on("plotly_click", function(eventdata){
            const point=eventdata.points[0];
            const iso3=point.location;
            const selectedvariable=document.getElementById("variable").value;
            const url=`/static/index.html?country=${iso3}&variable=${selectedvariable}`;
            window.open(url, '_blank');
        })
    })
}

drawmap();