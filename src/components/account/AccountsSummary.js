import { Link } from 'react-router-dom';
import SimpleTable from '../UI/SimpleTable';

export function calcAccountCashPercent(acct) {
  return ((acct.cashAmount * 100.0) / acct.totalAmount).toFixed(2);
}

const columns = [
  { title: 'Account Name', field: 'name', type: 'string', formatter: (r, v) => (v === 'Summary' ? <b>Summary</b> : <Link to={'/account/' + r._id}>{v}</Link>) },
  { title: 'Original Cash', field: 'originalCashAmount', type: 'number', format: 'locale' },
  { title: 'Value', field: 'totalAmount', type: 'number', format: 'locale' },
  { title: 'Gain', field: 'gain', type: 'number', formatter: (r, v) => (v ? r.name === 'Summary' ? <b>{v.toLocaleString()}</b> : v.toLocaleString() : '') },
  { title: 'Current Cash', field: 'cashAmount', type: 'number', format: 'locale' },
  { title: 'Cash Percentage', field: 'gainPercent', type: 'number', formatter: (r, v) => (r.name === 'Summary' ? <b>{calcAccountCashPercent(r)}%</b> : calcAccountCashPercent(r) + '%') },
];

function AccountsSummary(props) {
  const { accounts } = props;
  return <SimpleTable data={accounts} columns={columns} keyField="id" />;
}

export default AccountsSummary;
