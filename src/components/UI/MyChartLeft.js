import { useEffect, useRef, useState } from 'react';
import { Link, json } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import styles from './MyChartLeft.module.css';

const dateFormatter = (d) => {
  let date = new Date(d);
  return date.toISOString().split('T')[0];
};

const MyChartLeft = ({ data, stockList, index, toPrevious, toNext }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buyLimitInputRef = useRef();
  const sellStopInputRef = useRef();
  const commentInputRef = useRef();

  useEffect(() => {
    buyLimitInputRef.current.value = data.buyLimit ? data.buyLimit : '';
    sellStopInputRef.current.value = data.sellStop ? data.sellStop : '';
    commentInputRef.current.value = data.comment ? data.comment : '';
  }, [data]);

  //let index = holdings.findIndex((h) => h.tickerName === data.tickerName) + 1;
  let indexStr = stockList ? index + 1 + ' of ' + stockList.length : '';
  let dquoteDateString = '';
  if (data.dquote && data.dquote.date) {
    let dquoteDate = new Date(data.dquote.date);
    dquoteDateString = dquoteDate.toISOString(); //.split('T')[0];
  }
  let lastQuote = data.quotes[0];
  let lastQuoteDate = lastQuote ? new Date(lastQuote.date) : null;
  let lastQuoteDateString = lastQuoteDate ? lastQuoteDate.toISOString().split('T')[0] : null;

  const submitHandler = (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const sendData = async () => {
      const tickerData = {
        tickerId: Number(data.tickerId),
        buyLimit: buyLimitInputRef.current.value,
        sellStop: sellStopInputRef.current.value,
        comment: commentInputRef.current.value,
      };

      let url = '/rest/tinfo/' + Number(data.tickerId) + '/settings';

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tickerData),
      });

      setIsSubmitting(false);
      if (response.status === 422) {
        return response;
      }

      if (!response.ok) {
        throw json({ message: 'Could not save event.' }, { status: 500 });
      }
    };

    sendData();
  };

  return (
    <div className={styles.rootDiv}>
      <h1>{data.tickerName}</h1>
      <div className={styles.indexRow}>
        <Button variant="primary" disabled={!stockList || index <= 0} onClick={toPrevious}>
          Previous
        </Button>
        <h5>{indexStr}</h5>
        <Button variant="primary" disabled={!stockList || index >= stockList.length - 1} onClick={toNext}>
          Next
        </Button>
      </div>
      <div>
        <p>
          Last Price: {data.dquote.last} on {dquoteDateString}
        </p>
        <p>
          Last Quote: {lastQuote ? lastQuote.close : ''} on {lastQuoteDateString}
        </p>
      </div>
      <p className={styles.gainRow}>
        <span>
          Current Gain:
          <span className={data.currentGain < 0 ? styles.negativeGain : styles.positiveGain}>{Math.round(data.currentGain * 100) / 100}</span>
        </span>
        <span>
          Life time Gain:
          <span className={data.lifetimeGain < 0 ? styles.negativeGain : styles.positiveGain}>{Math.round(data.lifetimeGain * 100) / 100}</span>
        </span>
      </p>
      <div className={styles.externalLinksRow}>
        {<Link to={'/ticker/' + data.tickerName}>Ticker</Link>}
        <a href={'https://seekingalpha.com/symbol/' + data.tickerName} target="_blank" rel="noreferrer">
          Seeking Alpha
        </a>
        <a href={'https://bigcharts.marketwatch.com/quickchart/quickchart.asp?symb=' + data.tickerName} target="_blank" rel="noreferrer">
          Big Charts
        </a>
        <a href={'https://finance.yahoo.com/quote/' + data.tickerName} target="_blank" rel="noreferrer">
          Yahoo
        </a>
      </div>
      <form onSubmit={submitHandler}>
        <div className={styles.formControl}>
          <label htmlFor="sellstop">Sell Stop</label>
          <input id="sellstop" name="sellstop" type="text" ref={sellStopInputRef} />
        </div>
        <div className={styles.formControl}>
          <label htmlFor="buylimit">Buy Limit</label>
          <input id="buylimit" name="buylimit" type="text" ref={buyLimitInputRef} />
        </div>
        <label htmlFor="comment">Comment:</label>
        <div className={styles.formControl}>
          <textarea id="comment" name="comment" rows={5} cols={60} ref={commentInputRef} />
        </div>
        <div className={styles.buttonRow}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Save'}
          </Button>
        </div>
      </form>
      <div className={styles.activityTable}>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <td>Date</td>
              <td>Type</td>
              <td>Price</td>
              <td>Shares</td>
              <td>Net</td>
              <td>Amount</td>
              <td>Account</td>
            </tr>
          </thead>
          <tbody>
            {data.displayActivities.map((act) => (
              <tr key={act.id}>
                <td>{dateFormatter(act.date)}</td>
                <td>{act.type}</td>
                <td>{Math.round(act.price * 1000) / 1000}</td>
                <td>{act.shares}</td>
                <td>{Math.round(act.accumulatedShares * 1000) / 1000}</td>
                <td>{act.amount}</td>
                <td>{act.accountName}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default MyChartLeft;

// export async function action({ request, params }) {
//   const method = 'PUT';
//   const data = await request.formData();

//   const tickerData = {
//     tickerId: data.get('tickerId'),
//     buyLimit: data.get('buylimit'),
//     sellStop: data.get('sellStop'),
//     comment: data.get('comment'),
//   };

//   let url = '/rest/tinfo/' + data.get('tickerId') + '/settings';

//   const response = await fetch(url, {
//     method: method,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(tickerData),
//   });

//   if (response.status === 422) {
//     return response;
//   }

//   if (!response.ok) {
//     throw json({ message: 'Could not save event.' }, { status: 500 });
//   }

//   //return redirect('/events');
// }
