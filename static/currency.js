async function loadcurrencydata(base="USD", target="EUR", start="2010-01-01", end="2020-12-31") {
    const response=await fetch(`https://economics-visualizer.onrender.com/currency/history?base=${base}&target=${target}&start=${start}&end=${end}`);
    //const response=await fetch(`/currency/history?base=${base}&target=${target}&start=${start}&end=${end}`);
    const data=await response.json();

    const trace={
        x: data.dates,
        y: data.values,
        type: 'scatter',
        mode: 'lines+markers',
        name: `${base} to ${target}`,
        line: {shape: 'spline'},
    };

    const layout={
        plot_bgcolor: "#fffcf2",
        paper_bgcolor: "#fffcf2",
    };
    Plotly.newPlot('currencyplot', [trace], layout);
}
function updateplot(){
    const base=document.getElementById("basecurrency").value.toUpperCase();
    const target=document.getElementById("targetcurrency").value.toUpperCase();
    const start=document.getElementById("startdate").value;
    const end=document.getElementById("enddate").value;
    loadcurrencydata(base, target, start, end);
}