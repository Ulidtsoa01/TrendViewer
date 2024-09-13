const dbclient = require('./dbclient');
const util = require('./util');

exports.getTickerNameList = (req, res) => {
  res.send(Array.from(util.getTickerNames().keys()).sort());
};

exports.getTickerInfo = (req, res) => {
  let tickerName = req.params.ticker;
  let t = util.getTickerByName(tickerName);

  if (!t) {
    res.status(500).send({ message: 'Invalid ticker name: ' + tickerName });
  }

  let dquote = null,
    activityList = null,
    journalList = null,
    ticker = null;
  let dquoteLoaded = false,
    activityListLoaded = false,
    journalListLoaded = false,
    tickerLoaded = false;

  const returnFunc = () => {
    if (!dquoteLoaded || !activityListLoaded || !journalListLoaded || !tickerLoaded) {
      return; // don't return response if not all loaded
    }
    let clone = ticker;
    clone.dQuote = dquote;
    clone.activityList = activityList;
    clone.journalList = journalList;
    res.send(clone);
  };

  try {
    dbclient
      .recorddb()
      .collection('ticker')
      .findOne({ _id: t._id })
      .then((tickerObj) => {
        ticker = tickerObj;
        tickerLoaded = true;
        returnFunc();
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }

  try {
    dbclient
      .quotedb()
      .collection('dquote')
      .findOne({ _id: t._id })
      .then((dq) => {
        dquote = dq;
        dquoteLoaded = true;
        returnFunc();
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }

  try {
    dbclient
      .recorddb()
      .collection('tickerjournal')
      .find({ tickerId: t._id })
      .sort({ date: -1 })
      .toArray()
      .then((js) => {
        journalList = js;
        journalListLoaded = true;
        returnFunc();
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }

  try {
    dbclient
      .recorddb()
      .collection('activity')
      .find({ tickerId: t._id })
      .sort({ date: -1 })
      .toArray()
      .then((acts) => {
        acts.forEach((obj) => (obj.accountName = util.getAccounts(obj.accountId).name));
        activityList = acts;
        activityListLoaded = true;
        returnFunc();
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.createTickerInfo = (req, res) => {
  let targetObj = { ...req.body };
  if (!targetObj._id) {
    targetObj._id = util.getMaxTickerId() + 1;
  }
  try {
    dbclient
      .recorddb()
      .collection('ticker')
      .insertOne(targetObj)
      .then((obj) => {
        util.addTicker(targetObj);
        res.send({ message: 'Create ticker successful' });
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.updateTickerInfo = (req, res) => {
  let targetObj = { ...req.body };
  delete targetObj._id;
  delete targetObj.name;
  // let updateKeys = [
  //   'type',
  //   'sector',
  //   'industry',
  //   'tickerDescription',
  //   'exchangeCode',
  // ];
  // Object.keys(req.body).forEach((key) => {
  //   if (updateKeys.includes(key)) targetObj[key] = req.body[key];
  // });

  try {
    dbclient
      .recorddb()
      .collection('ticker')
      .updateOne({ _id: req.body._id }, { $set: targetObj }, { upsert: true })
      .then(res.send({ message: 'Update ticker successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.modifySettings = (req, res) => {
  delete req.body.tickerId;

  try {
    dbclient
      .recorddb()
      .collection('ticker')
      .updateOne({ _id: Number(req.params.id) }, [{ $set: { settings: { $mergeObjects: ['$settings', req.body] } } }], {
        upsert: true,
      })
      .then(res.send({ message: 'Update ticker settings successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.deleteTickerInfo = (req, res) => {
  try {
    dbclient
      .recorddb()
      .collection('ticker')
      .deleteOne({ _id: Number(req.params.id) })
      .then(res.send({ message: 'Delete ticker successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.createTickerJournal = (req, res) => {
  let targetObj = { ...req.body };
  targetObj._id = util.getCounters('tickerjournal') + 1;
  util.incrementCounter('tickerjournal');
  try {
    dbclient
      .recorddb()
      .collection('tickerjournal')
      .insertOne(targetObj)
      .then(() => res.send({ message: 'Create ticker journal successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.updateTickerJournal = (req, res) => {
  let targetObj = { ...req.body };
  delete targetObj._id;

  try {
    dbclient
      .recorddb()
      .collection('tickerjournal')
      .updateOne({ _id: req.body._id }, { $set: targetObj }, { upsert: true })
      .then(res.send({ message: 'Update ticker journal successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.deleteTickerJournal = (req, res) => {
  try {
    dbclient
      .recorddb()
      .collection('tickerjournal')
      .deleteOne({ _id: Number(req.params.id) })
      .then(res.send({ message: 'Delete ticker journal successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.deleteHQuote = (req, res) => {
  try {
    dbclient
      .quotedb()
      .collection('hquote')
      .deleteOne({ _id: Number(req.params.id) })
      .then(res.send({ message: 'Delete hquote successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};
