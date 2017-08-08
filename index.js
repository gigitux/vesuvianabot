const TeleBot = require('telebot');
const fs = require('fs');
const db = require('./db.js');
const apiEAV = require('./apiEAV.js');

const bot = new TeleBot({
  token: '',
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
  db.addCounter(id)
  return bot.sendMessage(id, 'Da dove vuoi partire?', {ask:'station_departure'});
});

bot.on(['/lista'], msg => {
  const id = msg.from.id;
  apiEAV.getListStations()
  .then((list) => list.stazioni.map((list) => bot.sendMessage(id, list.nome_staz)))
});

// Request to user station departure
bot.on('ask.station_departure', msg => {
  const id = msg.from.id;
  const station_departure = msg.text;
  // Add departure station to DB
  db.checkStationUser(station_departure)
  .then((station_departure) => {
    let replyMarkup
    if (station_departure.length == 1) {
      db.addDeparture(id, station_departure[0].cod_stazione)
      return bot.sendMessage(id, `Adesso, dove vuoi arrivare?`, {ask: 'station_arrival'});
  } else {
    let replyMarkup = bot.keyboard(([station_departure.map((station) => station.nome_staz)]),{resize: true});
    return bot.sendMessage(id, `Devi essere più specifico`, {ask:'station_departure', replyMarkup});
    }
  });
});

// Request to user station arrive
bot.on('ask.station_arrival', msg => {
  const id = msg.from.id;
  const station_arrival = msg.text;
  // Add departure station to DB
  db.checkStationUser(station_arrival)
  .then((station_arrival) => {
    let replyMarkup
    if (station_arrival.length == 1) {
      db.addArrive(id, station_arrival[0].cod_stazione)
      return bot.sendMessage(id, `A che ora vuoi partire?`, {ask: 'station_time'});
  } else {
    let replyMarkup = bot.keyboard(([station_arrival.map((station) => station.nome_staz)]),{resize: true});
    return bot.sendMessage(id, `Devi essere più specifico`, {ask:'station_arrival', replyMarkup});
    }
  });
});
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
  db.getStationsUser(id)
  .then(stations_user => apiEAV.getStations(stations_user.departure, stations_user.arrive, stations_user.time))
  .then((trip) => {if (trip instanceof Error) {
    var error = trip;
    throw error;
  } else {
    if (trip.LeSoluzioni[0].soluzioni.length === 0) {
      msg.reply.text(`⚠ Non c'è nessuna corsa disponibile`);
    } else {
      const price = trip.LeSoluzioni[0].tariffa.prezzo
      let promise = Promise.resolve();
        trip.LeSoluzioni[0].soluzioni.slice(0, 6).map((solution) => {
          promise = promise.then(() => msg.reply.text(`🚆 PARTENZA DA: ${solution.stazpartenza} ⌛ ${solution.orapartenza} \n \n` +
                    `${(solution.oraarrivocambio1 || solution.oraarrivocambio1) ? "⚠️ CAMBIO A " + solution.stazcambio1 + " ⌛ " + solution.orapartenzacambio1 + "\n \n" : "" }`+
                    `🚆 ARRIVO A: ${solution.stazarrivo}   ⌛ ${solution.oraarrivo} \n \n` +
                    `🎫 PREZZO: ${price} EUR`));
        });
    }
  }
  })
  .catch(error => msg.reply.text(error.message));
}
);

bot.start();
