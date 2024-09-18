import { Link } from 'react-router-dom';
import SimpleTable from '../UI/SimpleTable';

const columns = [
  {
    title: 'Date',
    field: 'date',
    type: 'date',
    formatter: (r, v) => (
      <Link to={'/activities/' + r.accountId + '/edit/' + r.id} state={r}>
        {new Date(v).toISOString().split('T')[0]}
      </Link>
    ),
  },
  { title: 'Type', field: 'type', type: 'string' },
  { title: 'Price', field: 'price', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell' ? v : '') },
  { title: 'Shares', field: 'shares', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell' ? v : '') },
  { title: 'Net Shares', field: 'accumulatedShares', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell' ? v : '') },
  { title: 'Trade Cost', field: 'tradeCost', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell' ? v : '') },
  { title: 'Amount', field: 'amount', type: 'number' },
  { title: 'Account', field: 'accountName', type: 'string' },
  { title: 'Comment', field: 'comment', type: 'string' },
];

function TickerActivities(props) {
  const { tickerInfo } = props;
  const activityList = [...tickerInfo.activityList].reverse();
  return <SimpleTable data={activityList} columns={columns} keyField="id" />;
}

export default TickerActivities;
