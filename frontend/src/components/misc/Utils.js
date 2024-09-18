import { stocklistActions } from "../../store";

export function getJournalURL() {
    return 'http://localhost:3001/journals/';
}

export function toDateWithSeconds(dateInNumber) {
    if (!dateInNumber)
        return '';
    const dateObj = new Date(dateInNumber);
    const dateStr = dateObj.toISOString();
    const index = dateStr.indexOf('.');
    if (index > 0) {
        return dateStr.substring(0, index);
    } else
        return dateStr;
}

export function getAccountName(accountId, accounts) {
    if (accountId === '0')
        return 'All Accounts';
    let acct = accounts ? accounts.find(a => a.id === Number(accountId)) : null;
    return acct ? acct.name : '';
}

export function fillTickerOptions(tickers, options, dispatch) {
    if (tickers) {
        // console.log("tickers are available");
        tickers.forEach(t => {
            let jsonData = {};
            jsonData['value'] = t;
            jsonData['label'] = t;
            options.push(jsonData);
        });
    } else {
        console.log("loading tickers...");
        fetch('/rest/tinfo').then((response) => {
            console.log(response);
            if (response.ok) {
                response.json().then((resData) => {
                    //console.log(resData);
                    dispatch(stocklistActions.setTickers(resData));
                });
            }
        }).catch((err) => {
            console.error(err);
        });
    }
}

export function removeTicker(tickerToRemove, tickers, dispatch) {
    const newTickers = tickers.filter((t) => t !== tickerToRemove);
    dispatch(stocklistActions.setTickers(newTickers));
}
