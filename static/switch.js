document.addEventListener("DOMContentLoaded", function () {
    let currentindex=0;
    const views=["graph", "map", "currency", "profile"];
    const container=document.getElementById("container");
    window.showview=function(index){
        currentindex=index;
        container.style.transform=`translateX(-${index*100}vw)`;
    }
    document.getElementById("rightarrow").addEventListener("click", ()=>{
        currentindex=(currentindex+1)%views.length;
        showview(currentindex);
    });
    document.getElementById("leftarrow").addEventListener("click", ()=>{
        currentindex=(currentindex-1+views.length)%views.length;
        showview(currentindex);
    });
})

window.openinapp=async function(targetapp){
    const {iso3, variable, year}=window.clickedcountry||{};

    if (targetapp==="graph") {
        document.getElementById("countryinput").value=iso3;
        document.getElementById("variableselect").value=variable;
        document.getElementById("endyear").value=year;
        showview(0);
    } else if (targetapp==="currency") {
        const currencycode=await getcurrencycode(iso3);
        if (currencycode) {
            document.getElementById("basecurrency").value=currencycode;
        }
        showview(2);
    } else if (targetapp==="profile") {
        document.getElementById("countryprofileinput").value=iso3;
        showview(3);
        loadprofile();
    }

    document.getElementById("mappopup").style.display="none";
}
async function getcurrencycode(iso3) {
    const response=await fetch(`https://restcountries.com/v3.1/alpha/${iso3}`);
    const data=await response.json();

    const currencies=data[0].currencies;
    const currencycode=Object.keys(currencies)[0];
    return currencycode;
}