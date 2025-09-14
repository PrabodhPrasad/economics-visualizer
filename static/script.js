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
    if (countryparam||variableparam) {
        loaddata();
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

        const response=await fetch(`https://economics-visualizer.onrender.com/${endpoint}?country=${country}&startyear=${startyear}&endyear=${endyear}`);
        //const response=await fetch(`/${endpoint}?country=${country}&startyear=${startyear}&endyear=${endyear}`);

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

        function arraysequal(a, b) {
            if (!a||!b) return false;
            if (a.length!==b.length) return false;
            for (let i=0; i<a.length; i++) {
                if (a[i]!==b[i]) return false;
            }
            return true;
        }
        function issametrace(existingtrace, newtrace) {
            if (!arraysequal(existingtrace.x, newtrace.x)) return false;
            if (!arraysequal(existingtrace.y, newtrace.y)) return false;
            if (existingtrace.name!==newtrace.name) return false;
            return true;
        }

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
        }
        else{
            const existingtraces=plotdiv.data||[];
            const ae=existingtraces.some(t=>issametrace(t, trace));
            if (!ae){
                Plotly.addTraces(plotdiv, [trace]);
            }
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

        //"/chat"
        const response=await fetch("https://economics-visualizer.onrender.com/chat",{
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