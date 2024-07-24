const dbclient = require('./dbclient');
const util = require('./util');

exports.getAccounts = function(req, res) {
    try {
        const options = {
            sort: { "createDate": -1 },
        };
        dbclient.recorddb().collection("account").find({}, options).toArray().then((accounts) => {
            // not sure whether I should do the following
            // accounts.forEach(acct => {
            //     acct.createDate = new Date(acct.createDate);
            // });
            // console.log(accounts);
            res.send(accounts);
        });
    } catch (e) {
        console.error(e);
        res.status(500).send({ message: e});
    }
};
