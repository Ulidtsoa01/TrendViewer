import { Link } from 'react-router-dom';
import { Accordion } from 'react-bootstrap';
import HomeAction from './HomeAction';
import styles from './Home.module.css';

function HomePage() {
  return (
    <>
      <HomeAction />
      <Accordion defaultActiveKey="1" className={styles.accordion}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <b>Terms explanation</b>
          </Accordion.Header>
          <Accordion.Body>
            <ul>
              <li>Trade cost: the cost of each trade</li>
              <li>Original Cash: sum of all cash deposited minus the cash withdrawn</li>
              <li>Cash/Current Cash: total amount of cash in the account, available for immediate withdrawal or use</li>
              <li>Value: total worth of all stock holdings and current cash for an account</li>
              <li>Gain: money gained, equals the current value minus the original cash</li>
              <li>Gain Percent: equals the gain divided by the original cash</li>
              <li>SPY Percent: how much gain is invested in SPY, which is the ETF tracking S&amp;P 500 index</li>
              <li>Buy Climax: occurs when an up-trend ends on extremely high volume and narrow price spread &lt;&gt;(what number mean)</li>
              <li>Sell Climax: occurs when a down-trend ends on extremely high volume and narrow price spread</li>
              <li>Buy and Sell Limit: A limit order to buy or sell a security must be executed at a specific price or better. A buy limit order can only be executed lower or equal to the buy limit, and a sell limit order can only be executed above or equal to the sell limit.</li>
              <li>Buy and Sell Stop: A stop order to buy or sell a security is executed to protect profit or limit loss. A buy stop order is executed upon the market price rising to a certain level. A sell stop order is executed upon the market price falling to a certain level.</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            <b>Account Overview</b>
          </Accordion.Header>
          <Accordion.Body>
            <p>Accounts represent the financial accounts of an user. Activities represent the actions taken within an account, such as depositing cash or buying a stock. Activities must be associated with one account id, and they may be associated with one or zero ticker ids depending on the activity type. There are several activity types:</p>
            <ul>
              <li>Deposit: cash deposit</li>
              <li>Withdraw: cash withdraw</li>
              <li>Interest: interest</li>
              <li>Buy: buying a stock</li>
              <li>Sell: selling a stock</li>
              <li>Expense: various expense for holding stock</li>
              <li>Gain: money gained, equals the current value minus the original cash</li>
              <li>Dividend: dividend yield of stock</li>
              <li>Split: when a company divides its stock into multiple shares</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            <b>Account Reports</b>
          </Accordion.Header>
          <Accordion.Body>
            <p>The account reports shows the metrics and activities of the accounts. These metrics are calculated on the server-side, where calls to the MongoDB database are made and the response is returned to the client. These pages are divided into two categories: reports using data from all of the accounts and reports only using data from an individual account.</p>
            <p style={{ textDecoration: 'underline' }}>All</p>
            <ul>
              <li>Summary: Shows a summary of the individual accounts and the links to navigate to them. The summary values of an account are calculated from its activities.</li>
              <li>Trade Activities: Only shows activities of the &quot;Sell&quot; and &quot;Buy&quot; type.</li>
              <li>Monthly Report and Annual Report: Calculates metrics for all of the accounts&#39; values across either different months and different years.</li>
              <li>Report by Stock: Shows an aggregate of all the stocks handled in the activities of all the accounts.</li>
            </ul>
            <p style={{ textDecoration: 'underline' }}>Individual</p>
            <ul>
              <li>Summary: Shows a summary of the account and a list of its holdings.</li>
              <li>Activities: Shows the history of an account&#39;s activities and allows the creation of new activities.</li>
              <li>Monthly Report and Annual Report: Calculates metrics for an account&#39;s values across either different months and different years.</li>
              <li>Value History: Shows the account value at the end of each month. The comment field shows the holdings and the amount of shares.</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>
            <b>Ticker</b>
          </Accordion.Header>
          <Accordion.Body>
            <p>Upon navigating to a ticker, several pages can be accessed:</p>
            <ul>
              <li>Summary: Holds information on a ticker which can be changed by the user. The settings section represents values that are applicable to some but not all tickers.</li>
              <li>Activities: Shows all activities dealing with the ticker from any account.</li>
              <li>Journals: Allows users to take notes for the ticker.</li>
              <li>Quotes: Shows the daily quote and historical quote data for the ticker.</li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="4">
          <Accordion.Header>
            <b>Overview of Ticker Slides, Holdings, Portfolio, and Market Journal</b>
          </Accordion.Header>
          <Accordion.Body>
            <p style={{ textDecoration: 'underline' }}>Ticker Slides</p>
            <p>The slide page for a ticker can be accessed via links on the holdings and portfolio pages. The left side shows the ticker info, quote data, related links, and activities for the specified ticker. The right side has a chart visualizing the quote history of the ticker.</p>
            <p style={{ textDecoration: 'underline' }}>Holdings</p>
            <p>The holdings page shows a list of holdings from all of the accounts, their associated ticker info, and related metrics. The ticker names link to the associated ticker slide.</p>
            <p style={{ textDecoration: 'underline' }}>Portfolio</p>
            <p>Each portfolio page is a collection of tickers, which users can add to or remove from. These collections serve as bookmarks, allowing the user to categorize tickers and easily go back to them later.</p>
            <p style={{ textDecoration: 'underline' }}>Market Journal</p>
            <p>The market journal allows users to take notes and record article links.</p>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

export default HomePage;
