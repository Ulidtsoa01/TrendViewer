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

const calcClimax = (portfolio, quoteBlocks) => {
  const quoteListMap = new Map();
  quoteBlocks.forEach((block) => {
    let quoteList = quoteListMap.get(block.tickerId);
    if (quoteList) {
      quoteList = quoteList.concat(block.quotes);
      quoteListMap.set(block.tickerId, quoteList);
    } else {
      quoteListMap.set(block.tickerId, block.quotes);
    }
  });

  portfolio.forEach((p) => {
    let ticker = util.getTickerById(p.tickerId);
    if (ticker.type !== 'Fixed') {
      let quotes = quoteListMap.get(p.tickerId);
      if (quotes && quotes.length > 0) {
        let [buyClimax, sellClimax] = util.produceClimax(p.tickerName, quotes);
        p.buyClimax = buyClimax;
        p.sellClimax = sellClimax;
      } else {
        console.log(`No quotes found for ${p.tickerName}`);
      }
    }
  });
  return portfolio;
};

const loadQuotesToCalcClimax = (portfolio, res) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const tickerIds = portfolio.map((p) => p.tickerId);

  const query = {
    $and: [
      { tickerId: { $in: tickerIds } },
      {
        $or: [{ year: currentYear }, { year: currentYear - 1 }, { $and: [{ year: currentYear - 2 }, { month: { $gt: currentMonth } }] }],
      },
    ],
  };

  try {
    dbclient
      .quotedb()
      .collection('hquote')
      .find(query)
      .sort({ year: -1, month: -1 })
      .toArray()
      .then((quoteBlocks) => {
        res.send(calcClimax(portfolio, quoteBlocks));
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e,
    });
  }
};

