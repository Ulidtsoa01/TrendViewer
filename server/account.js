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

const processAccount = (account, activities, dquotes) => {
  const dquoteMap = new Map();
  dquotes.forEach((dq) => dquoteMap.set(dq._id, dq));

  // initialize account state
  let state = {
    originalCashAmount: account.cash,
    cashAmount: account.cash,
    holdingMap: new Map(), // tickerId to holding object
  };

  // apply one activity at a time to the state of the account
  activities.forEach((act) => {
    applyActivityToState(act, state);
  });

  // collect the result from the state to the account
  account.originalCashAmount = state.originalCashAmount;
  account.cashAmount = state.cashAmount;
  account.holdingList = collectHoldings(state, dquoteMap);
  account.totalAmount = account.cashAmount + account.holdingList.reduce((sum, h) => sum + h.value, 0); // sum up holding.value
  account.gain = account.totalAmount - account.originalCashAmount;
  account.gainPercent = account.gain / account.originalCashAmount;
  // calcAccumulatedShares(acct.activityList);
};

const addCurrentAccountValue = (account, accountValues, activities, dquotes) => {
  let lastValue = accountValues.length > 0 ? accountValues.slice(-1) : null;
  let now = new Date();
  // console.log(`Last value date: ${lastValue[0].date}, and current date is: ${now.getTime()}`);
  // console.log(lastValue);
  if (!lastValue || now.getTime() > lastValue[0].date) {
    processAccount(account, activities, dquotes);
    let newValue = {
      accountId: account._id,
      cash: account.cashAmount,
      value: account.totalAmount,
      date: now.getTime(),
    };
    accountValues.push(newValue);
  }
};

// const adjustedMonthlyCostBasis = (act, valueDate) => {
//     let actDateObj = new Date(act.date);
//     let valueDateObj = new Date(valueDate);
//     let actDay = actDateObj.getDate();
//     let valueDay = valueDateObj.getDate();
//     return act.amount * (valueDay - actDay) / valueDay;
// };

const adjustedPeriodCostBasis = (act, valueDate, previousPeriodDate) => {
  return (act.amount * (valueDate - act.date)) / (valueDate - previousPeriodDate);
};

const calcAccountPeriodGain = (previousValueInfo, valueInfo, activities) => {
  // the period can be a month or a year
  // sum up all the Deposit or Withdraw activities within this month or year
  let deposit = 0.0,
    withdraw = 0.0;
  let costBasis = previousValueInfo.value;
  let nextActivity = activities.shift();
  while (nextActivity && nextActivity.date <= valueInfo.date) {
    switch (nextActivity.type) {
      case 'Deposit':
        deposit += nextActivity.amount;
        costBasis += adjustedPeriodCostBasis(nextActivity, valueInfo.date, previousValueInfo.date);
        break;
      case 'Withdraw':
        withdraw += nextActivity.amount;
        costBasis -= adjustedPeriodCostBasis(nextActivity, valueInfo.date, previousValueInfo.date);
        break;
      default:
        break;
    }
    nextActivity = activities.shift();
  }
  if (nextActivity) {
    activities.unshift(nextActivity); // put it back for the next month
  }
  let gain = valueInfo.value - previousValueInfo.value - deposit + withdraw;
  return {
    deposit: deposit,
    withdraw: withdraw,
    gain: gain,
    gainPercent: (100.0 * gain) / costBasis,
  };
};

const sumUpAccountMonthlyValue = (accountValues) => {
  // accountvalue is stored per account per month
  // this is to sum all accountvalue's for this month across all accounts
  let cash = 0,
    value = 0;
  let nextValue = accountValues.shift();
  let periodDateObj = new Date(nextValue.date);
  let periodYear = periodDateObj.getFullYear();
  let periodMonth = periodDateObj.getMonth();
  let valueYear = periodYear;
  let valueMonth = periodMonth;
  while (nextValue && valueYear === periodYear && valueMonth === periodMonth) {
    // within an hour
    cash += nextValue.cash;
    value += nextValue.value;
    nextValue = accountValues.shift();
    if (nextValue) {
      let nextValueDateObj = new Date(nextValue.date);
      valueYear = nextValueDateObj.getFullYear();
      valueMonth = nextValueDateObj.getMonth();
    }
  }
  if (nextValue) {
    accountValues.unshift(nextValue); // put it back for next month
  }
  return {
    date: periodDateObj.getTime(),
    cash: cash,
    value: value,
  };
};

