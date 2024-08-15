const dbclient = require('./dbclient');
const util = require('./util');

exports.getJournal = (req, res) => {
  try {
    dbclient
      .recorddb()
      .collection('marketassessment')
      .find()
      .sort({ date: -1 })
      .toArray()
      .then((journal) => {
        res.send(journal);
      });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.createJournal = (req, res) => {
  let targetObj = { ...req.body };
  targetObj._id = util.getCounters('marketassessment') + 1;
  util.incrementCounter('marketassessment');
  try {
    dbclient
      .recorddb()
      .collection('marketassessment')
      .insertOne(targetObj)
      .then(() => res.send({ message: 'Create journal successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.updateJournal = (req, res) => {
  let targetObj = { ...req.body };
  delete targetObj._id;

  try {
    dbclient
      .recorddb()
      .collection('marketassessment')
      .updateOne({ _id: req.body._id }, { $set: targetObj }, { upsert: true })
      .then(res.send({ message: 'Update journal successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};

exports.deleteJournal = (req, res) => {
  // console.log(req.params.id);
  try {
    dbclient
      .recorddb()
      .collection('marketassessment')
      .deleteOne({ _id: Number(req.params.id) })
      .then(res.send({ message: 'Delete journal successful' }));
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e });
  }
};
//db.marketassessment.deleteOne
