# TrendViewer

https://trendviewer-b2ddfdd9532e.herokuapp.com/

## Description

This project is Node.js, MongoDB, and React app for users to track their own financial accounts, view current market stock values, and generate metrics and figures to aid them with market analysis. It employes the following concepts:

- Client-side routing with React Router
  - Facilitate easy and quick navigation between pages, mimicking the experience of a single-page application.
- CSS modules
  - Styles are locally-scoped to prevent potential scoping and specificity problems and keep code organized.
- Server-side routing with Express JS
  - Make the appropriate API calls to the MongoDB database depending on the URL the user visits, and send the response back to the user
  - Backend API testing via Postman to ensure that code works.
- MongoDB database
  - Ensure data persistence and allow flexible handling of data.

## Terms explanation

Explanation of terms and metrics used throughout this project for clarity:

- Trade cost: the cost of each trade
- Original Cash: sum of all cash deposited minus the cash withdrawn
- Cash/Current Cash: total amount of cash in the account, available for immediate withdrawal or use
- Value: total worth of all stock holdings and current cash for an account
- Gain: money gained, equals the current value minus the original cash
- Gain Percent: equals the gain divided by the original cash
- Buy Climax: occurs when an up-trend ends on extremely high volume and narrow price spread <>(what number mean)
- Sell Climax: occurs when a down-trend ends on extremely high volume and narrow price spread
- Buy and Sell Limit: A limit order to buy or sell a security must be executed at a specific price or better. A buy limit order can only be executed lower or equal to the buy limit, and a sell limit order can only be executed above or equal to the sell limit.
- Buy and Sell Stop: A stop order to buy or sell a security is executed to protect profit or limit loss. A buy stop order is executed upon the market price rising to a certain level. A sell stop order is executed upon the market price falling to a certain level.

## Features

### Importing/Exporting Data

Backing up of the data within the MongoDB database is done with a JSON file.

### Account Overview

Accounts represent the financial accounts of an user. Activities represent the actions taken within an account, such as depositing cash or buying a stock. Activities must be associated with one account id, and they may be associated with one or zero ticker ids depending on the activity type. There are several activity types:

- Deposit: cash deposit
- Withdraw: cash withdraw
- Interest: interest
- Buy: buying a stock
- Sell: selling a stock
- Expense: various expense for holding stock
- Gain: money gained, equals the current value minus the original cash
- Dividend: dividend yield of stock
- Split: when a company divides its stock into multiple shares

### Account Reports

The account reports shows the metrics and activities of the accounts. These metrics are calculated on the server-side, where calls to the MongoDB database are made and the response is returned to the client. These pages are divided into two categories: reports using data from all of the accounts and reports only using data from an individual account.

#### All

- Summary: Shows a summary of the individual accounts and the links to navigate to them. The summary values of an account are calculated from its activities.
- Trade Activities: Only shows activities of the "Sell" and "Buy" type.
- Monthly Report and Annual Report: Calculates metrics for all of the accounts' values across either different months and different years.
- Report by Stock: Shows an aggregate of all the stocks handled in the activities of all the accounts.

https://github.com/user-attachments/assets/d85d57c5-c994-4191-bb33-ba565910bdd5

#### Individual

- Summary: Shows a summary of the account and a list of its holdings.
- Activities: Shows the history of an account's activities and allows the creation of new activities.
- Monthly Report and Annual Report: Calculates metrics for an account's values across either different months and different years.
- Value History: Shows the account value at the end of each month. The comment field shows the holdings and the amount of shares.

https://github.com/user-attachments/assets/cf103117-76aa-49e3-821d-d82c406d234a

### Ticker

Upon navigating to a ticker, several pages can be accessed:

- Summary: Holds information on a ticker which can be changed by the user. The settings section represents values that are applicable to some but not all tickers.
- Activities: Shows all activities dealing with the ticker from any account.
- Journals: Allows users to take notes for the ticker.
- Quotes: Shows the daily quote and historical quote data for the ticker.

https://github.com/user-attachments/assets/cf3c0701-6394-4454-8e3e-86fd461e6629

Tickers can also be added and deleted.

https://github.com/user-attachments/assets/57f55700-060c-48f4-9362-3390a7991b34

### Ticker Slides

The slide page for a ticker can be accessed via links on the holdings and portfolio pages. The left side shows the ticker info, quote data, related links, and activities for the specified ticker. The right side has a chart visualizing the quote history of the ticker.

https://github.com/user-attachments/assets/49ad27a0-e4cb-41ae-aff2-da8d30dbbdd8

### Holdings

The holdings page shows a list of holdings from all of the accounts, their associated ticker info, and related metrics. The ticker names link to the associated ticker slide.

### Portfolio

