function getDate () {
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  const year = date.getFullYear();
  month = month + 1;
  if ((String(day)).length === 1) {
    day = '0' + day;
  }
  if ((String(month)).length === 1) {
    month = '0' + month;
  }
  return `${day}/${month}/${year}`;
}

function getTime (date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes}`;
}

module.exports.getDate = getDate;
module.exports.getTime = getTime;