const initPreviousMonthValueInfo = (firstValue) => {
  let previousDate = new Date(firstValue.date);
  let currentMonth = previousDate.getMonth();
  if (currentMonth === 0) {
    // January
    let currentYear = previousDate.getFullYear();
    previousDate.setFullYear(currentYear - 1);
    previousDate.setMonth(11);
  } else {
    previousDate.setMonth(currentMonth - 1);
  }
  return {
    cash: 0,
    value: 0,
    date: previousDate.getTime(),
  };
};

const initPreviousYearValueInfo = (firstValue) => {
  let previousDate = new Date(firstValue.date);
  let currentYear = previousDate.getFullYear();
  previousDate.setFullYear(currentYear - 1);
  return {
    cash: 0,
    value: 0,
    date: previousDate.getTime(),
  };
};

const processAccountMonthlyReport = (account, accountValues, activities, dquotes, req, res) => {
  if (accountValues.length === 0) {
    // should not happen
    res.send([]);
    return;
  }
  // add the current value to the end of accountValues
  addCurrentAccountValue(account, accountValues, activities, dquotes);
  let infoList = [];
  let previousValueInfo = initPreviousMonthValueInfo(accountValues[0]);
  while (accountValues.length > 0) {
    let valueInfo = sumUpAccountMonthlyValue(accountValues);
    let gainInfo = calcAccountPeriodGain(previousValueInfo, valueInfo, activities);
    let info = {
      accountId: account._id,
      accountName: account.name,
      date: valueInfo.date,
      cash: valueInfo.cash,
      value: valueInfo.value,
      deposit: gainInfo.deposit,
      withdraw: gainInfo.withdraw,
      gain: gainInfo.gain,
      gainPercent: gainInfo.gainPercent,
      dateString: new Date(valueInfo.date).toISOString(),
    };

    previousValueInfo = valueInfo;
    infoList.push(info);
  }
  res.send(infoList);
};

const skipToDecemberOrLastValue = (accountValues, today) => {
  if (accountValues.length <= 1) {
    return;
  }
  let currentYear = today.getFullYear();
  let nextValue = accountValues.shift();
  let nextValueDateObj = new Date(nextValue.date);
  if (nextValueDateObj.getFullYear() === currentYear) {
    // just skip to the last value that was just added from current holdings
    accountValues.splice(0, accountValues.length - 1);
    return;
  }
  // skip to December
  let nextValueDate = nextValue ? new Date(nextValue.date) : null;
  while (nextValue && nextValueDate.getMonth() < 11) {
    // 11 is December
    nextValue = accountValues.shift();
    nextValueDate = new Date(nextValue.date);
  }
  if (nextValue) {
    accountValues.unshift(nextValue); // put it back for next year
  }
};

const processAccountAnnualReport = (account, accountValues, activities, dquotes, req, res) => {
  if (accountValues.length === 0) {
    // should not happen
    res.send([]);
    return;
  }
  addCurrentAccountValue(account, accountValues, activities, dquotes);
  let infoList = [];
  let previousValueInfo = initPreviousYearValueInfo(accountValues[0]);
  let today = new Date();
  skipToDecemberOrLastValue(accountValues, today);
  while (accountValues.length > 0) {
    let valueInfo = sumUpAccountMonthlyValue(accountValues);
    let gainInfo = calcAccountPeriodGain(previousValueInfo, valueInfo, activities);
    let info = {
      accountId: account._id,
      accountName: account.name,
      date: valueInfo.date,
      cash: valueInfo.cash,
      value: valueInfo.value,
      deposit: gainInfo.deposit,
      withdraw: gainInfo.withdraw,
      gain: gainInfo.gain,
      gainPercent: gainInfo.gainPercent,
      dateString: new Date(valueInfo.date).toISOString(),
    };

    previousValueInfo = valueInfo;
    infoList.push(info);
    skipToDecemberOrLastValue(accountValues, today);
  }
  res.send(infoList);
};

