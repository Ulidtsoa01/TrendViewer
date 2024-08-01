const dbclient = require('./dbclient');
const util = require('./util');

const absorbSellActivity = (act, holding) => {
  // first bought, first sold
  // this is to remove first bought activities, and adjust their remaining dividendShare
  if (holding.activityList.length === 0) {
    return;
  }

  let remainingShares = act.shares;
  while (remainingShares > 0) {
    let first = holding.activityList[0];
    if (first.shares > remainingShares) {
      let newShares = first.shares - remainingShares;
      first.dividendShare = (first.dividendShare * newShares) / first.shares;
      first.amount = (first.amount * newShares) / first.shares;
      first.shares = newShares;
      remainingShares = 0;
    } else {
      remainingShares -= first.shares;
      holding.activityList.shift();
      if (holding.activityList.length === 0) {
        return;
      }
    }
  }
};

const applyActivityToHolding = (act, holding) => {
  switch (act.type) {
    case 'Deposit':
    case 'Interest':
    case 'Withdraw':
      break;
    case 'Expense':
    case 'Gain':
    case 'Dividend':
      // Expense activity should be treated as part of price fluctuation. So it should not affect enterPrice
      let dividendPerShare = act.type === 'Expense' ? -act.amount / holding.number : act.amount / holding.number;
      holding.activityList.forEach((oldAct) => {
        oldAct.dividendShare = oldAct.dividendShare + oldAct.shares * dividendPerShare;
      });
      break;
    case 'Split':
      let splitRatio = act.amount / act.shares;
      holding.number *= splitRatio;
      holding.enterPrice /= splitRatio;
      holding.activityList.forEach((oldAct) => {
        oldAct.shares *= splitRatio;
      });
      break;
    case 'Buy':
      let newNumberBuy = holding.number + act.shares;
      if (newNumberBuy > 0.0001) {
        holding.enterPrice = (holding.number * holding.enterPrice + act.amount) / newNumberBuy;
      } else {
        holding.enterPrice = 0;
      }
      holding.number = newNumberBuy;
      const actCopy = {};
      Object.assign(actCopy, act);
      actCopy.dividendShare = 0;
      holding.activityList.push(actCopy); // make a copy so as not to pollute the original activity
      break;
    case 'Sell':
      let newNumber = holding.number - act.shares;
      // if (newNumber > 0.0001) {
      //     holding.enterPrice = (holding.number * holding.enterPrice - act.amount) / newNumber; // TODO: is this right?
      // } else {
      //     holding.enterPrice = 0;
      // }
      holding.number = newNumber;
      absorbSellActivity(act, holding);
      // Sell activity should affect enterPrice
      if (newNumber > 0.0001) {
        let cost = holding.activityList.reduce((sum, act) => sum + act.amount, 0); // sum up act.amount
        holding.enterPrice = cost / newNumber;
      } else {
        holding.enterPrice = 0;
      }
      break;
    default:
      break;
  }
};

const applyActivityToState = (act, state) => {
  switch (act.type) {
    case 'Deposit':
      state.originalCashAmount += act.amount;
      state.cashAmount += act.amount;
      return;
    case 'Withdraw':
      state.originalCashAmount -= act.amount;
      state.cashAmount -= act.amount;
      return;
    case 'Interest':
      state.cashAmount += act.amount;
      return; // return right away for activities that do not apply to holdings
    case 'Dividend':
    case 'Gain':
      state.cashAmount += act.amount;
      break;
    case 'Expense':
      state.cashAmount -= act.amount;
      break;
    case 'Buy':
      state.cashAmount -= act.amount;
      break;
    case 'Sell':
      state.cashAmount += act.amount;
      break;
    case 'Split':
    default:
      break;
  }

  let holding = state.holdingMap.get(act.tickerId);
  if (!holding) {
    if (act.type === 'Buy' || act.type === 'Sell') {
      holding = {
        accountId: act.accountId,
        tickerId: act.tickerId,
        number: 0,
        enterPrice: 0,
        dividend: 0,
        activityList: [], // only contain Buy activities that not sold yet
      };
      state.holdingMap.set(act.tickerId, holding);
      applyActivityToHolding(act, holding);
    }
  } else {
    applyActivityToHolding(act, holding);
    if (holding.number < 0.0001) {
      state.holdingMap.delete(act.tickerId); // all sold. Holding is deleted
    }
  }
};

