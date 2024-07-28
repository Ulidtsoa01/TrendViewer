// server/index.js

const express = require('express');
const cors = require('cors');
const dbclient = require('./dbclient');
const importjson = require('./importjson');
const account = require('./account');
const quote = require('./quote');
const ticker = require('./ticker');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server' });
});

app.get('/importjson', importjson.importJson);
app.get('/importquotejson', importjson.importQuoteJson);

app.get('/accounts', account.getAccounts);

app.get('/dquotes', quote.getDQuotes);
app.get('/hquotes/:id', quote.getHQuotesByTicker);

//// ticker ////

// ticker info
app.get('/rest/tinfo', ticker.getTickerNameList);
app.get('/rest/tinfo/:ticker', ticker.getTickerInfo);
app.post('/rest/tinfo/update', ticker.createTickerInfo);
app.put('/rest/tinfo/update', ticker.updateTickerInfo);
app.put('/rest/tinfo/:id/settings', ticker.modifySettings);
app.delete('/rest/tinfo/:id', ticker.deleteTickerInfo);

// ticker journal
app.post('/rest/journal/normal/update', ticker.createTickerJournal);
app.put('/rest/journal/normal/update', ticker.updateTickerJournal);
app.delete('/rest/journal/normal/:id', ticker.deleteTickerJournal);

// ticker hquote
app.get('/rest/hquote/daily/:id', quote.getHQuotesByTicker);
app.post('/rest/action/deletequotes/:id', ticker.deleteHQuote);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

// normal exit
process.on('exit', (code) => {
  console.log('Process exit even code: ', code);
  dbclient.close();
});

// like kill
process.on('SIGTERM', (code) => {
  dbclient.close();
  console.log(`Process ${process.id} received a SIGTERM signla`);
});

// like ctrl-c
process.on('SIGINT', (code) => {
  console.log(`Process ${process.id} has been interrupted.`);
  dbclient.close();
  process.exit(0);
});
