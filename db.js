var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('trains.sqlite');

let initDb = function () {
  db.run("CREATE TABLE trains (user_id TEXT NOT NULL UNIQUE, departure TEXT NOT_NULL, arrive TEXT NOT_NULL, time TEXT NOT_NULL)");
};

let addUser = function (user_id) {
  db.run("INSERT OR IGNORE INTO trains (user_id) VALUES ($user_id)", {
    $user_id: user_id,
  });
};

let addDeparture = function (user_id, message) {
  db.run("UPDATE trains SET departure=$departure WHERE user_id=$user_id", {
    $user_id: user_id,
    $departure: message,
  });
};

let addArrive = function (user_id, message) {
  db.run("UPDATE trains SET arrive=$arrive WHERE user_id=$user_id", {
    $user_id: user_id,
    $arrive: message,
  });
};

let addTime = function (user_id, message) {
  db.run("UPDATE trains SET time=$time WHERE user_id=$user_id", {
    $user_id: user_id,
    $time: message,
  });
};

let addCounter = function (user_id) {
  db.run("UPDATE trains SET counter=counter + 1 WHERE user_id=$user_id", {
    $user_id: user_id,
  });
};
let getStationsUser = function (user_id) {
  return new Promise((resolve,reject) => {
    db.get("SELECT departure, arrive, time FROM trains where user_id=?", [user_id], function(err, stations) {
      return resolve(stations);
    });
  });
};

let deleteStationsUser = function (user_id) {
  return new Promise((resolve,reject) => {
    db.get("DELETE departure, arrive, time FROM trains where user_id=?", [user_id], function(err, stations) {
      resolve(stations);
    });
  });
};

let checkStationUser = (stations) => {
  return new Promise((resolve,reject) => {
    db.all(`SELECT * FROM stations WHERE nome_staz LIKE '%${stations}%'`, function(err, station) {
      return resolve(station)
    });
  })
};

module.exports.initDb = initDb;
module.exports.addUser = addUser;
module.exports.addDeparture = addDeparture;
module.exports.addArrive = addArrive;
module.exports.addTime = addTime;
module.exports.addCounter = addCounter;
module.exports.getStationsUser = getStationsUser;
module.exports.checkStationUser = checkStationUser;
module.exports.deleteStationsUser = deleteStationsUser;
