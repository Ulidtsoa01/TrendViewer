const accounts = new Map();
const counters = new Map();
const tickerById = new Map();
const tickerByName = new Map();
const dbclient = require('./dbclient');

exports.getTickerById = (id) => tickerById.get(id);
exports.getTickerByName = (name) => tickerByName.get(name);

exports.updateTickers = (tickers) => {
  tickers.map((t) => {
    tickerById.set(t._id, t);
    tickerByName.set(t.name, t);
  });
};

exports.getTickerNames = () => tickerByName;

exports.updateAccounts = () => {
  try {
    dbclient
      .recorddb()
      .collection('account')
      .find()
      .toArray()
      .then((objs) => {
        accounts.clear();
        for (const obj of objs) {
          accounts.set(obj._id, obj);
        }
      });
  } catch (e) {
    console.error(e);
  }
};

exports.getAccounts = (key) => accounts.get(key);

exports.createCounters = () => {
  try {
    dbclient
      .recorddb()
      .collection('tickerjournal')
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray()
      .then((objs) => {
        counters.set('tickerjournal', objs[0]._id);
      });
    dbclient
      .recorddb()
      .collection('activity')
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray()
      .then((objs) => {
        counters.set('activity', objs[0]._id);
      });
  } catch (e) {
    console.error(e);
  }
};

exports.incrementCounter = (key) => {
  counters.set(key, counters.get(key) + 1);
};

exports.getCounters = (key) => counters.get(key);

function parseNasdaqMonth(s) {
  switch (s) {
    case 'Jan':
      return 0;
    case 'Feb':
      return 1;
    case 'Mar':
      return 2;
    case 'Apr':
      return 3;
    case 'May':
      return 4;
    case 'Jun':
      return 5;
    case 'Jul':
      return 6;
    case 'Aug':
      return 7;
    case 'Sep':
      return 8;
    case 'Oct':
      return 9;
    case 'Nov':
      return 10;
    case 'Dec':
      return 11;
    default:
      throw new Error('Invalid Nasdaq month: ' + s);
  }
}

exports.parseNasdaqDate = (dateString) => {
  // dateString in this format: "Jul 15, 2024 4:00 PM ET"
  let str = dateString.startsWith('Closed at') ? (dateString = dateString.substring(9)) : dateString;
  let parts = str.trim().split(' ');
  let month = parseNasdaqMonth(parts[0]);
  let day = Number(parts[1].substring(0, parts[1].length - 1));
  let year = Number(parts[2]);

  let date = new Date();
  date.setFullYear(year);
  date.setMonth(month);
  date.setDate(day - 1);
  if (parts.length > 3) {
    let hm = parts[3].split(':');
    let hour = Number(hm[0]);
    let minute = Number(hm[1]);
    if (parts[4] === 'PM') hour += 12;
    date.setHours(hour, minute, 0);
  }

  return date;
};
