const TeleBot = require('telebot');
const fs = require("fs")
const db = require('./db.js');
const apiEAV = require('./apiEAV.js');

const bot = new TeleBot({
  token: '416570446:AAG--rwfc24ePpVrjBBnRUkFlIZkC9lqhAg',
  usePlugins: ['askUser']
});

// Check if db exists or not
fs.exists('trains.sqlite', function (exists) {
  if (exists) {
    return null;
  } else {
    db.initDb();
  }
});

bot.on(['/start'], msg => {
  msg.reply.text('Ciao, benventuo nel bot della vesuviana');
  const id = msg.from.id;
  // Add user to DB
  db.addUser(id);
  return bot.sendMessage(id, 'Da dove vuoi partire?', {ask:'station_departure'});
});

// Request to user station departure
bot.on('ask.station_departure', msg => {
  const id = msg.from.id;
  const station_departure = msg.text;
  // Add departure station to DB
  db.addDeparture(id, station_departure);
    return bot.sendMessage(id, `Adesso, dove vuoi arrivare?`, {ask: 'station_arrival'});
});

// Request to user station arrive
bot.on('ask.station_arrival', msg => {
    const id = msg.from.id;
    const station_arrival = msg.text;
    // Add arrive station to DB
    db.addArrive(id, station_arrival)
    // Fetch user's station from id
    db.getStationUser(id)
    .then(stations_user => apiEAV.getStations(stations_user.departure, stations_user.arrive))
    .then((station_final) => console.log(station_final))
})

bot.start();
