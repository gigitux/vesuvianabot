const TeleBot = require('telebot');
const fs = require('fs');
const db = require('./db.js');
const apiEAV = require('./apiEAV.js');

const bot = new TeleBot({
  token: ,
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
  if (!isNaN(station_time) && station_time <= 24) {
    db.addTime(id, station_time);
  } else {
    msg.reply.text('Sembra che non hai inserito un orario corretto');
    return bot.sendMessage(id, `A che ora vuoi partire?`, {ask: 'station_time'});
  }
  // Fetch user's station from id
  db.getStationUser(id)
  .then(stations_user => apiEAV.getStations(stations_user.departure, stations_user.arrive, stations_user.time))
  .then((trip) => {if (trip instanceof Error) {
    var error = trip;
    throw error;
  } else {
    if (trip.LeSoluzioni[0].soluzioni.length === 0) {
      msg.reply.text(`⚠ Non c'è nessuna corsa disponibile`);
    } else {
      let promise = Promise.resolve();
        trip.LeSoluzioni[0].soluzioni.slice(0, 4).map((solution) => {
          promise = promise.then(() => msg.reply.text(`🚆 PARTENZA DA: ${solution.stazpartenza} ⌛ ${solution.orapartenza} \n \n` +
                    `🚆 ARRIVO A: ${solution.stazarrivo}   ⌛ ${solution.oraarrivo}`));
          db.deleteStationUser(id);
        });
    }
  }
  })
  .catch(error => msg.reply.text(error.message));
}
);

bot.start();
