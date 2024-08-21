const dbclient = require('./dbclient');
const account = require('./account');
const util = require('./util');

const MILLI_SECONDS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

const nextValueDate = (latestValueDateNumber) => {
    const latestValueDate = new Date(latestValueDateNumber);
    let year = latestValueDate.getFullYear();
    let month = latestValueDate.getMonth() + 2;
    if (month >= 12) {
        month -= 12;
        year += 1;
    }
    let date = new Date(year, month, 1, 17, 0); // atter 4pm when market closes
    date.setTime(date.getTime() - MILLI_SECONDS_IN_ONE_DAY);
    // console.log(date.toLocaleDateString());
    return date;
}

const applyActivtiesUntil = (accounts, currentMonthDate) => {
    accounts.forEach(acct => {
        let act = acct.activityList.length > 0 ? acct.activityList.shift() : null;
        while (act && act.date <= currentMonthDate) {
            account.applyActivityToState(act, acct.state);
            act = acct.activityList.length > 0 ? acct.activityList.shift() : null;
        }
        if (act) {
            acct.activityList.unshift(act); // put it back for the next month
        }
    });
};

const collectHoldingTickerIds = (accounts) => {
    const tickerIdSet = new Set();
    accounts.forEach(acct => {
        acct.state.holdingMap.forEach((value, tickerId) => {
            tickerIdSet.add(tickerId);
        });
    });
    return Array.from(tickerIdSet);
};

const calculateHoldingValue = (hqBlockMap, acct, currentMonthDate, result, res) => {
    let holdings = Array.from(acct.state.holdingMap.values());
    if (!holdings || holdings.length === 0) {
        return 0;
    }
    return holdings.reduce((sum, h) => {
        let ticker = util.getTickerById(h.tickerId);
        if (ticker.type === 'Fixed') {
            sum += h.number;
        } else {
            let hqb = hqBlockMap.get(h.tickerId);
            if (hqb) {
                let q = hqb.quotes[hqb.quotes.length - 1];
                sum += h.number * q.close;
            } else {
                // need to report error
                if (!result.error) {
                    let errorMessage = `Missing quote  block for ${ticker.name} of ${currentMonthDate.toLocaleString()}`;
                    console.log(errorMessage);
                    result.error = true;
                    result.sent = true;
                    res.status(500).send({message: errorMessage});
                }
            }
        }
        return sum;
    }, 0);
};

const calculateAccountComment = (acct) => {
    let holdings = Array.from(acct.state.holdingMap.values());
    return holdings.reduce((comment, h) => {
        let ticker = util.getTickerById(h.tickerId);
        let number = Math.round(h.number * 1000) /  1000;
        return comment + ',' + ticker.name + ' ' + number;
    }, '');
};

const calculateAccountValues = (hqBlocks, accounts, currentMonthDate, result, res) => {
    const hqBlockMap = new Map();
    hqBlocks.forEach(hqb => {
        hqBlockMap.set(hqb.tickerId, hqb);
    });

    accounts.forEach(acct => {
        let holdingValue = calculateHoldingValue(hqBlockMap, acct, currentMonthDate, result, res);
        let comment = calculateAccountComment(acct);
        let value = {
            accountId: acct._id,
            date: currentMonthDate.getTime(),
            cash: Math.round(acct.state.cashAmount * 1000) / 1000,
            value: Math.round((acct.state.cashAmount + holdingValue) * 1000) / 1000,
            comment: comment && comment.length > 0 ? comment.substring(1) : ''
        }
        result.values.push(value);
        // console.log(value);
    });

    if (!result.error && result.values.length === result.expectedValueCount) {
        // time to insert all values in one shot
        try {
            let accountValueCollection = dbclient.recorddb().collection("accountvalue");
            accountValueCollection.insertMany(result.values).then((insertResult) => {
                let message = `${insertResult.insertedCount} account valuess were inserted.`;
                console.log(message);
                result.sent = true;
                res.send({message: message});
            });
        } catch (e) {
            console.error(e);
            res.status(500).send({ message: e });
        }
    }
};

const loadAndCalculateAccountValues = (accounts, tickerIds, currentMonthDate, result, res) => {
    const query = {
        $and: [
            { tickerId: { $in: tickerIds } },
            { year: currentMonthDate.getFullYear() },
            { month: currentMonthDate.getMonth() + 1 }
        ]
    };
    dbclient.quotedb().collection("hquote").find(query).toArray().then((hqBlocks) => {
        // console.log(hqBlocks);
        calculateAccountValues(hqBlocks, accounts, currentMonthDate, result, res)
    });
}

const prepareForAccountValues = (accounts, activities, lastestValue, res) => {
    const latestValueDateNumber = lastestValue.date ? lastestValue.date : activities[0].date;
    let currentMonthDate = nextValueDate(new Date(latestValueDateNumber));

    // initialize accountMap and accounts
    const accountMap = new Map();
    accounts.forEach(acct => {
        acct.activityList = [];
        acct.state = {
            originalCashAmount: acct.cash,
            cashAmount: acct.cash,
            holdingMap: new Map() // tickerId to holding object
        };
        accountMap.set(acct._id, acct);
    });

    // distribute activities to accounts
    activities.forEach(act => {
        let acct = accountMap.get(act.accountId);
        acct.activityList.push(act);
    });

    let result = {
        error: false,
        sent: false,
        expectedValueCount: 0,
        values: []
    };
    const today = new Date();    
    while (currentMonthDate < today && !result.error) {
        console.log(`    updating account value for ${currentMonthDate.toLocaleString()} ...`);
        result.expectedValueCount += accounts.length;
        // apply activities until the value date
        applyActivtiesUntil(accounts, currentMonthDate);
        let tickerIds = collectHoldingTickerIds(accounts);
        // calculate value
        loadAndCalculateAccountValues(accounts, tickerIds, currentMonthDate, result, res);
        // move to the last day of the next month
        currentMonthDate = nextValueDate(currentMonthDate);
    }

    // res.send("prepareForAccountValues called.");
    if (result.expectedValueCount === 0) {
        let message = 'No account value to insert. All up to date.';
        console.log(message);
        res.send({message: message});
    }
};

exports.updateAccountValues = (req, res) => {
    let accounts = null, activities = null, lastestValue = null;

    const onLoaded = () => {
        if (accounts && activities && lastestValue) {
            prepareForAccountValues(accounts, activities, lastestValue, res);
        }
    };

    try {
        dbclient.recorddb().collection("account").find({}, { sort: { "name": 1 } }).toArray().then((accts) => {
            accounts = accts;
            onLoaded();
        });

        dbclient.recorddb().collection("activity").find({}).sort({ date: 1 }).toArray().then((acts) => { // oldest first
            activities = acts;
            onLoaded();
        });

        dbclient.recorddb().collection("accountvalue").find({}).sort({ date: -1 }).limit(1).toArray().then((values) => {
            lastestValue = values.length > 0 ? values[0] : {};
            if (lastestValue.date) {
                let latestDate = new Date(lastestValue.date);
                console.log(`Latest value date from database is: ${latestDate.toISOString()}`)
                onLoaded();
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: e });
    }
};
