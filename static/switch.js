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

window.openinapp=function(targetapp){
    const {iso3, variable, year}=window.clickedcountry||{};

    if (!iso3) return;

    if (targetapp==="graph") {
        document.getElementById("countryinput").value=iso3;
        document.getElementById("variableselect").value=variable;
        document.getElementById("endyear").value=year;
        showview(0);
    } else if (targetapp==="currency") {
        document.getElementById("basecurrency").value=iso3;
        showview(2);
    } else if (targetapp==="profile") {
        document.getElementById("countryprofileinput").value=iso3;
        showview(3);
        loadprofile();
    }

    document.getElementById("mappopup").style.display="none";
}