Each portfolio page is a collection of tickers, which users can add to or remove from. These collections serve as bookmarks, allowing the user to categorize tickers and easily go back to them later.

### Market Journal

The market journal allows users to take notes and record article links.

https://github.com/user-attachments/assets/9f72763d-2da3-4ad1-9a20-2d3d7c4e4555

## Data and Functionality

Data stored on the server is split into two databases, RecordDB and QuoteDB. RecordDB holds personal information that is meant to be kept long-term. QuoteDB holds the history of the market values of tickers. Since quote data can accumulate, it is designed to be able to be cleared without harm to any long-term data. Dates are stored in long format. Sample data can be found [here](sample_data)

### RecordDB Collections

#### Ticker

Holds information on tickers which can be changed by the user. The settings field represents values that are applicable to some but not all tickers. Fields: \_id, name, description, type, industry, sector, exchangeCode, settings. Example:

```js
{
  _id: 1,
  name: 'AA',
  type: 'stock',
  sector: 'Industrial Materials',
  industry: 'Aluminum',
  description: 'ALCOA INC',
  exchangeCode: 'NasdaqGS',
  settings: { 'sellLimit': 30, 'sellStop': 460, 'buyLimit': 30, 'buyStop': 500, 'bcIndustry': 'DJUSSW', 'comment': 'Sell by 2024'}
}
```

#### TickerJournal

Journal for note-taking tied to individual tickers. \_id and date are indexes. Fields: \_id, tickerId, date, name, value, urlTitle, url. Example:

```js
{
  _id: 714,
  tickerId: 202,
  name: 'Apple in Three Years',
  date: '1518566400000',
  url: 'http://seekingalpha.com/article/1213481-will-apple-exist-3-years-from-now-how-much-will-it-be-worth?source=email_rt_article_title',
  urlTitle: 'Will Apple Exist 3 Years From Now? How Much WIll It Be Worth?',
  value: 'Could be worth a long-term investment.'
}
```

#### MarketAssessment

Journal for general note-taking. Fields: \_id, date, name, value, urlTitle, url.

#### Portfolio

Collections of tickers that serve as bookmarks. Fields: \_id, name, description, tickers. Example:

```js
{
  _id: 23,
  name: 'High Yield',
  description: 'High yield stocks',
  tickers: [
    'BTI',  'DOW',
    'LUMN', 'MO',
    'NEM',  'OKE',
    'PRU',  'T',
    'VZ'
  ]
}
```

#### Account

Represents a finance account. Fields: \_id, name, cash, createDate.

#### Activity

Represents an action done to a ticker that the user owns. Each activity belongs to an account. Indexes are accountId, tickerId, and date. Fields: \_id, accountId, tickerId, date, shares, amount, price, tradeCost, type. Example:

```js
{
  _id: 2000,
  date: 1707782400000,
  shares: 20,
  amount: 9201.32,
  price: 460.07,
  tradeCost: 0.08,
  type: 'Sell',
  accountId: 2,
  tickerId: 6473
}
```

#### AccountValue

Stores the history of an account's cash and value. Fields: \_id, accountId, date, cash, value, comment. Example:

```js
{
  _id: ObjectId('66da37216cde9e1a5ca65580'),
  date: 1669766400000,
  comment: 'ABBV 35,NEE 160,WEC 175,VTIP 105,FRPT 32',
  cash: 5555.09,
  value: 49282.54,
  accountId: 2
}
```

### QuoteDB Collections

#### dquote (Daily Quote)

Stores a stock quote's last value for a day. \_id matches the \_id of the Ticker collection in RecordDB. Fields: \_id, date, last. Example:

```js
{
  _id: 9,
  date: 1720670400000,
  last: 227.57
}
```

#### hquote (Historical Quotes)

Stores the history of values for a stock quote. Each item in the quotes array contains metrics pertaining to to a single day. Fields: \_id, tickerId, year, month, quotes. Example:

```js
{
  _id: ObjectId('66da371a6cde9e1a5ca5e743'),
  tickerId: 5828,
  year: 2024,
  month: 6,
  quotes: [
    {
      date: 1719532800000,
      volume: 818129,
      high: 388.02,
      low: 382.46,
      change: 0,
      adjclose: 0,
      close: 385.87,
      open: 385.98
    }
  ]
}
```

## Credits

- **Dependencies:**
  - frontend
    - react-redux: stage management for a centralized application state
    - react-bootstrap: templates for various compoenents
    - others: axios, react-router-dom, react-select
  - server
    - multer: node.js middleware for handling multipart/form-data
    - others: cors, express, mongodb
- Code in [MyChart.js](src/components/UI/MyChart.js) and MyChartContext.js(src/components/UI/MyChartContext.js) is borrowed from an acquaintance.
