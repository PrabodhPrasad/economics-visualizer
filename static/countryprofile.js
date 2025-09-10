async function loadprofile() {
    const code=document.getElementById("countryprofileinput").value.trim();
    const output=document.getElementById("output");

    const [countryres, gdpres] = await Promise.all([
            fetch(`https://restcountries.com/v3.1/alpha/${code}`),
            fetch(`https://api.worldbank.org/v2/country/${code}/indicator/NY.GDP.PCAP.CD?format=json&per_page=1`)
    ]);
    const countrydata=await countryres.json();
    const gdpdata=await gdpres.json();

    const country=data[0];
    const currencykey=country.currencies ? Object.keys(country.currencies)[0] : "N/A";
    const currencyname=currencykey!=="N/A" ? country.currencies[currencykey].name : "N/A";

    output.innerHTML=`
        <h2>${country.name.common} (${code})</h2>
        <p><strong>region:</strong> ${country.region||"N/A"}</p>
        <p><strong>subregion:</strong> ${country.subregion||"N/A"}</p>
        <p><strong>population:</strong> ${country.population?.toLocaleString()||"N/A"}</p>
        <p><strong>capital:</strong> ${country.capital?.[0]||"N/A"}</p>
        <p><strong>currency:</strong> ${currencyname}(${currencykey})</p>
        <img src="${country.flags?.svg}"/>
    `;
}
