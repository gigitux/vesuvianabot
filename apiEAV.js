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

// Fetch array Stations
function getStations (station_departure, station_arrive, station_time) {
  return fetch('http://orari.eavsrl.it/Orari/integrazione5/Orariodinamico/produzione/www/FrontJS/jsonServer.asp?l=it&v=stazioni&r=elencoAliasStazioni')
    .then(function (res) {
      return res.text();
    }).then(function (body) {
      stations = JSON.parse(body.slice(1, -1));
      return stations;
    })
    .then(() => getStationID(station_departure, station_arrive, station_time))
    .then((trip) => getTrip(trip))
    .catch(error => error);
};

// Get stations ID
function getStationID(station_departure , station_arrival, station_time) {
  var fuse = new Fuse(stations.stazioni, options)
  let station_1 = fuse.search(station_departure);
  let station_2 = fuse.search(station_arrival);
  if (station_1.length != 1 || station_2.length != 1) {
    return null;
  } else {
    return {station_1, station_2, station_time};
  }
}
// Get trip
function getTrip(trip) {
  if (!trip) {
    throw new Error("ERRORE: Devi essere più specifico quando selezioni una stazione");
  } else {
  let station_departure_code = trip.station_1[0].cod_stazione;
  let station_arrival_code = trip.station_2[0].cod_stazione;
  let station_time = trip.station_time;
  return fetch(`http://orari.eavsrl.it/Orari/integrazione5/Orariodinamico/produzione/www/FrontJS/jsonServer.asp?l=it&r=Soluzioni&v=LeSoluzioni&idStazionePartenza=${station_departure_code}&idStazioneArrivo=${station_arrival_code}&dataPartenza=08/07/2017&oraPartenza=${station_time}&minPartenza=00&jsoncallback=jsonp1499119513251&_=1499119513353`)
  .then(function (res) {
    return res.text();
  }).then(function (body) {
    stations = JSON.parse(body.slice(19, -1));
    return stations;
  });
  }
};

module.exports.getStations = getStations;
