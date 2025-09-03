let clickeddata=null;

window.onload=function (){
    window.loaddata=async function (){
        const plotdiv=document.getElementById("plot");
        const country=document.getElementById("countryinput").value;
        const variable=document.getElementById("variableselect").value;

        const endpointmap={
            getgdp: "getgdp",
            getimports: "getimports",
            getexports: "getexports",
            getdebt: "getdebt"
        };
        const endpoint=endpointmap[variable];

        const response=await fetch(`http://localhost:8000/${endpoint}?country=${country}`);
        const data=await response.json();

        const trace={
            x: data.years,
            y: data.values,
            type: "scatter",
            mode: "lines+markers",
            name: `${variable.toUpperCase()} (${country})`,
        };

        if (!plotdiv.data || plotdiv.data.length === 0) {
            Plotly.newPlot(plotdiv, [trace]).then(function (plot) {
                plot.on("plotly_click", function (eventdata) {
                    const point=eventdata.points[0];
                    const year=point.x;
                    const value=point.y;

                    clickeddata={
                        year: year,
                        value: value,
                        country: country,
                        variable: variable
                    };

                    document.getElementById("info").innerHTML=`
                        <p>
                            <strong>year:</strong> ${year}<br>
                            <strong>value:</strong> ${value.toLocaleString()}<br>
                            <strong>country:</strong> ${country}<br>
                            <strong>variable:</strong> ${variable.toUpperCase()}
                        </p>
                    `;
                });
            });
        } else {
            Plotly.addTraces(plotdiv, [trace]);
        }
    };

    window.ask=async function(){

    const questioninput =document.getElementById("userquestion");
    const question=questioninput.value.trim();

    const messages=[
      {
        role: "system",
        content: `you are a data analyst bot. data context: year=${clickeddata.year}, value=${clickeddata.value}, variable=${clickeddata.variable}, country=${clickeddata.country}.`
      },
      {
        role: "user",
        content: question
      }
    ];

    const response=await fetch("http://localhost:8000/chat",{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data=await response.json();
    document.getElementById("response").innerText=data.response;
  };
};