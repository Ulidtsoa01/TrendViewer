import { useState } from 'react';
import { useRouteLoaderData, json } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { stocklistActions } from '../../store/index';

import styles from './HoldingTable.module.css';
import SortedTable from '../UI/SortedTable';

const columns = [
  { title: 'Name', field: 'tickerName', sortable: true, type: 'string', url: (row) => (row.category === 'Fixed' ? null : '/holdings/slide/' + row.tickerName) },
  { title: 'Shares', field: 'number', sortable: true },
  { title: 'Enter Price', field: 'enterPrice', sortable: true, formatter: (v) => Math.round(v * 10000) / 10000 },
  { title: 'Current Price', field: 'lastPrice', sortable: true },
  { title: 'Sell Stop', field: 'sellStop', sortable: true, alert: (row, styles) => (row.sellStop && row.sellStop >= row.lastPrice ? styles.alert : '') },
  { title: 'Cost', field: 'cost', sortable: true, formatter: (v) => Math.round(v * 100) / 100 },
  { title: 'Value', field: 'value', sortable: true, formatter: (v) => Math.round(v * 100) / 100 },
  { title: 'Value Percent', field: 'valuePercent', sortable: true, formatter: (v) => Math.round(v * 100) / 100 },
  { title: 'Gain', field: 'gain', sortable: true, formatter: (v) => Math.round(v * 100) / 100 },
  { title: 'Gain Percent', field: 'gainPercent', sortable: true, formatter: (v) => Math.round(v * 100) / 100 + '%' },
  { title: 'Class', field: 'tickerClass', sortable: true, type: 'string' },
  { title: 'Category', field: 'category', sortable: true, type: 'string' },
  { title: 'Buy Climax', field: 'buyClimax' },
  { title: 'Sell Climax', field: 'sellClimax' },
  { title: 'Comment', field: 'comment', type: 'string' },
];

function HoldingTable() {
  const [holdingList, cashHolding] = useRouteLoaderData('holdings');
  const dispatch = useDispatch();
  dispatch(stocklistActions.setHoldings(holdingList));

  const [notice] = useState('');
  const [updateNumber] = useState(1);
  const [holdings] = useState(holdingList);

  const totalCash = Math.round(cashHolding.value * 100) / 100;
  const totalValue = Math.round((cashHolding.value * 10000) / cashHolding.valuePercent) / 100;
  // console.log("cash=", totalCash, ", total value=", totalValue);

  return (
    <>
      <SortedTable title="Holding" key={updateNumber} data={holdings} columns={columns} keyField="tickerId" />
      <div className={styles.holdingNav}>
        <span className={styles.notice}>Total: {totalValue.toLocaleString()}</span>
        <span className={styles.notice}>Cash: {totalCash.toLocaleString()}</span>
        <span className={styles.notice}>{notice}</span>
      </div>
    </>
  );
}

export default HoldingTable;

export async function loader() {
  const response = await fetch('/rest/holding');
  // console.log('HoldingTable loader called...');

  if (!response.ok) {
    // return { isError: true, message: 'Could not fetch events.' };
    // throw new Response(JSON.stringify({ message: 'Could not fetch events.' }), {
    //   status: 500,
    // });
    throw json(
      { message: 'Could not fetch holdings.' },
      {
        status: 500,
      }
    );
  } else {
    const resData = await response.json();
    let totalValue = resData.reduce((t, h) => t + h.value, 0.0);
    // console.log("total value is: " + totalValue);
    resData.forEach((h) => (h.valuePercent = (h.value * 100.0) / totalValue));
    const cashHolding = resData.pop();
    // console.log(resData);
    return [resData, cashHolding];
  }
}
