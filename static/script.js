let clickeddata=null;

let messages=[
    {
        role: "system",
        content: "you are a data analyst bot. data context: year=..., value=..., variable=..., country=...."
    }
];

window.onload=function (){
    const urlparams=new URLSearchParams(window.location.search);
    const countryparam=urlparams.get("country");
    const variableparam=urlparams.get("variable");

    if(countryparam){
        document.getElementById("countryinput").value=countryparam;
    }
    if(variableparam){
        document.getElementById("variableselect").value=variableparam;
    }

    window.loaddata=async function (){
        const plotdiv=document.getElementById("plot");
        const country=document.getElementById("countryinput").value;
        const variable=document.getElementById("variableselect").value;
        const startyear=parseInt(document.getElementById("startyear").value)||2010;
        const endyear=parseInt(document.getElementById("endyear").value)||2020;

        const endpointmap={
            gdp: "gdp",
            imports: "imports",
            exports: "exports",
            debt: "debt"
        };
        const endpoint=endpointmap[variable];
        const tracename=`${variable.toUpperCase()} (${country})`;
        if (plotdiv.data && plotdiv.data.some(trace=>trace.name===tracename)){
            return;
        }

        const response=await fetch(`https://economics-visualizer.onrender.com/${endpoint}?country=${country}&startyear=${startyear}&endyear=${endyear}`);
        const data=await response.json();

        const trace={
            x: data.years,
            y: data.values,
            type: "scatter",
            mode: "lines+markers",
            name: `${variable.toUpperCase()} (${country})`,
                customdata: data.years.map((year, i) => ({
                country,
                variable,
                year
            }))
        };

        if (!plotdiv.data || plotdiv.data.length===0){
            Plotly.newPlot(plotdiv, [trace], {hovermode: "closest", plot_bgcolor: "#fffcf2", paper_bgcolor: "#fffcf2"}).then(function (plot){
                plot.on("plotly_click", function (eventdata){
                    const point=eventdata.points[0];
                    const value=point.y;

                    const{country: clickedcountry, variable: clickedvariable, year}=point.customdata;

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