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
    'nome_staz'
  ]
};

// Get stations ID
function getStationID(station_departure , station_arrival) {
  var fuse = new Fuse(stations.stazioni, options)
  let station_1 = fuse.search(station_departure);
  let station_2 = fuse.search(station_arrival);
  if (station_1.length != 1 || station_2.length != 1) {
    debugger
    return null;
  } else {
    return {station_1, station_2};
  }
}

// Get trip
function getTrip(trip) {
  let station_departure_code = trip.station_1[0].cod_stazione;
  let station_arrival_code = trip.station_2[0].cod_stazione;
  return fetch(`http://www.eavsrl.it/web/orari?l=it&idStazionePartenza=${station_departure_code}&idStazioneArrivo=${station_arrival_code}&dataPartenza=03/07/2017&oraPartenza=21&minPartenza=23`)
    .then(function (res) {
      return res.text();
    }).then(function (body) {
      stations = JSON.parse(body.slice(1, -1));
      console.log(stations)
      return stations;
    })
};

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
    .then((trip) => getTrip(trip))
};


module.exports.getStations = getStations;
