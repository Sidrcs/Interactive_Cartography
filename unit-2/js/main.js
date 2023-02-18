function intialize(){
    displayContent();
    myMap();
    credits();
}

function displayContent(){
    var myContent = document.getElementById('mycontent').innerHTML ="<b>Simple base map using Leaflet.js</b>"
};

function credits(){
    var cred = document.getElementById('credits').innerHTML = 'Ⓒ Sid (ramavajjala@wisc.edu)';
}

function myMap(){

    var map = L.map('map').setView([43.0722, -89.4008],13); //13 is a zoom level of the map

    //add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20}).addTo(map);

};

window.onload = intialize();

