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
}