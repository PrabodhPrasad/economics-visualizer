document.getElementById('update').addEventListener('click', ()=>{
    const selectedvariable=document.getElementById("variable").value;
    const selectedyear=parseInt(document.getElementById("yearinput").value)||2020;
    drawmap(selectedvariable, selectedyear);
});

async function fetchmapdata(variable, year=2020){

    const response=await fetch(`https://economics-visualizer.onrender.com/mapdata?variable=${variable}&year=${year}`);
    //const response=await fetch(`/mapdata?variable=${variable}&year=${year}`);

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
        let dragstarted=false;
        const mapelement=document.getElementById("mapplot");
        mapelement.addEventListener("mousedown", ()=>{
            dragstarted=false;
        })
        mapelement.addEventListener("mousemove", ()=>{
            dragstarted=true;
        })
        plot.on("plotly_click", function(eventdata){
            if (dragstarted){
                return;
            }
            const point=eventdata.points[0];
            const iso3=point.location;
            const selectedvariable=document.getElementById("variable").value;
            document.getElementById("variableselect").value=selectedvariable;
            document.getElementById("countryinput").value=iso3;
            document.getElementById("endyear").value=parseInt(document.getElementById("yearinput").value);
            showview(0);
        })
    })
}

drawmap();