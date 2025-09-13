let profiledata=null;
let messages_profile=[
    {
        role: "system",
        content: "you are a geopolitical data analyst bot. you help interpret country-level data."
    }
];

async function loadprofile() {
    const code=document.getElementById("countryprofileinput").value.trim();
    const output=document.getElementById("output");

    const [countryres, gdpres]=await Promise.all([
        fetch(`https://restcountries.com/v3.1/alpha/${code}`),
        fetch(`https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.PCAP.CD?format=json&per_page=1`)
    ]);
    const countrydata=await countryres.json();
    const gdpdata=await gdpres.json();

    const country=countrydata[0];
    const currencykey=country.currencies?Object.keys(country.currencies)[0]:"n/a";
    const currencyname=currencykey!=="n/a"?country.currencies[currencykey].name:"n/a";

    let gdppercap="n/a";
    if (Array.isArray(gdpdata) && gdpdata[1]?.length>0 && gdpdata[1][0].value!==null) {
        gdppercap = `$${Number(gdpdata[1][0].value).toLocaleString()}`;
    }

    output.innerHTML=`
        <div class="profilecontainer">
            <div class="profiletext">
                <h2>${country.name.common} (${code})</h2>
                <p><strong>region:</strong> ${country.region||"n/a"}</p>
                <p><strong>population:</strong> ${country.population?.toLocaleString()||"n/a"}</p>
                <p><strong>capital:</strong> ${country.capital?.[0]||"n/a"}</p>
                <p><strong>currency:</strong> ${currencyname} (${currencykey})</p>
                <p><strong>gdp per capita:</strong> ${gdppercap}</p>
            </div>
            <img src="${country.flags?.svg}"/>
        </div>
    `;
    profiledata={
        name: country.name.common,
        code: code,
        region: country.region||"n/a",
        population: country.population?.toLocaleString()||"n/a",
        capital: country.capital?.[0]||"n/a",
        currency: `${currencyname} (${currencykey})`,
        gdppercap: gdppercap
    };
    document.getElementById("profileask").style.display="block";

}

async function askprofile() {
    const questioninput=document.getElementById("profilequestion");
    const responsebox=document.getElementById("profileresponse");
    const question=questioninput.value.trim();

    if (!profiledata||!question) return;
    messages_profile.unshift({
        role: "system",
        content: `you are a geopolitical data analyst bot. country context:
        name: ${profiledata.name}
        code: ${profiledata.code}
        reigon: ${profiledata.region}
        population: ${profiledata.population}
        capital: ${profiledata.capital}
        currency: ${profiledata.currency}
        gdp per capita: ${profiledata.gdppercap}`
    });

    messages_profile.push({ role: "user", content: question });
    const response=await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages_profile })
    });

    const data=await response.json();
    messages_profile.push({ role: "assistant", content: data.response });
    responsebox.innerText = data.response;
    questioninput.value="";
}

window.askprofile=askprofile;