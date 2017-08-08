const fetch = require('node-fetch');

function getStations (station_departure, station_arrive, station_time) {
    return getStationForTrip(station_departure, station_arrive, station_time)
};

// Get trip
function getStationForTrip(station_departure, station_arrive, station_time) {
  date = new Date
  return fetch(`http://orari.eavsrl.it/Orari/integrazione5/Orariodinamico/produzione/www/FrontJS/jsonServer.asp?l=it&r=Soluzioni&v=LeSoluzioni&idStazionePartenza=${station_departure}&idStazioneArrivo=${station_arrive}&dataPartenza=${date.getDate().length = 1 ? "0" + date.getDate() : date.getDate() }/${date.getMonth().length = 1 ? "0" + date.getDate() : date.getDate() }/${date.getFullYear()}&oraPartenza=${station_time}&minPartenza=00&jsoncallback=jsonp1502182788639&_=1502182788875`)
  .then(function (res) {
    return res.text();
  }).then(function (body) {
    stations = JSON.parse(body.slice(19, -1));
    return stations;
  });
}

module.exports.getStations = getStations;
module.exports.getStationForTrip = getStationForTrip;