const collectHoldings = (state, dquoteMap) => {
  const holdingList = Array.from(state.holdingMap, ([tickerId, holding]) => holding);
  holdingList.forEach((h) => {
    const ticker = util.getTickerById(h.tickerId);
    h.tickerName = ticker.name;
    h.description = ticker.description;
    h.sector = ticker.sector;
    h.industry = ticker.industry;
    h.type = ticker.type;
    if (ticker.settings) {
      h.tickerClass = ticker.settings.class;
      h.comment = ticker.settings.comment;
      h.sellStop = ticker.settings.sellStop;
      h.buyLimit = ticker.settings.buyLimit;
    }
    h.cost = h.enterPrice * h.number;
    h.cost2 = h.activityList.reduce((sum, act) => sum + act.amount, 0); // sum up act.amount
    // cost and cost2 should be identical
    h.dividend = h.activityList.reduce((sum, act) => sum + act.dividendShare, 0); // sum up act.dividenShare
    delete h.activityList;

    if (h.type === 'Fixed') {
      h.value = h.number;
    } else {
      const dq = dquoteMap.get(h.tickerId);
      if (!dq) {
        console.error(`DQuote missing for ${ticker.name}`);
      }
      h.value = dq ? h.number * dq.last : 0;
    }

    h.gain = h.value + h.dividend - h.cost;
    h.gainPercent = (h.gain * 100) / h.cost;
  });
  return holdingList;
};

const calcAccumulatedShares = (activityList) => {
  const accuSharesByTickerId = new Map();
  activityList.forEach((act) => {
    if (act.type !== 'Buy' && act.type !== 'Sell' && act.type !== 'Split') {
      return;
    }
    let accuShare = accuSharesByTickerId.has(act.tickerId) ? accuSharesByTickerId.get(act.tickerId) : 0;
    switch (act.type) {
      case 'Buy':
        accuShare += act.shares;
        break;
      case 'Sell':
        accuShare -= act.shares;
        break;
      case 'Split':
        let splitRatio = act.amount / act.shares;
        accuShare *= splitRatio;
        break;
      default:
    }
    act.accumulatedShares = accuShare;
    accuSharesByTickerId.set(act.tickerId, accuShare);
  });
};

const processAccounts = (accounts, activities, dquotes, req, res) => {
  const dquoteMap = new Map();
  dquotes.forEach((dq) => dquoteMap.set(dq._id, dq));

  // initialize accountMap and accounts
  const accountMap = new Map();
  accounts.forEach((acct) => {
    acct.activityList = [];
    acct.state = {
      originalCashAmount: acct.cash,
      cashAmount: acct.cash,
      holdingMap: new Map(), // tickerId to holding object
    };
    accountMap.set(acct._id, acct);
  });

  // apply one activity at a time to the state of the account
  activities.forEach((act) => {
    let acct = accountMap.get(act.accountId);
    acct.activityList.push(act);
    applyActivityToState(act, acct.state);
  });

  // collect the result from the state to the account
  accounts.forEach((acct) => {
    acct.originalCashAmount = acct.state.originalCashAmount;
    acct.cashAmount = acct.state.cashAmount;
    acct.holdingList = collectHoldings(acct.state, dquoteMap);
    acct.totalAmount = acct.cashAmount + acct.holdingList.reduce((sum, h) => sum + h.value, 0); // sum up holding.value
    acct.gain = acct.totalAmount - acct.originalCashAmount;
    acct.gainPercent = acct.gain / acct.originalCashAmount;
    calcAccumulatedShares(acct.activityList);

    delete acct.state;
  });

  res.send(accounts);
};

exports.getAccounts = function (req, res) {
  let accounts = null,
    activities = null,
    dquotes = null;

  const onLoaded = () => {
    if (accounts && activities && dquotes) {
      processAccounts(accounts, activities, dquotes, req, res);
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
      .find({})
      .sort({ date: 1 })
      .toArray()
      .then((acts) => {
        // oldest first
        activities = acts;
        onLoaded();
      });

    dbclient
      .quotedb()
      .collection('dquote')
      .find({})
      .toArray()
      .then((dqs) => {
        dquotes = dqs;
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.postActivity = function (req, res) {
  let targetObj = { ...req.body };
  if (targetObj.tickerName) {
    let t = util.getTickerByName(req.body.tickerName);
    targetObj.tickerId = t._id;
    delete targetObj.tickerName;
  }

  try {
    if (req.body._id === 0) {
      //create activity
      targetObj._id = util.getCounters('activity') + 1;
      util.incrementCounter('activity');
      dbclient
        .recorddb()
        .collection('activity')
        .insertOne(targetObj)
        .then(res.send({ message: 'Create activity successful' }));
    } else {
      //edit activity
      dbclient
        .recorddb()
        .collection('activity')
        .updateOne({ _id: req.body._id }, { $set: targetObj }, { upsert: true })
        .then(res.send({ message: 'Update activity successful' }));
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.deleteActivity = (req, res) => {
  try {
    dbclient
      .recorddb()
      .collection('activity')
      .deleteOne({ _id: req.params.id })
      .then(res.send({ message: 'Delete activity successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.getValueHistory = (req, res) => {
  try {
    dbclient
      .recorddb()
      .collection('accountvalue')
      .find({ accountId: req.params.accountId })
      .toArray()
      .then((accValues) => {
        let acc = accValues;
        res.send(acc);
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};
