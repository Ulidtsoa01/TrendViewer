const dbclient = require('./dbclient');
const util = require('./util');
const account = require('./account');

const buildHoldings = (accounts, activities, dquotes) => {
  const holdings = new Map();
  account.calculateAccounts(accounts, activities, dquotes);
  for (let acc of accounts) {
    for (let holding of acc.holdingList) {
      if (holdings.has(holding.tickerName)) {
        let update = holdings.get(holding.tickerName);
        update.cost += holding.cost;
        update.gain += holding.gain;
        update.number += holding.number;
        update.value += holding.value;
        update.gainPercent = update.gain / update.cost;
        update.enterPrice = update.cost / update.number;
      } else {
        holdings.set(holding.tickerName, holding);
      }
    }
  }
  const holdingArray = Array.from(holdings.values());
  return holdingArray;
};

exports.getHoldings = (req, res) => {
  let accounts = null,
    activities = null,
    dquotes = null;

  const onLoaded = () => {
    if (accounts && activities && dquotes) {
      res.send(buildHoldings(accounts, activities, dquotes));
    }
  };
  try {
    dbclient
      .recorddb()
      .collection('account')
      .find({}, { sort: { name: 1 } })
      .toArray()
      .then((accts) => {
        accounts = accts;
        onLoaded();
      });
    dbclient
      .recorddb()
      .collection('activity')
      .find()
      .sort({ date: 1 })
      .toArray()
      .then((acts) => {
        activities = acts;
        onLoaded();
      });
    dbclient
      .quotedb()
      .collection('dquote')
      .find()
      .toArray()
      .then((dqs) => {
        dquotes = dqs;
        onLoaded();
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};
const buildChartData = (activities, dquote, hquotes, t, res) => {
  account.calcAccumulatedShares(activities);
  activities.forEach((obj) => (obj.accountName = util.getAccounts(obj.accountId).name));

  const chartData = { tickerId: t._id, tickerName: t.name, activities: activities, dquote: dquote, quotes: hquotes };
  if (t.settings.comment) chartData.comment = t.settings.comment;
  if (t.settings.buyLimit) chartData.buyLimit = t.settings.buyLimit;
  if (t.settings.sellStop) chartData.sellStop = t.settings.sellStop;

  res.send(chartData);
};

exports.getChartData = (req, res) => {
  let t = util.getTickerByName(req.params.tickerName);
  let activities = null,
    dquote = null,
    hquotes = null;

  const onLoaded = () => {
    if (activities && dquote && hquotes) {
      buildChartData(activities, dquote, hquotes, t, res);
    }
  };
  try {
    dbclient
      .recorddb()
      .collection('activity')
      .find({ tickerId: t._id })
      .sort({ date: 1 })
      .toArray()
      .then((acts) => {
        activities = acts;
        onLoaded();
      });
    dbclient
      .quotedb()
      .collection('dquote')
      .findOne({ _id: t._id })
      .then((dq) => {
        dquote = dq;
        onLoaded();
      });
    dbclient
      .quotedb()
      .collection('hquote')
      .find({ tickerId: t._id })
      .sort({ year: -1, month: -1 })
      .toArray()
      .then((hqs) => {
        hquotes = [];
        hqs.forEach((qym) => {
          qym.quotes.forEach((q) => {
            q.dateStr = new Date(q.date).toISOString();
            hquotes.push(q);
          });
        });
        onLoaded();
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

const buildHotItems = (accounts, activities, dquotes, hotTickers, req, res) => {
  const hotItems = [];
  const holdings = buildHoldings(accounts, activities, dquotes);

  for (const tickerName of hotTickers) {
    let t = util.getTickerByName(tickerName);
    const h = holdings.find((obj) => obj.tickerId === t._id);
    if (h) {
      hotItems.push(h);
      continue;
    }
    let hotItem = { tickerId: t._id, tickerName: t.name, description: t.description, type: t.type, industry: t.industry, sector: t.sector };

    const dq = dquotes.find((obj) => obj._id === t._id);
    if (dq) hotItem.lastPrice = dq.last;

    if (t.settings) {
      if (t.settings.comment) hotItem.comment = t.settings.comment;
      if (t.settings.tickerClass) hotItem.tickerClass = t.settings.tickerClass;
      if (t.settings.category) hotItem.category = t.settings.category;
      if (t.settings.sellStop) hotItem.sellStop = t.settings.sellStop;
      if (t.settings.buyLimit) hotItem.buyLimit = t.settings.buyLimit;
    }

    hotItems.push(hotItem);
  }
  res.send(hotItems);
};

exports.getHotItems = (req, res) => {
  let accounts = null,
    activities = null,
    dquotes = null,
    hotTickers = null;

  const onLoaded = () => {
    if (accounts && activities && dquotes && hotTickers) {
      buildHotItems(accounts, activities, dquotes, hotTickers, req, res);
    }
  };
  try {
    dbclient
      .recorddb()
      .collection('account')
      .find({}, { sort: { name: 1 } })
      .toArray()
      .then((accts) => {
        accounts = accts;
        onLoaded();
      });
    dbclient
      .recorddb()
      .collection('activity')
      .find()
      .sort({ date: 1 })
      .toArray()
      .then((acts) => {
        activities = acts;
        onLoaded();
      });
    dbclient
      .quotedb()
      .collection('dquote')
      .find()
      .toArray()
      .then((dqs) => {
        dquotes = dqs;
        onLoaded();
      });
    dbclient
      .recorddb()
      .collection('portfolio')
      .findOne({ name: 'Hot' })
      .then((p) => {
        hotTickers = p.tickers;
        onLoaded();
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};
