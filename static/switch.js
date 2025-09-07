let currentview='graph';

function toggle() {
    const container=document.getElementById('container');
    if (currentview==='graph') {
        container.style.transform='translateX(-100vw)';
        currentview='map';
    } else {
        container.style.transform='translateX(0)';
        currentview='graph';
    }
}