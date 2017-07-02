var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('trains.sqlite');
var fs = require("fs")

let initDb = function () {
  db.serialize(function () {
    db.run("CREATE TABLE trains (user_id TEXT NOT NULL, departure TEXT NOT_NULL, arrive TEXT NOT_NULL)");
  });
}

let addUser = function (user_id) {
  db.run("INSERT INTO trains (user_id) VALUES ($user_id)", {
      $user_id: user_id,
  });
}

let addDeparture = function (user_id, message) {
  db.run("UPDATE trains SET departure=$departure WHERE user_id=$user_id", {
      $user_id: user_id,
      $departure: message,
  });
}

let addArrive = function (user_id, message) {
  db.run("UPDATE trains SET arrive=$arrive WHERE user_id=$user_id", {
      $user_id: user_id,
      $arrive: message,
  });
}

let getStationUser = function (user_id) {
  return new Promise((resolve,reject ) => {
    db.get("SELECT departure, arrive FROM trains where user_id=?", [user_id], function(err, stations) {
      resolve(stations)
    })
  })
}

module.exports.addUser = addUser;
module.exports.addDeparture = addDeparture;
module.exports.addArrive = addArrive;
module.exports.getStationUser = getStationUser;