exports.getHoldings = (req, res) => {
  let accounts = null,
    activities = null,
    dquotes = null;

  const onLoaded = () => {
    if (accounts && activities && dquotes) {
      let holdings = buildHoldings(accounts, activities, dquotes);
      loadQuotesToCalcClimax(holdings, res);
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

const calculateGain = (activities, dquote, t) => {
  let cost = 0.0,
    sale = 0.0,
    shares = 0.0,
    value = 0.0;
  activities.forEach((act) => {
    switch (act.type) {
      case 'Dividend':
      case 'Gain':
        sale += act.amount;
        break;
      case 'Buy':
        cost += act.amount;
        shares += act.shares;
        break;
      case 'Sell':
        sale += act.amount;
        shares -= act.shares;
        break;
      case 'Split':
        shares *= act.amount / act.shares;
        break;
      default:
        break;
    }
  });

  if (shares > 0) {
    if (dquote == null) {
      console.log(`Missing daily quote for ticker: ${t.name}`);
      return 0;
    }
    value = shares * dquote.last;
  }
  return sale + value - cost;
};

const allSold = (act) => {
  switch (act.type) {
    case 'Buy':
    case 'Sell':
    case 'Split':
      if (act.accumulatedShares < 0.00001) {
        return true;
      }
      break;
    default:
      break;
  }
  return false;
};

const findCurrentActivities = (activityList) => {
  let lastAllSoldIndex = -1;
  for (let i = activityList.length - 1; i >= 0; i--) {
    if (allSold(activityList[i])) {
      lastAllSoldIndex = i;
      break;
    }
  }
  if (lastAllSoldIndex == -1) {
    return null;
  }
  if (lastAllSoldIndex == activityList.length - 1) {
    return [];
  }
  return activityList.slice(lastAllSoldIndex + 1);
};

const buildChartData = (activities, dquote, hquotes, t, res) => {
  account.calcAccumulatedShares(activities);
  activities.forEach((obj) => (obj.accountName = util.getAccounts(obj.accountId).name));

  const chartData = { tickerId: t._id, tickerName: t.name, activities: activities, dquote: dquote, quotes: hquotes };
  if (t.settings.comment) chartData.comment = t.settings.comment;
  if (t.settings.buyLimit) chartData.buyLimit = t.settings.buyLimit;
  if (t.settings.sellStop) chartData.sellStop = t.settings.sellStop;
  chartData.lifetimeGain = calculateGain(activities, dquote, t);

  let currentActivityList = findCurrentActivities(activities);
  if (currentActivityList == null) {
    // the whole list
    chartData.currentGain = chartData.lifetimeGain;
  } else if (currentActivityList.length === 0) {
    chartData.currentGain = 0;
  } else {
    let currentGain = calculateGain(currentActivityList, dquote, t);
    chartData.currentGain = currentGain;
  }

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

const buildHotItems = (dquotes, hotTickers) => {
  const hotItems = [];
  // const holdings = buildHoldings(accounts, activities, dquotes);

  for (const tickerName of hotTickers) {
    let t = util.getTickerByName(tickerName);
    // const h = holdings.find((obj) => obj.tickerId === t._id);
    // if (h) {
    //   hotItems.push(h);
    //   continue;
    // }
    let item = { tickerId: t._id, tickerName: t.name, description: t.description, type: t.type, industry: t.industry, sector: t.sector };

    const dq = dquotes.find((obj) => obj._id === t._id);
    if (dq) item.lastPrice = dq.last;

    if (t.settings) {
      if (t.settings.comment) item.comment = t.settings.comment;
      if (t.settings.tickerClass) item.tickerClass = t.settings.tickerClass;
      if (t.settings.category) item.category = t.settings.category;
      if (t.settings.sellStop) item.sellStop = t.settings.sellStop;
      if (t.settings.buyLimit) item.buyLimit = t.settings.buyLimit;
    }

    hotItems.push(item);
  }
  return hotItems;
};

exports.getHotItems = (req, res) => {
  let dquotes = null,
    hotTickers = null;

  const onLoaded = () => {
    if (dquotes && hotTickers) {
      let hot = buildHotItems(dquotes, hotTickers);
      loadQuotesToCalcClimax(hot, res);
    }
  };
  try {
    // dbclient
    //   .recorddb()
    //   .collection('account')
    //   .find({}, { sort: { name: 1 } })
    //   .toArray()
    //   .then((accts) => {
    //     accounts = accts;
    //     onLoaded();
    //   });
    // dbclient
    //   .recorddb()
    //   .collection('activity')
    //   .find()
    //   .sort({ date: 1 })
    //   .toArray()
    //   .then((acts) => {
    //     activities = acts;
    //     onLoaded();
    //   });
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
const buildWatchItems = (dquotes, pTickers) => {
  const watchItems = [];

  for (const tickerName of pTickers) {
    let t = util.getTickerByName(tickerName);
    let item = { tickerId: t._id, tickerName: t.name, description: t.description, type: t.type, industry: t.industry, sector: t.sector };

    const dq = dquotes.find((obj) => obj._id === t._id);
    if (dq) item.lastPrice = dq.last;

    if (t.settings) {
      if (t.settings.comment) item.comment = t.settings.comment;
      if (t.settings.tickerClass) item.tickerClass = t.settings.tickerClass;
      if (t.settings.category) item.category = t.settings.category;
      if (t.settings.sellStop) item.sellStop = t.settings.sellStop;
      if (t.settings.buyLimit) item.buyLimit = t.settings.buyLimit;
    }

    watchItems.push(item);
  }
  return watchItems;
};

exports.getWatchItems = (req, res) => {
  const portfolioName = util.PortfolioMap[req.params.watchId];

  let dquotes = null,
    pTickers = null;

  const onLoaded = () => {
    if (dquotes && pTickers) {
      let portfolio = buildWatchItems(dquotes, pTickers);
      loadQuotesToCalcClimax(portfolio, res);
    }
  };
  try {
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
      .findOne({ name: portfolioName })
      .then((p) => {
        pTickers = p.tickers;
        onLoaded();
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

const updatePortfolioTickers = (pId, tickerArray, res) => {
  try {
    dbclient
      .recorddb()
      .collection('portfolio')
      .updateOne({ _id: pId }, { $set: { tickers: tickerArray } }, { upsert: true })
      .then(res.send({ message: 'Update porfolio tickers successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.addWatchItem = (req, res) => {
  const portfolioName = req.params.watchId === 'hot' ? 'Hot' : util.PortfolioMap[req.params.watchId];
  const tickerName = req.params.tickerName;

  try {
    dbclient
      .recorddb()
      .collection('portfolio')
      .findOne({ name: portfolioName })
      .then((p) => {
        let tickerArray = p.tickers;
        if (tickerArray.indexOf(tickerName) === -1) {
          tickerArray.push(tickerName);
          tickerArray.sort();
          updatePortfolioTickers(p._id, tickerArray, res);
        } else {
          res.send({ message: 'Ticker already added' });
        }
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.removeWatchItem = (req, res) => {
  const portfolioName = req.params.watchId === 'hot' ? 'Hot' : util.PortfolioMap[req.params.watchId];

  try {
    dbclient
      .recorddb()
      .collection('portfolio')
      .findOne({ name: portfolioName })
      .then((p) => {
        let tickerArray = p.tickers;
        const index = tickerArray.indexOf(req.params.tickerName);
        if (index > -1) {
          tickerArray.splice(index, 1);
        }
        updatePortfolioTickers(p._id, tickerArray, res);
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};
