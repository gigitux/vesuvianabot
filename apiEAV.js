const fetch = require('node-fetch');
const Fuse = require('fuse.js');
const querystring = require('querystring');
const config = require('./config');

function fetchStations () {
  const { baseUrl } = config;
  const formData = querystring.stringify({
    id: '1'
  });
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: formData
  };
  return fetch(`${baseUrl}/Home/DestinazioniFromStazione`, init);
}

function getInfoStation (station) {
  return fetchStations()
    .then((res) => res.json())
    .then((json) => {
      const options = {
        shouldSort: true,
        threshold: 0.4,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          'Descrizione'
        ]
      };
      const fuse = new Fuse(json, options);
      const result = fuse.search(station);
      return result;
    });
}

function getTrip (date, stationArrival, time, stationDeparture) {
  const { baseUrl } = config;
  const formData = querystring.stringify({
    data: date,
    destinazione: stationArrival,
    ora: `${time}:01`,
    origine: stationDeparture
  });
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: formData
  };
  return fetch(`${baseUrl}/Home/Create`, init);
}

module.exports.fetchStations = fetchStations;
module.exports.getInfoStation = getInfoStation;
module.exports.getTrip = getTrip;
