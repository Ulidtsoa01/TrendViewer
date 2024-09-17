const accounts = new Map();
const counters = new Map();
const tickerById = new Map();
const tickerByName = new Map();
const dbclient = require('./dbclient');

exports.getTickerById = (id) => tickerById.get(id);
exports.getTickerByName = (name) => tickerByName.get(name);

exports.updateTickers = (tickers) => {
  tickers.forEach((t) => {
    tickerById.set(t._id, t);
    tickerByName.set(t.name, t);
  });
};

exports.getTickerNames = () => tickerByName;

exports.addTicker = (obj) => {
  tickerById.set(obj._id, obj);
  tickerByName.set(obj.name, obj);
};
exports.getMaxTickerId = () => {
  let tickerIdArray = Array.from(tickerById.keys());
  let result = tickerIdArray.reduce((maxId, currentValue) => Math.max(maxId, currentValue), 0);
  return result;
};

exports.updateAccounts = () => {
  try {
    dbclient
      .recorddb()
      .collection('account')
      .find()
      .toArray()
      .then((objs) => {
        accounts.clear();
        if (objs.length > 0) {
          for (const obj of objs) {
            accounts.set(obj._id, obj);
          }
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
        if (objs.length > 0) counters.set('tickerjournal', objs[0]._id);
      });
    dbclient
      .recorddb()
      .collection('activity')
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray()
      .then((objs) => {
        if (objs.length > 0) counters.set('activity', objs[0]._id);
      });
    dbclient
      .recorddb()
      .collection('marketassessment')
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .toArray()
      .then((objs) => {
        if (objs.length > 0) counters.set('marketassessment', objs[0]._id);
      });
  } catch (e) {
    console.error(e);
  }
};

exports.incrementCounter = (key) => {
  counters.set(key, counters.get(key) + 1);
};

exports.getCounters = (key) => counters.get(key);

exports.PortfolioMap = {
  core: 'Core',
  watch: 'Under Watch',
  rb: 'Rule Breaker',
  hy: 'High Yield',
  industry: 'Industry ETF',
};

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

// for climax
const CLIMAX_RANGE = 100;
const CLIMAX_WINDOW = 20;

const calcSMA = (smaDays, quotes, sma) => {
  let sum = 0;
  for (let i = 0; i < smaDays; i++) {
    sum += quotes[i].close;
  }
  sma[0] = sum / smaDays;
  for (let j = 1; j < CLIMAX_RANGE; j++) {
    sum -= quotes[j - 1].close;
    sum += quotes[j - 1 + smaDays].close;
    sma[j] = sum / smaDays;
  }
};

const calcClimax = (smaDays, sma, sma2, climaxInfo) => {
  let max = -1000000.0;
  let maxday = 0;
  let min = 1000000.0;
  let minday = 0;
  for (let i = 0; i < CLIMAX_RANGE; i++) {
    let diff = sma[i] - sma2[i];
    if (diff > max) {
      max = diff;
      maxday = i;
    }
    if (diff < min) {
      min = diff;
      minday = i;
    }
  }

  if (minday < CLIMAX_WINDOW) {
    climaxInfo.buyClimax += `, ${smaDays}-${minday}`;
  }

  if (maxday < CLIMAX_WINDOW) {
    climaxInfo.sellClimax += `, ${smaDays}-${maxday}`;
  }
};

const initClimaxInfo = () => {
  return {
    SMA2: new Array(CLIMAX_RANGE),
    SMA5: new Array(CLIMAX_RANGE),
    SMA13: new Array(CLIMAX_RANGE),
    SMA18: new Array(CLIMAX_RANGE),
    SMA25: new Array(CLIMAX_RANGE),
    SMA50: new Array(CLIMAX_RANGE),
    SMA200: new Array(CLIMAX_RANGE),
    buyClimax: '',
    sellClimax: '',
  };
};

const prepareSMA = (quotes, climaxInfo) => {
  calcSMA(2, quotes, climaxInfo.SMA2);
  calcSMA(5, quotes, climaxInfo.SMA5);
  calcSMA(13, quotes, climaxInfo.SMA13);
  calcSMA(18, quotes, climaxInfo.SMA18);
  calcSMA(25, quotes, climaxInfo.SMA25);
  calcSMA(50, quotes, climaxInfo.SMA50);
  calcSMA(200, quotes, climaxInfo.SMA200);
};

exports.produceClimax = (tickerName, quotes) => {
  if (quotes.length < 200 + CLIMAX_RANGE) {
    if (quotes.length > 0) {
      console.log(`Skip calculating climax for ${tickerName}, due to insufficient quote size at ${quotes.length}`);
    }
    return ['NoData', 'NoData'];
  }

  const climaxInfo = initClimaxInfo();
  prepareSMA(quotes, climaxInfo);

  calcClimax(2, climaxInfo.SMA2, climaxInfo.SMA200, climaxInfo);
  calcClimax(5, climaxInfo.SMA5, climaxInfo.SMA200, climaxInfo);
  calcClimax(13, climaxInfo.SMA13, climaxInfo.SMA200, climaxInfo);
  calcClimax(18, climaxInfo.SMA18, climaxInfo.SMA50, climaxInfo);
  calcClimax(25, climaxInfo.SMA25, climaxInfo.SMA200, climaxInfo);
  calcClimax(50, climaxInfo.SMA50, climaxInfo.SMA200, climaxInfo);

  let buyClimax = climaxInfo.buyClimax.length === 0 ? '' : climaxInfo.buyClimax.substring(2);
  let sellClimax = climaxInfo.sellClimax.length === 0 ? '' : climaxInfo.sellClimax.substring(2);

  return [buyClimax, sellClimax];
};
