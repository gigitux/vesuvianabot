const sqlite3 = require('sqlite3').verbose();
const log4js = require('log4js');

function openDb () {
  const db = new sqlite3.Database('trains.sqlite');
  return db;
}

function initDb () {
  const db = openDb();
  db.run('CREATE TABLE trains (user_id TEXT NOT NULL UNIQUE, departure TEXT NOT_NULL, arrive TEXT NOT_NULL, time TEXT NOT_NULL, counter INT NOT_NULL DEFAULT 0)');
}

function addUser (userId) {
  const db = openDb();
  db.run('INSERT OR IGNORE INTO trains (user_id) VALUES ($user_id)', {
    $user_id: userId
  });
}

function addDeparture (userId, message) {
  const db = openDb();
  db.run('UPDATE trains SET departure=$departure WHERE user_id=$user_id', {
    $user_id: userId,
    $departure: message
  });
}

function addArrive (userId, message) {
  const db = openDb();
  db.run('UPDATE trains SET arrive=$arrive WHERE user_id=$user_id', {
    $user_id: userId,
    $arrive: message
  });
}

function addTime (userId, message) {
  const db = openDb();
  db.run('UPDATE trains SET time=$time WHERE user_id=$user_id', {
    $user_id: userId,
    $time: message
  });
}

function addCounter (userId) {
  const db = openDb();
  db.run('UPDATE trains SET counter=counter + 1 WHERE user_id=$user_id', {
    $user_id: userId
  });
}

function getStationsUser (userId) {
  const db = openDb();
  return new Promise((resolve) => {
    db.get('SELECT departure, arrive, time FROM trains where user_id=?', [userId], function (err, stations) {
      if (err) {
        const logger = log4js.getLogger('error');
        logger.error('getStationsUser', err);
        throw new Error('error');
      } else {
        return resolve(stations);
      }
    });
  });
}

function deleteStationsUser (userId) {
  const db = openDb();
  return new Promise((resolve) => {
    db.get('DELETE departure, arrive, time FROM trains where user_id=?', [userId], function (err, stations) {
      if (err) {
        const logger = log4js.getLogger('error');
        logger.error('deleteStationsUser', err);
        throw new Error('error');
      }
      resolve(stations);
    });
  });
}

function checkStationUser (stations) {
  const db = openDb();
  return new Promise((resolve) => {
    db.all(`SELECT * FROM stations WHERE nome_staz LIKE '${stations}%'`, function (err, station) {
      if (err) {
        const logger = log4js.getLogger('error');
        logger.error('checkStationUser', err);
        throw new Error('error');
      }
      return resolve(station);
    });
  });
}

function getListStations () {
  const db = openDb();
  return new Promise((resolve) => {
    db.all(`SELECT nome_staz FROM stations`, function (err, station) {
      if (err) {
        const logger = log4js.getLogger('error');
        logger.error('getListStations', err);
        throw new Error('error');
      }
      return resolve(station);
    });
  });
}

function getAllUsers () {
  const db = openDb();
  return new Promise((resolve) => {
    db.all(`SELECT user_id FROM trains`, function (err, users) {
      if (err) {
        const logger = log4js.getLogger('error');
        logger.error('getAllUsers', err);
        throw new Error('error');
      }
      return resolve(users);
    });
  });
}

module.exports.initDb = initDb;
module.exports.addUser = addUser;
module.exports.addDeparture = addDeparture;
module.exports.addArrive = addArrive;
module.exports.addTime = addTime;
module.exports.addCounter = addCounter;
module.exports.getStationsUser = getStationsUser;
module.exports.checkStationUser = checkStationUser;
module.exports.deleteStationsUser = deleteStationsUser;
module.exports.getListStations = getListStations;
module.exports.getAllUsers = getAllUsers;
