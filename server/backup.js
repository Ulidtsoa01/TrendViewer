const fs = require('fs');
const dbclient = require('./dbclient');
const util = require('./util');

exports.clearRecordData = async (req, res) => {
  const recorddbnames = ['ticker', 'tickerjournal', 'marketassessment', 'portfolio', 'account', 'activity', 'accountvalue'];

  try {
    for (const item of recorddbnames) {
      dbclient.recorddb().collection(item).deleteMany({});
    }
    res.send({ message: 'Finished clearing record data' });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.clearQuoteData = async (req, res) => {
  const quotedbnames = ['dquote', 'hquote'];

  try {
    for (const item of quotedbnames) {
      dbclient.quotedb().collection(item).deleteMany({});
    }
    res.send({ message: 'Finished clearing quote data' });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.exportRecordJson = async (req, res) => {
  const dbnames = ['ticker', 'tickerjournal', 'marketassessment', 'portfolio', 'account', 'activity', 'accountvalue'];

  try {
    const backup = {};
    for (const item of dbnames) {
      backup[item] = await dbclient.recorddb().collection(item).find().toArray();
    }
    const json = JSON.stringify(backup, null, ' ');
    res.send(json);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.exportQuoteJson = async (req, res) => {
  const dbnames = ['dquote', 'hquote'];

  try {
    const backup = {};
    for (const item of dbnames) {
      backup[item] = await dbclient.quotedb().collection(item).find().toArray();
    }
    const json = JSON.stringify(backup, null, ' ');
    res.send(json);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.importRecordJson = async (req, res) => {
  let backup = JSON.parse(req.file.buffer.toString());
  const dbnames = Object.keys(backup);
  try {
    for (const item of dbnames) {
      dbclient.recorddb().collection(item).insertMany(backup[item]);
      // .then(res.send({ message: 'Inserted ' + item }));
    }
    res.send({ message: 'Inserting ' });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.importQuoteJson = (req, res) => {
  const backup = { ...req.body };
  const dbnames = Object.keys(backup);
  try {
    for (const item of dbnames) {
      dbclient.quotedb().collection(item).insertMany(backup[item]);
      // .then(res.send({ message: 'Inserted ' + item }));
    }
    res.send({ message: 'Inserting ' });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

const importTickers = (tickers, settings, res) => {
  tickers.forEach((t) => {
    t._id = t.id;
    delete t.id;
  });
  util.updateTickers(tickers);

  const adjustSettingKey = (oldKey) => {
    const parts = oldKey.split('_');
    for (let i = 1; i < parts.length; i++) {
      parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    }
    return parts.join('');
  };

  settings.forEach((ts) => {
    if (!ts.values) {
      return;
    }
    let t = util.getTickerByName(ts.ticker);
    if (t) {
      t.settings = {};
      ts.values.forEach((pair) => {
        const name = adjustSettingKey(pair.name);
        t.settings[name] = pair.value;
      });
    }
  });

  try {
    let tickerCollection = dbclient.recorddb().collection('ticker');
    tickerCollection.insertMany(tickers).then((result) => {
      let message = `${result.insertedCount} tickers were inserted.`;
      console.log(message);
      tickerCollection.createIndex({ name: 1 }).then((result) => {
        // console.log(result);
        console.log('    name index created for ticker');
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e,
    });
  }
};

const importTickerJournals = (tickerJournals, res) => {
  const journals = [];
  tickerJournals.forEach((tj) => {
    let t = util.getTickerByName(tj.name);
    tj.journals.forEach((j) => {
      j._id = j.id;
      delete j.id;
      j.date = Date.parse(j.date);
      j.tickerId = t._id;
      journals.push(j);
    });
  });

  try {
    let tickerJournalCollection = dbclient.recorddb().collection('tickerjournal');
    tickerJournalCollection.insertMany(journals).then((result) => {
      let message = `${result.insertedCount} ticker journals were inserted.`;
      console.log(message);
      tickerJournalCollection.createIndex({ tickerId: 1, date: -1 }).then((result) => {
        // console.log(result);
        console.log('    tickerid/date index created for tickerjournal');
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e,
    });
  }
};

const importMarketAssessments = (marketAssessments, res) => {
  marketAssessments.forEach((j) => {
    j._id = j.id;
    delete j.id;
    j.date = Date.parse(j.date);
  });

  try {
    let marketAssessmentCollection = dbclient.recorddb().collection('marketassessment');
    marketAssessmentCollection.insertMany(marketAssessments).then((result) => {
      let message = `${result.insertedCount} market assessments were inserted.`;
      console.log(message);
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e,
    });
  }
};

const importPortfolios = (portfolios, res) => {
  portfolios.forEach((j) => {
    j._id = j.id;
    delete j.id;
  });

  try {
    let portfolioCollection = dbclient.recorddb().collection('portfolio');
    portfolioCollection.insertMany(portfolios).then((result) => {
      let message = `${result.insertedCount} portfolios were inserted.`;
      console.log(message);
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e,
    });
  }
};

const importAccounts = (accounts, res) => {
  const accts = [];
  const activities = [];
  const values = [];

  accounts.forEach((account) => {
    let acct = {
      _id: account.id,
      name: account.name,
      cash: account.cash,
      createDate: Date.parse(account.createDate),
    };
    accts.push(acct);
    account.activities.forEach((act) => {
      act._id = act.id;
      delete act.id;
      act.date = Date.parse(act.date);
      act.accountId = acct._id;
      if (act.ticker) {
        let t = util.getTickerByName(act.ticker);
        if (t) {
          act.tickerId = t._id;
          delete act.ticker;
        }
      }
      activities.push(act);
    });
    account.values.forEach((v) => {
      v.date = Date.parse(v.date);
      v.accountId = acct._id;
      values.push(v);
    });
  });

  try {
    let accountCollection = dbclient.recorddb().collection('account');
    accountCollection.insertMany(accts).then((result) => {
      let message = `${result.insertedCount} accounts were inserted.`;
      console.log(message);
    });

    let activityCollection = dbclient.recorddb().collection('activity');
    activityCollection.insertMany(activities).then((result) => {
      let message = `${result.insertedCount} activities were inserted.`;
      console.log(message);
      activityCollection.createIndex({ accountId: 1, date: -1 }).then((result) => {
        // console.log(result);
        console.log('    accountId/date index created for activity');
      });
      activityCollection.createIndex({ tickerId: 1, date: -1 }).then((result) => {
        // console.log(result);
        console.log('    tickerId/date index created for activity');
      });
      activityCollection.createIndex({ date: -1 }).then((result) => {
        // console.log(result);
        console.log('    date index created for activity');
      });
    });

    let accountValueCollection = dbclient.recorddb().collection('accountvalue');
    accountValueCollection.insertMany(values).then((result) => {
      let message = `${result.insertedCount} account valuess were inserted.`;
      console.log(message);
      accountValueCollection.createIndex({ accountId: 1, date: -1 }).then((result) => {
        // console.log(result);
        console.log('    accountId/date index created for accountvalue');
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e,
    });
  }
};

exports.importJsonOld = function (req, res) {
  let filePath = '';
  console.log('Import JSON from: ' + filePath);
  try {
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) throw err;
      let obj = JSON.parse(data);
      importTickers(obj.tickers, obj.settings, res);
      importTickerJournals(obj.tickerJournals, res);
      importMarketAssessments(obj.marketAssements, res);
      importPortfolios(obj.portfolios, res);
      importAccounts(obj.accounts, res);
      res.send({ message: 'Import successful' });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e,
    });
  }
};

const importDQuotes = (dquotes, res) => {
  let mapped = dquotes.map((dq) => {
    let t = util.getTickerByName(dq.ticker);
    return {
      _id: t._id,
      date: Date.parse(dq.date),
      last: dq.last,
    };
  });

  try {
    let dquoteCollection = dbclient.quotedb().collection('dquote');
    dquoteCollection.insertMany(mapped).then((result) => {
      let message = `${result.insertedCount} dquotes were inserted.`;
      console.log(message);
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e,
    });
  }
};

const processHQuoteByTicker = (hqByTicker, result) => {
  let t = util.getTickerByName(hqByTicker.ticker);
  let currentYear = '-1';
  let currentMonth = '-1';
  let hqMonth = null;
  hqByTicker.quotes.forEach((hq) => {
    let dateParts = hq.date.split('-');
    hq.date = Date.parse(hq.date);
    if (dateParts[0] === currentYear && dateParts[1] === currentMonth) {
      hqMonth.quotes.push(hq);
    } else {
      if (hqMonth) {
        hqMonth.quotes = hqMonth.quotes.reverse();
        result.push(hqMonth);
      }
      currentYear = dateParts[0];
      currentMonth = dateParts[1];
      hqMonth = {
        tickerId: t._id,
        year: Number(currentYear),
        month: Number(currentMonth),
        quotes: [hq],
      };
    }
  });
  if (hqMonth) {
    hqMonth.quotes = hqMonth.quotes.reverse();
    result.push(hqMonth);
  }
};

const importHQuotes = (hquotes, res) => {
  const hqs = [];
  hquotes.forEach((hqByTicker) => {
    processHQuoteByTicker(hqByTicker, hqs);
  });

  try {
    let hquoteCollection = dbclient.quotedb().collection('hquote');
    hquoteCollection.insertMany(hqs).then((result) => {
      let message = `${result.insertedCount} hquotes were inserted.`;
      console.log(message);
      hquoteCollection.createIndex({ tickerId: 1, year: 1, month: 1 }).then((result) => {
        // console.log(result);
        console.log('    tickerId/year/month index created for hquote');
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e,
    });
  }
};

exports.importQuoteJsonOld = function (req, res) {
  let filePath = '';
  console.log('Import quote JSON from: ' + filePath);
  try {
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) throw err;
      let obj = JSON.parse(data);
      importDQuotes(obj.dquotes, res);
      importHQuotes(obj.hquotes, res);
      res.send({ message: 'Import successful' });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      message: e,
    });
  }
};
