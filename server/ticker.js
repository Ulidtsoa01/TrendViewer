// class Ticker {
//   id;
//   name;
//   type;
//   description;
//   sector;
//   industry;
//   riskProfile;
//   shares;
//   exchangeCode;
//   averageVolume = 0;

//   constructor(id, name, type, description) {
//     this.id = id;
//     this.name = name;
//     this.type = type;
//     this.description = description;
//   }

//   toJson() {
//     JSON.stringify({
//       id: this.id,
//       name: this.name,
//       type: this.type,
//       description: this.description,
//       sector: this.sector,
//       industry: this.industry,
//       exchangeCode: this.exchangeCode,
//     });
//   }
// }

const dbclient = require('./dbclient');
const util = require('./util');

exports.getTickerInfo = (req, res) => {
  let tickerName = req.params.ticker;
  let t = util.getTickerByName(tickerName);

  if (!t) {
    res.status(500).send({ message: 'Invalid ticker name: ' + tickerName });
  }

  let dquote = null,
    activityList = null,
    journalList = null;
  let dquoteLoaded = false,
    activityListLoaded = false,
    journalListLoaded = false;

  const returnFunc = () => {
    if (!dquoteLoaded || !activityListLoaded || !journalListLoaded) {
      return; // don't return response if not all loaded
    }
    let clone = { ...t };
    clone.dQuote = dquote;
    clone.activityList = activityList;
    clone.journalList = journalList;
    res.send(clone);
  };

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
  try {
    dbclient
      .recorddb()
      .collection('ticker')
      .insertOne(targetObj)
      .then(res.send({ message: 'Create ticker successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.updateTickerInfo = (req, res) => {
  // let tickerName = req.params.ticker;
  // let t = util.getTickerByName(tickerName);
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

  // console.log(targetObj);

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
  let targetObj = { ...req.body };
  delete targetObj._id;
  // dbclient.recorddb().collection('ticker').findOne({ _id: req.body._id });
  try {
    dbclient
      .recorddb()
      .collection('ticker')
      .updateOne(
        { _id: req.body._id },
        [{ $set: { settings: { $mergeObjects: ['$settings', targetObj] } } }],
        { upsert: true }
      )
      .then(res.send({ message: 'Update ticker settings successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e }); //a
  }
};

exports.deleteTickerInfo = (req, res) => {
  try {
    dbclient
      .recorddb()
      .collection('ticker')
      .deleteOne({ _id: req.params.id })
      .then(res.send({ message: 'Delete ticker successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e }); //a
  }
};

exports.createTickerJournal = (req, res) => {
  let targetObj = { ...req.body };
  delete targetObj._id;
  try {
    dbclient
      .recorddb()
      .collection('tickerjournal')
      .insertOne(targetObj)
      .then(res.send({ message: 'Create ticker journal successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.updateTickerInfo = (req, res) => {
  let targetObj = { ...req.body };
  delete targetObj._id;

  try {
    dbclient
      .recorddb()
      .collection('ticker')
      .updateOne({ _id: req.body._id }, { $set: targetObj }, { upsert: true })
      .then(res.send({ message: 'Update ticker journal successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};
