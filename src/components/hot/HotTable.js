import { useRouteLoaderData, json } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { stocklistActions } from '../../store/index';

import SortedTable from '../UI/SortedTable';

const columns = [
  { title: 'Name', field: 'tickerName', sortable: true, type: 'string', url: (row) => (row.category === 'Fixed' ? null : '/hot/slide/' + row.tickerName) },
  { title: 'Current Price', field: 'lastPrice', sortable: true },
  { title: 'Buy Limit', field: 'buyLimit', sortable: true, alert: (row, styles) => (row.buyLimit && row.buyLimit >= row.lastPrice ? styles.alert : '') },
  { title: 'Class', field: 'tickerClass', sortable: true, type: 'string' },
  { title: 'Category', field: 'category', sortable: true, type: 'string' },
  { title: 'Buy Climax', field: 'buyClimax' },
  { title: 'Sell Climax', field: 'sellClimax' },
  { title: 'Comment', field: 'comment', type: 'string' },
];

function HotTable() {
  const hotList = useRouteLoaderData('hot');
  const dispatch = useDispatch();
  dispatch(stocklistActions.setHot(hotList));

  //console.log("HotTable called");

  return <SortedTable title="Hot" data={hotList} columns={columns} keyField="tickerId" addUrl="/rest/hot/add/" deleteUrl="/rest/hot/remove/" />;
}

export default HotTable;

export async function loader() {
  const response = await fetch('/rest/hot');
  // console.log('HotTable loader called...');

  if (!response.ok) {
    // return { isError: true, message: 'Could not fetch events.' };
    // throw new Response(JSON.stringify({ message: 'Could not fetch events.' }), {
    //   status: 500,
    // });
    throw json(
      { message: 'Could not fetch hot items.' },
      {
        status: 500,
      }
    );
  } else {
    const resData = await response.json();
    //console.log(resData);
    return resData;
  }
}
