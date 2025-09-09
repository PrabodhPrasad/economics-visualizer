function arraysequal(a, b) {
    if (!a||!b) return false;
    if (a.length!==b.length) return false;
    for (let i=0; i<a.length; i++) {
        if (a[i]!==b[i]) return false;
    }
    return true;
}

function issametrace(existingtrace, newtrace) {
    if(!arraysequal(existingtrace.x, newtrace.x)) return false;
    if(!arraysequal(existingtrace.y, newtrace.y)) return false;
    if(existingtrace.name!==newtrace.name) return false;
    return true;
}

let plotmade=false;

async function loadcurrencydata(base="USD", target="EUR", start="2010-01-01", end="2020-12-31") {
    //const response=await fetch(`https://economics-visualizer.onrender.com/currency/history?base=${base}&target=${target}&start=${start}&end=${end}`);
    const response=await fetch(`/currency/history?base=${base}&target=${target}&start=${start}&end=${end}`);
    const data=await response.json();

    const trace={
        x: data.dates,
        y: data.values,
        type: 'scatter',
        mode: 'lines+markers',
        name: `${base} to ${target}`,
        line: {shape: 'spline'},
    };
    const plotdiv=document.getElementById("currencyplot");
    const layout={
        plot_bgcolor: "#fffcf2",
        paper_bgcolor: "#fffcf2",
    };

    if (!plotdiv.data||plotdiv.data.length===0) {
        Plotly.newPlot(plotdiv, [trace], layout);
    } else {
        const existingtraces=plotdiv.data || [];
        const ae=existingtraces.some(t=>issametrace(t, trace));
        if (!ae){
            Plotly.addTraces(plotdiv, [trace]);
        }
    }
}
function updateplot(){
    const base=document.getElementById("basecurrency").value.toUpperCase();
    const target=document.getElementById("targetcurrency").value.toUpperCase();
    const start=document.getElementById("startdate").value;
    const end=document.getElementById("enddate").value;
    loadcurrencydata(base, target, start, end);
}