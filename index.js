const TeleBot = require('telebot');
const fs = require('fs');
const db = require('./db.js');
const apiEAV = require('./apiEAV.js');
const utils = require('./utils.js');
const log4js = require('log4js');

const bot = new TeleBot({
  token: '',
  usePlugins: ['askUser']
});

fs.stat('trains.sqlite', (err, stats) => {
  if (err) {
    db.initDb();
  } else {
    return null;
  }
});

bot.on(['/start'], msg => {
  const id = msg.from.id;
  db.addUser(id);
  db.addCounter(id);
  return bot.sendMessage(id, 'Da dove vuoi partire?', {ask: 'stationDeparture'});
});

bot.on(['/lista'], msg => {
  const id = msg.from.id;
  db.getListStations()
    .then((list) => list.map((list) => bot.sendMessage(id, list.nome_staz)));
});

bot.on('ask.stationDeparture', msg => {
  const id = msg.from.id;
  const stationDeparture = msg.text;
  const station = apiEAV.getInfoStation(stationDeparture);
  station.then((station) => {
    if (station.length === 0) {
      return bot.sendMessage(id, `Non c'è nessuna fermata con questo nome`, {ask: 'stationDeparture'});
    } else if (station.length === 1) {
      const stationCode = station[0].Codice;
      db.addDeparture(id, stationCode);
      return bot.sendMessage(id, `Adesso, dove vuoi arrivare?`, {ask: 'stationArrival'});
    } else if (station.length > 1) {
      let stations = [];
      station.forEach((station) => {
        stations.push(station.Descrizione);
      });
      const replyMarkup = bot.keyboard(([stations]), {resize: true, once: true});
      return bot.sendMessage(id, `Devi essere più specifico`, {ask: 'stationDeparture', replyMarkup});
    }
  });
});

bot.on('ask.stationArrival', msg => {
  const id = msg.from.id;
  const stationArrival = msg.text;
  const station = apiEAV.getInfoStation(stationArrival);
  station.then((station) => {
    if (station.length === 0) {
      return bot.sendMessage(id, `Non c'è nessuna fermata con questo nome`, {ask: 'stationArrival'});
    } else if (station.length === 1) {
      const stationCode = station[0].Codice;
      db.addArrive(id, stationCode);
      return bot.sendMessage(id, `A che ora vuoi partire?`, {ask: 'stationTime'});
    } else if (station.length > 1) {
      let stations = [];
      station.forEach((station) => {
        stations.push(station.Descrizione);
      });
      const replyMarkup = bot.keyboard(([stations]), {resize: true, once: true});
      return bot.sendMessage(id, `Devi essere più specifico`, {ask: 'stationArrival', replyMarkup});
    }
  });
});

bot.on('ask.stationTime', msg => {
  const id = msg.from.id;
  const stationTime = msg.text.slice(0, 2).replace('.', '');
  if (!isNaN(stationTime) && stationTime <= 24) {
    db.addTime(id, stationTime);
  } else {
    msg.reply.text('Sembra che non hai inserito un orario corretto');
    return bot.sendMessage(id, `A che ora vuoi partire?`, {ask: 'stationTime'});
  }
  db.getStationsUser(id)
    .then(userTripInformation => {
      const date = utils.getDate();
      const {departure, arrive, time} = userTripInformation;
      apiEAV.getTrip(date, arrive, time, departure)
        .then((res) => res.json())
        .then((tripsInfo) => tripsInfo)
        .then((tripsInfo) => {
          let promise = Promise.resolve();
          tripsInfo.forEach((trip) => {
            const destination = trip.Descrizione_destinazione;
            const departure = trip.Descrizione_origine;
            const timeDeparture = new Date(parseInt(trip.partenza.substr(6)));
            const timeDestination = new Date(parseInt(trip.arrivo.substr(6)));
            const timeDepartureToString = utils.getTime(timeDeparture);
            const timeDestinationToString = utils.getTime(timeDestination);
            promise = promise.then(() => bot.sendMessage(id, `🚆 PARTENZA DA: ${departure} ⌛ ${timeDepartureToString} \n \n` +
                    `🚆 ARRIVO A: ${destination}   ⌛ ${timeDestinationToString} \n \n`
            ));
          });
        });
    });
});

bot.start();

process.on('uncaughtException', function (exception) {
  const logger = log4js.getLogger('error');
  logger.error('crash bot', exception);
});
