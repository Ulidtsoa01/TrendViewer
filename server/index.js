const express = require('express');
const cors = require('cors');
const multer = require('multer');
const account = require('./account');
const backup = require('./backup');
const dbclient = require('./dbclient');
const journal = require('./journal');
const ticker = require('./ticker');
const portfolio = require('./portfolio');
const quote = require('./quote');
const value = require('./value');

const upload = multer({
  storage: multer.memoryStorage(),
  dest: './tmp',
});

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true, limit: '300mb' }));
app.use(express.json({ limit: '300mb' }));

app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server' });
});

app.get('/dquotes', quote.getDQuotes);
app.get('/hquotes/:id', quote.getHQuotesByTicker);

app.post('/rest/action/updateaccountvalues', value.updateAccountValues);

//journal
app.get('/rest/journal', journal.getJournal);
app.post('/rest/journal/update', journal.createJournal);
app.put('/rest/journal/update', journal.updateJournal);
app.delete('/rest/journal/:id', journal.deleteJournal);

//// portfolio ////
app.get('/rest/holding', portfolio.getHoldings);
app.get('/rest/stocklist/chartdata/:tickerName/daily', portfolio.getChartData);
app.get('/rest/hot', portfolio.getHotItems);

//watch
app.get('/rest/watch/items/:watchId', portfolio.getWatchItems);
app.post('/rest/watch/add/:watchId/:tickerName', portfolio.addWatchItem);
app.post('/rest/watch/remove/:watchId/:tickerName', portfolio.removeWatchItem);

//// account ////

//all accounts
app.get('/rest/account', account.getAccounts); // includes holdings for individual account
app.get('/rest/account/tradeactivities', account.getTradeActivities);
app.get('/rest/stockreport', account.getStockReport);
app.get('/rest/accountreport/annual/all', account.getAllAnnualReports);
app.get('/rest/accountreport/monthly/all', account.getAllMonthlyReports);

//individual accounts
app.get('/rest/accountreport/annual/:id', account.getAnnualReport);
app.get('/rest/accountreport/monthly/:id', account.getMonthlyReport);
app.post('/rest/activity', account.postActivity);
app.delete('/rest/activity/:id', account.deleteActivity);
app.get('/rest/accountvalue/:accountId', account.getValueHistory);

//// ticker ////

// ticker info
app.get('/rest/tinfo', ticker.getTickerNameList);
app.get('/rest/tinfo/:ticker', ticker.getTickerInfo);
app.post('/rest/tinfo/update', ticker.createTickerInfo);
app.put('/rest/tinfo/update', ticker.updateTickerInfo);
app.put('/rest/tinfo/:id/settings', ticker.modifySettings);
app.delete('/rest/tinfo/:id', ticker.deleteTickerInfo);

// ticker journal
app.post('/rest/tickerjournal/update', ticker.createTickerJournal);
app.put('/rest/tickerjournal/update', ticker.updateTickerJournal);
app.delete('/rest/tickerjournal/:id', ticker.deleteTickerJournal);

// ticker hquote
app.get('/rest/hquote/daily/:id', quote.getHQuotesByTicker);
app.post('/rest/action/deletequotes/:id', ticker.deleteHQuote);

//// backup ////
app.post('/rest/importrecordjson', upload.single('file'), backup.importRecordJson);
app.post('/rest/importquotejson', upload.single('file'), backup.importQuoteJson);
app.get('/rest/exportrecordjson', backup.exportRecordJson);
app.get('/rest/exportquotejson', backup.exportQuoteJson);

app.get('/rest/old/importjson', backup.importJsonOld);
app.get('/rest/old/importquotejson', backup.importQuoteJsonOld);

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
