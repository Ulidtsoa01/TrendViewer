const dbclient = require('./dbclient');

exports.getDQuotes = function(req, res) {
    try {
        dbclient.quotedb().collection("dquote").find({}).toArray().then((dquotes) => {
            // not sure whether I should do the following
            // accounts.forEach(acct => {
            //     acct.createDate = new Date(acct.createDate);
            // });
            // console.log(accounts);
            res.send(dquotes);
        });
    } catch (e) {
        console.error(e);
    }
};

exports.getHQuotesByTicker = function(req, res) {
    let tickerId = req.params.id;
    console.log('quote.getHQuotesByTicker called with tickerId=' + tickerId);
    try {
        dbclient.quotedb().collection("hquote").find({tickerId: Number(tickerId)}).sort({year: -1, month: -1}).toArray().then((hquotes) => {
            let hqs = [];
            hquotes.forEach(qym => {
                qym.quotes.forEach(q => {
                    q.dateStr = (new Date(q.date)).toISOString();
                    hqs.push(q);
                });
            });
            res.send(hqs);
        });
    } catch (e) {
        console.error(e);
        res.status(500).send({
            message: e
        });
    }
};