const reportDataLoader = (accountId, processor, req, res) => {
  let account = null,
    accountValues = null,
    activities = null,
    dquotes = null;
  let accountIdFilter = {};

  if (accountId < 0) {
    account = { _id: -1, name: 'Total', cash: 0.0 };
  } else {
    accountIdFilter = { accountId: accountId };
  }

  const onLoaded = () => {
    if (account && accountValues && activities && dquotes) {
      processor(account, accountValues, activities, dquotes, req, res);
    }
  };

  try {
    if (accountId >= 0) {
      dbclient
        .recorddb()
        .collection('account')
        .findOne({ _id: accountId })
        .then((acct) => {
          account = acct;
          onLoaded();
        });
    }

    dbclient
      .recorddb()
      .collection('accountvalue')
      .find(accountIdFilter)
      .sort({ date: 1 })
      .toArray()
      .then((values) => {
        // oldest first
        accountValues = values;
        onLoaded();
      });

    dbclient
      .recorddb()
      .collection('activity')
      .find(accountIdFilter)
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
        onLoaded();
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.getMonthlyReport = (req, res) => {
  let accountId = Number(req.params.id);
  reportDataLoader(accountId, processAccountMonthlyReport, req, res);

  // let account = null, accountValues = null, activities = null, dquotes = null;

  // const onLoaded = () => {
  //     if (account && accountValues && activities && dquotes) {
  //         processAccountMonthlyReport(account, accountValues, activities, dquotes, req, res);
  //     }
  // };

  // try {
  //     dbclient.recorddb().collection("account").findOne({_id: accountId}).then((acct) => {
  //         account = acct;
  //         onLoaded();
  //     });

  //     dbclient.recorddb().collection("accountvalue").find({accountId: accountId}).sort({ date: 1 }).toArray().then((values) => { // oldest first
  //         accountValues = values;
  //         onLoaded();
  //     });

  //     dbclient.recorddb().collection("activity").find({accountId: accountId}).sort({ date: 1 }).toArray().then((acts) => { // oldest first
  //         activities = acts;
  //         onLoaded();
  //     });

  //     dbclient.quotedb().collection("dquote").find({}).toArray().then((dqs) => {
  //         dquotes = dqs;
  //         onLoaded();
  //     });
  // } catch (e) {
  //     console.error(e);
  //     res.status(500).send({ message: e });
  // }
};

exports.getAllMonthlyReports = (req, res) => {
  reportDataLoader(-1, processAccountMonthlyReport, req, res);

  // const account = {
  //     _id: -1,
  //     name: 'Total',
  //     cash: 0.0
  // };
  // let accountValues = null, activities = null, dquotes = null;

  // const onLoaded = () => {
  //     if (accountValues && activities && dquotes) {
  //         processAccountMonthlyReport(account, accountValues, activities, dquotes, req, res);
  //     }
  // };

  // try {
  //     dbclient.recorddb().collection("accountvalue").find({}).sort({ date: 1 }).toArray().then((values) => { // oldest first
  //         accountValues = values;
  //         onLoaded();
  //     });

  //     dbclient.recorddb().collection("activity").find({}).sort({ date: 1 }).toArray().then((acts) => { // oldest first
  //         activities = acts;
  //         onLoaded();
  //     });

  //     dbclient.quotedb().collection("dquote").find({}).toArray().then((dqs) => {
  //         dquotes = dqs;
  //         onLoaded();
  //     });
  // } catch (e) {
  //     console.error(e);
  //     res.status(500).send({ message: e });
  // }
};

exports.getAnnualReport = (req, res) => {
  let accountId = Number(req.params.id);
  reportDataLoader(accountId, processAccountAnnualReport, req, res);

  // let account = null, accountValues = null, activities = null, dquotes = null;

  // const onLoaded = () => {
  //     if (account && accountValues && activities && dquotes) {
  //         processAccountAnnualReport(account, accountValues, activities, dquotes, req, res);
  //     }
  // };

  // try {
  //     dbclient.recorddb().collection("account").findOne({_id: accountId}).then((acct) => {
  //         account = acct;
  //         onLoaded();
  //     });

  //     dbclient.recorddb().collection("accountvalue").find({accountId: accountId}).sort({ date: 1 }).toArray().then((values) => { // oldest first
  //         accountValues = values;
  //         onLoaded();
  //     });

  //     dbclient.recorddb().collection("activity").find({accountId: accountId}).sort({ date: 1 }).toArray().then((acts) => { // oldest first
  //         activities = acts;
  //         onLoaded();
  //     });

  //     dbclient.quotedb().collection("dquote").find({}).toArray().then((dqs) => {
  //         dquotes = dqs;
  //         onLoaded();
  //     });
  // } catch (e) {
  //     console.error(e);
  //     res.status(500).send({ message: e });
  // }
};

exports.getAllAnnualReports = (req, res) => {
  reportDataLoader(-1, processAccountAnnualReport, req, res);

  // const account = {
  //     _id: -1,
  //     name: 'Total',
  //     cash: 0.0
  // };    let accountValues = null, activities = null, dquotes = null;

  // const onLoaded = () => {
  //     if (accountValues && activities && dquotes) {
  //         processAccountAnnualReport(account, accountValues, activities, dquotes, req, res);
  //     }
  // };

  // try {
  //     dbclient.recorddb().collection("accountvalue").find({}).sort({ date: 1 }).toArray().then((values) => { // oldest first
  //         accountValues = values;
  //         onLoaded();
  //     });

  //     dbclient.recorddb().collection("activity").find({}).sort({ date: 1 }).toArray().then((acts) => { // oldest first
  //         activities = acts;
  //         onLoaded();
  //     });

  //     dbclient.quotedb().collection("dquote").find({}).toArray().then((dqs) => {
  //         dquotes = dqs;
  //         onLoaded();
  //     });
  // } catch (e) {
  //     console.error(e);
  //     res.status(500).send({ message: e });
  // }
};

exports.getTradeActivities = (req, res) => {
  try {
    dbclient
      .recorddb()
      .collection('activity')
      .find()
      .sort({ date: 1 })
      .toArray()
      .then((activities) => {
        calcAccumulatedShares(activities);
        const tradeActivities = [];
        for (let obj of activities) {
          if (obj.type !== 'Buy' && obj.type !== 'Sell' && obj.type !== 'Split') continue;
          if (obj.accountId) {
            obj.accountName = util.getAccounts(obj.accountId).name;
          }
          if (obj.tickerId) {
            obj.tickerName = util.getTickerById(obj.tickerId).name;
          }
          tradeActivities.push(obj);
        }
        res.send(tradeActivities);
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

const buildReport = (activities, dquotes, req, res) => {
  const tickerToActivity = new Map();
  for (const obj of activities) {
    if ('tickerId' in obj && obj.tickerId > 0) {
      if (tickerToActivity.has(obj.tickerId)) {
        tickerToActivity.get(obj.tickerId).push(obj);
      } else {
        // tickerToActivity[obj.tickerId] = [obj];
        tickerToActivity.set(obj.tickerId, [obj]);
      }
    }
  }
  const stockReport = [];
  for (const [tickerId, listAct] of tickerToActivity) {
    let cost = 0,
      sale = 0,
      shares = 0,
      value = 0;
    for (let obj of listAct) {
      switch (obj.type) {
        case 'Dividend':
        case 'Gain':
          sale += obj.amount;
          break;
        case 'Expense':
          sale -= obj.amount;
          break;
        case 'Buy':
          cost += obj.amount;
          shares += obj.shares;
          break;
        case 'Sell':
          sale += obj.amount;
          shares -= obj.shares;
          break;
        case 'Split':
          shares *= obj.amount / obj.shares;
          break;
        default:
      }
    }
    let ticker = util.getTickerById(tickerId);
    if (ticker.type === 'Fixed') {
      continue;
    }
    if (shares > 0) {
      const dq = dquotes.find((obj) => obj._id === ticker._id);
      if (!dq) {
        console.log('Missing daily quote for ticker: ' + ticker.name);
      } else {
        value = shares * dq.last;
      }
    }
    let gain = sale + value - cost;
    let gainPct = (gain * 100) / cost;
    stockReport.push({ tickerId: ticker._id, tickerName: ticker.name, cost, sale, shares, value, gain, gainPct });
  }
  res.send(stockReport);
};

exports.getStockReport = (req, res) => {
  let activities = null,
    dquotes = null;

  const onLoaded = () => {
    if (activities && dquotes) {
      buildReport(activities, dquotes, req, res);
    }
  };
  try {
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
      .find({ accountId: Number(req.params.accountId) })
      .sort({ date: -1 })
      .toArray()
      .then((accValues) => {
        res.send(accValues);
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};
