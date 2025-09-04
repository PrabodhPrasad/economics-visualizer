document.getElementById('update').addEventListener('click', () => {
    const selectedVariable=document.getElementById("variable").value;
    const selectedYear=parseInt(document.getElementById("yearinput").value)||2020;
    drawmap(selectedVariable, selectedYear);
});

async function fetchMapData(variable, year=2020) {
    const response=await fetch(`http://localhost:8000/mapdata?variable=${variable}&year=${year}`);
    if (!response.ok) {
        console.error("Failed to fetch map data");
        return {locations: [], values: [], hoverText: []};
    }
    const data=await response.json();
    return data;
}

async function drawmap(variable="getgdp", year=2020) {
    const data=await fetchMapData(variable, year);
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
            },
            bgcolor: '#fffcf2'
        },
        paper_bgcolor: '#fffcf2',
        margin: { t: 20, b: 0 }
    };
    Plotly.newPlot('mapplot', [trace], layout);
}

drawmap();