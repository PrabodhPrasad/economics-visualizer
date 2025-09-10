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
})