var map = L.map('map').setView([51.505,-0.09],13)

//add tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20}).addTo(map);  
    
    //add a point marker
    var marker = L.marker([51.5, -0.09]).addTo(map);

    //add a circular marker
    var circle = L.circle([51.508, -0.11], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,    radius: 500
    }).addTo(map);

    //add a polygon
    var polygon = L.polygon([
        [51.509, -0.08],
        [51.503, -0.06],
        [51.51, -0.047]
    ]).addTo(map);

    marker.bindPopup('<strong> Hello World! </strong> <br /> I am a popup.').openPopup();
    circle.bindPopup('I am a circle.');
    polygon.bindPopup('I am a polygon.');

    //popup is labeled at a place
    var popup = L.popup()
        .setLatLng([51.5, -0.09])
        .setContent('I am a standalone popup.')
        .openOn(map)

        
    var popup = L.popup();

    function onMapClick(e){
        popup
            .setLatLng(e.latlng)
            .setContent('You clicked at '+ e.latlng.toString())
            .openOn(map);
    }

    function credits(){
        var cred = document.getElementById('credits').innerHTML = 'Ⓒ Sid (ramavajjala@wisc.edu)';
    }

    credits();

map.on('click',onMapClick);
