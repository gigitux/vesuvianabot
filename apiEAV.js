const fetch = require('node-fetch');
// Fetch array Stations
function getStations () {
  console.log("lollazzo")
  return fetch('http://orari.eavsrl.it/Orari/integrazione5/Orariodinamico/produzione/www/FrontJS/jsonServer.asp?l=it&v=stazioni&r=elencoAliasStazioni')
    .then(function (res) {
      return res.text();
    }).then(function (body) {
      stations = JSON.parse(body.slice(1, -1));
      return stations;
    });
};

// Get stations ID
function getStationID(station_departure , station_arrival) {
    let station_1 = stations.stazioni.find((name_stations) => name_stations.nome_staz == station_departure);
    let station_2 = stations.stazioni.find((name_stations) => name_stations.nome_staz == station_arrival);
    return [station_1, station_2];
};

function getTrip(station_departure, station_arrival) {
  return getStationID(station_departure, station_arrival)
  .then(function (stations) {
    console.log(stations[0].cod_stazione)
    let station_departure = stations[0].cod_stazione
    let station_arrive = stations[1].cod_stazione
    return [station_departure_id, station_arrive_id];
  })
  .then(function (stations_id) {
    let station_departure_id = stations_id[0]
    let station_arrive_id = stations_id[1]
    return fetch(`http://www.eavsrl.it/web/orari?l=it&idStazionePartenza=${station_departure_id}&idStazioneArrivo=${station_arrive_id}&dataPartenza=28/06/2017&oraPartenza=22&minPartenza=17`)
      .then(function (res) {
        return res.text();
      }).then(function (body) {
        stations = JSON.parse(body.slice(1, -1));
        return stations
      });
  })
}

module.exports.getStations = getStations;
