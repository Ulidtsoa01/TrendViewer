const tickerById = new Map();
const tickerByName = new Map();

exports.getTickerById = (id) => tickerById.get(id);
exports.getTickerByName = (name) => tickerByName.get(name);

exports.updateTickers = (tickers) => {
  tickers.map((t) => {
    tickerById.set(t._id, t);
    tickerByName.set(t.name, t);
  });
};

exports.getTickerNames = () => tickerByName;

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
