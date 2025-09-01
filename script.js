let clickeddata=null;
async function loaddata(){
    const country=document.getElementById("countryinput").value;

    const response=await fetch(`http://localhost:8000/getgdp?country=${country}`);
    const data=await response.json();

    const trace={
        x: data.years,
        y: data.values,
        type: "scatter",
        mode: "lines+markers",
        name: `GDP (${country})`,
    };
    Plotly.newPlot("plot", [trace]);
    const plotdiv=document.getElementById("plot");

    plotdiv.on("plotly_click", function(eventdata){
        const point=eventdata.points[0];
        const year=point.x;
        const value=point.y;

        clickeddata={
            year: year,
            value: value,
            country: country,
            variable: "gdp"
        }

        document.getElementById("info").innerHTML=`
            <p>
                <strong>Year:</strong> ${year}<br>
                <strong>Value:</strong> ${value.toLocaleString()}<br>
                <strong>Country:</strong> ${country}<br>
                <strong>Variable:</strong> GDP
            </p>
        `;
    })
}