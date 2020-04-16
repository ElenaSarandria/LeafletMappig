// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

//Change the magnitude
//Create the loop for circle's color (magnitude)
function circleSize(magnitude) {
    return magnitude * 25000;
}

function circleColor(magnitude) {
    if (magnitude <= 1) {
        return "#2fff78";
    } else if (magnitude <= 2) {
        return "#c8ff2f";
    } else if (magnitude <= 3) {
        return "#f8ff2f";
    } else if (magnitude <= 4) {
        return "#ffc12f";
    } else if (magnitude <= 5) {
        return "#ff862f";
    } else {
        return "#ff2f2f";
    };
}

// Define a function we want to run once for each feature in the features array
// Give each feature a popup describing the place and time of the earthquake
function createFeatures(earthquakeData) {
    var earthquakes = L.geoJson(earthquakeData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place +
                "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " + feature.properties.mag + "</p>")
        },
        pointToLayer: function(feature, latlng) {
            return new L.circle(latlng, {
                radius: circleSize(feature.properties.mag),
                fillColor: circleColor(feature.properties.mag),
                fillOpacity: 1,
                stroke: true,
                weight: 0.6,
                color: "white"
            })
        }
    });



    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var OceanBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
        maxZoom: 13,
        id: "mapbox.oceanbasemap",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Ocean Base Map": OceanBasemap,
        "Dark Map": darkmap,
        "Street Map": streetmap
    };

    // Create overlay object to hold our overlay layer
    var tectonicPlates = new L.LayerGroup();
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 3,
        layers: [darkmap, earthquakes, tectonicPlates]
    });

    //Add Fault lines data
    d3.json(tectonicPlatesURL, function(plateData) {
        L.geoJson(plateData, {
                color: "#2fe3ff",
                weight: 2
            })
            .addTo(tectonicPlates);
    });



    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [0, 1, 2, 3, 4, 5];

        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + circleColor(magnitudes[i] + 1) + '"></i> ' +
                +magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
        }
        return div;
    };
    legend.addTo(myMap);
}