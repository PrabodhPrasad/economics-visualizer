let clickeddata=null;

let messages=[
    {
        role: "system",
        content: "you are a data analyst bot. data context: year=..., value=..., variable=..., country=...."
    }
];

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
                customdata: data.years.map((_, i) => ({
                country,
                variable
            }))
        };

        if (!plotdiv.data || plotdiv.data.length === 0) {
            Plotly.newPlot(plotdiv, [trace]).then(function (plot) {
                plot.on("plotly_click", function (eventdata) {
                    const point=eventdata.points[0];
                    const year=point.x;
                    const value=point.y;

                    const{country: clickedcountry, variable: clickedvariable}=point.customdata;

                    clickeddata={
                        year: year,
                        value: value,
                        country: clickedcountry,
                        variable: clickedvariable
                    };
                    document.getElementById("clickafter").style.display="block";

                    document.getElementById("info").innerHTML=`
                        <p>
                            <strong>year:</strong> ${year}<br>
                            <strong>value:</strong> ${value.toLocaleString()}<br>
                            <strong>country:</strong> ${clickedcountry}<br>
                            <strong>variable:</strong> ${clickedvariable.toUpperCase()}
                        </p>
                    `;
                });
            });
        } else {
            Plotly.addTraces(plotdiv, [trace]);
        }
    };

    window.ask=async function(){

        const questioninput=document.getElementById("userquestion");
        const question=questioninput.value.trim();

        messages.unshift({
            role: "system",
            content:`you are a data analyst bot. data context: year=${clickeddata.year}, value=${clickeddata.value}, variable=${clickeddata.variable}, country=${clickeddata.country}.`
        });

        messages.push({role: "user", content: question})

        const response=await fetch("http://localhost:8000/chat",{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({messages})
        });

        const data=await response.json();
        messages.push({role: "assistant", content: data.response})
        document.getElementById("response").innerText=data.response;
        questioninput.value="";
    };
};