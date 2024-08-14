import { useLoaderData, useParams, json } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { stocklistActions } from '../../store/index';
import { PortfolioMap } from '../../Constant';
import SortedTable from '../UI/SortedTable';

const columns = [
  { title: 'Name', field: 'tickerName', sortable: true, type: 'string', url: (row, preSlide) => (preSlide ? '/watch/' + preSlide + '/slide/' + row.tickerName : '/watch/slide/' + row.tickerName) },
  { title: 'Current Price', field: 'lastPrice', sortable: true },
  { title: 'Buy Limit', field: 'buyLimit', sortable: true, alert: (row, styles) => (row.buyLimit && row.buyLimit >= row.lastPrice ? styles.alert : '') },
  { title: 'Class', field: 'tickerClass', sortable: true, type: 'string' },
  { title: 'Category', field: 'category', sortable: true, type: 'string' },
  { title: 'Buy Climax', field: 'buyClimax' },
  { title: 'Sell Climax', field: 'sellClimax' },
  { title: 'Comment', field: 'comment', type: 'string' },
];

function WatchTable() {
  const { watchId } = useParams();
  const watchList = useLoaderData();
  // console.log('WatchTable called with watchId=' + watchId);
  //console.log(watchList);
  const dispatch = useDispatch();
  dispatch(stocklistActions.setWatch({ watchId: watchId, stockList: watchList }));

  return <SortedTable title={PortfolioMap[watchId]} data={watchList} columns={columns} keyField="tickerId" preSlide={watchId} addUrl={'/rest/watch/add/' + watchId + '/'} deleteUrl={'/rest/watch/remove/' + watchId + '/'} />;
}

export default WatchTable;

export async function loader({ params }) {
  const watchId = params.watchId;
  const response = await fetch('/rest/watch/items/' + watchId);
  console.log('WatchTable loader called for ' + watchId);

  if (!response.ok) {
    // return { isError: true, message: 'Could not fetch events.' };
    // throw new Response(JSON.stringify({ message: 'Could not fetch events.' }), {
    //   status: 500,
    // });
    throw json(
      { message: 'Could not fetch watch items.' },
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
