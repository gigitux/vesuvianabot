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
    return bot.sendMessage(id, `A che ora vuoi partire?`, {ask: 'station_time'});
})

// Request time
bot.on('ask.station_time', msg => {
  const id = msg.from.id;
  const station_time = msg.text.slice(0,2);
  if (!isNaN(station_time)) {
    db.addTime(id, station_time);
  // Fetch user's station from id
  db.getStationUser(id)
  .then(stations_user => apiEAV.getStations(stations_user.departure, stations_user.arrive, stations_user.time))
  .then((trip) => {if (trip instanceof Error) {
    var error = trip
    throw error
  } else {
    for (var i = 0; i < 4; i++) {
      msg.reply.text(`🚆 PARTENZA DA: ${trip.LeSoluzioni[0].soluzioni[i].stazpartenza} ⌛ ${trip.LeSoluzioni[0].soluzioni[i].orapartenza} \n \n` +
                    `🚆 ARRIVO A: ${trip.LeSoluzioni[0].soluzioni[i].stazarrivo}   ⌛ ${trip.LeSoluzioni[0].soluzioni[i].oraarrivo}`)
    }
  }
  })
  .catch(error =>{console.log("entro in errore"); msg.reply.text("ENTRO IN ERRORE")})
  } else {
  return bot.sendMessage(id, `A che ora vuoi partire?`, {ask: 'station_time'});
  };
});

bot.start();
