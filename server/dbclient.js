const { MongoClient, ServerApiVersion } = require('mongodb');
const util = require('./util');

// Replace the placeholder with your Atlas connection string
const uri = 'mongodb://127.0.0.1:27017';
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let theRecordDb = null;
let theQuoteDb = null;

function loadTickers() {
  if (!theRecordDb) {
    console.log('Not able to load tickers, as theRecordDB is not ready yet.');
    return;
  }
  try {
    theRecordDb
      .collection('ticker')
      .find({})
      .toArray()
      .then((tickers) => {
        console.log('Tickes loaded to cache');
        util.updateTickers(tickers);
      });
  } catch (e) {
    console.error(e);
  }
}

client.connect().then(() => {
  theRecordDb = client.db('recorddb');
  theQuoteDb = client.db('quotedb');
  theRecordDb.command({ ping: 1 });
  console.log('Pinged your deployment. You successfully connected to MongoDB!');

  loadTickers();
  util.updateAccounts();
  util.createCounters();
});

exports.recorddb = () => theRecordDb;
exports.quotedb = () => theQuoteDb;

exports.close = () => {
  client.close();
};
