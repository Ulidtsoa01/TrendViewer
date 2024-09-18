import 'bootstrap/dist/css/bootstrap.min.css';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import RootLayout from './components/misc/Root.js';
import ErrorPage from './components/misc/Error.js';
import HomePage from './components/home/Home.js';
import HoldingTable, { loader as holdingLoader } from './components/holding/HoldingTable.js';
import HoldingSlide from './components/holding/HoldingSlide.js';
import HotTable, { loader as hotLoader } from './components/hot/HotTable.js';
import HotSlide from './components/hot/HotSlide.js';
import { loader as slideLoader } from './components/UI/MyChart.js';
import WatchTable, { loader as watchLoader } from './components/watch/WatchTable.js';
import WatchSlide from './components/watch/WatchSlide.js';
import TickerHome from './components/ticker/TickerHome.js';
import TickerGeneral, { loader as tickerLoader } from './components/ticker/TickerGeneral.js';
import MarketHome, { loader as marketJournalLoader } from './components/market/MarketHome.js';
import AccountsHome, { loader as accountLoader } from './components/account/AccountsHome.js';
import AccountHome from './components/account/AccountHome.js';

const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'account',
        id: 'account',
        loader: accountLoader,
        children: [
          { index: true, element: <AccountsHome /> },
          { path: ':accountId', element: <AccountHome /> },
        ],
      },
      {
        path: 'holdings',
        id: 'holdings',
        loader: holdingLoader,
        children: [
          { index: true, element: <HoldingTable /> },
          { path: 'slide/:ticker', element: <HoldingSlide />, loader: slideLoader },
        ],
      },
      {
        path: 'hot',
        id: 'hot',
        loader: hotLoader,
        children: [
          { index: true, element: <HotTable /> },
          { path: 'slide/:ticker', element: <HotSlide />, loader: slideLoader },
        ],
      },
      {
        path: 'watch',
        id: 'watch',
        children: [
          {
            path: ':watchId',
            id: 'watchId',
            children: [
              { index: true, element: <WatchTable />, loader: watchLoader },
              { path: 'slide/:ticker', element: <WatchSlide />, loader: slideLoader },
            ],
          },
        ],
      },
      { path: 'market', id: 'market', element: <MarketHome />, loader: marketJournalLoader },
      {
        path: 'ticker',
        id: 'tickerHome',
        children: [
          { index: true, element: <TickerHome /> },
          { path: ':tickerName', id: 'tickerGeneral', element: <TickerGeneral />, loader: tickerLoader },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
