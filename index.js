const fetch = require('node-fetch');
const _ = require('lodash');
const initDb = require('./db.js');
const addUser = require('./db.js');
const add = require('./db.js');
const getStation = require('./db.js');
const TeleBot = require('telebot');
var fs = require("fs")
const bot = new TeleBot({
  token: '416570446:AAG--rwfc24ePpVrjBBnRUkFlIZkC9lqhAg',
  usePlugins: ['askUser']
});

fs.exists("trains.sqlite", function(exists) {
  if (exists) {
    return null
  } else {
    initDb.initDb()
  }
});

function getStations () {
  return fetch('http://orari.eavsrl.it/Orari/integrazione5/Orariodinamico/produzione/www/FrontJS/jsonServer.asp?l=it&v=stazioni&r=elencoAliasStazioni')
    .then(function (res) {
      return res.text();
    }).then(function (body) {
      stations = JSON.parse(body.slice(1, -1));
      return stations
    });
}

function getStationID(station_departure , station_arrival) {
  return getStations()
  .then(function (stations) {
    let station_1 = stations.stazioni.find((name_stations) => name_stations.nome_staz == station_departure);
    let station_2 = stations.stazioni.find((name_stations) => name_stations.nome_staz == station_arrival);
    return [station_1, station_2]
  });
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

bot.on(['/start'], function (msg) {
  msg.reply.text('Ciao, benventuo nel bot della vesuviana');
  const id = msg.from.id
  addUser.addUser(id)
  return bot.sendMessage(id, 'Da dove vuoi partire?', {ask:'station_departure'})
});

bot.on('ask.station_departure', msg => {
    const id = msg.from.id;
    const station_departure = msg.text;
    add.addDeparture(id, msg.text)
    return bot.sendMessage(id, `Adesso, dove vuoi arrivare?`, {ask: 'station_arrival'});
});

bot.on('ask.station_arrival', msg => {
    const id = msg.from.id;
    const station_departure = msg.text;
    add.addArrive(id, station_departure)
    getStation.getStation(id)
    .then(function (stations) {
      let departure = stations.departure;
      let arrive = stations.arrive;
      return getTrip(departure, arrive);
    })
    .then(function (stations) {
      console.log(stations)
    });
})

bot.start();
