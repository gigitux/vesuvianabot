const fetch = require('node-fetch');
const Fuse = require('fuse.js');
var options = {
  shouldSort: true,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "nome_staz"
  ]
};

// Get stations ID
function getStationID(station_departure , station_arrival) {
  console.log(stations.stazioni)
  var fuse = new Fuse(stations.stazioni, options)
  let station_1 = fuse.search(station_departure);
  let station_2 = fuse.search(station_arrival);
  return [station_1, station_2];
};

// Get Trip
function getTrip


// Fetch array Stations
function getStations (station_departure, station_arrive) {
  return fetch('http://orari.eavsrl.it/Orari/integrazione5/Orariodinamico/produzione/www/FrontJS/jsonServer.asp?l=it&v=stazioni&r=elencoAliasStazioni')
    .then(function (res) {
      return res.text();
    }).then(function (body) {
      stations = JSON.parse(body.slice(1, -1));
      return stations;
    })
    .then(() => getStationID(station_departure, station_arrive))
};


module.exports.getStations = getStations;
