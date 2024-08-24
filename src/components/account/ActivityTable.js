import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Container, Navbar, Form, Button } from 'react-bootstrap';

import styles from './Account.module.css';
import SimpleTable from '../UI/SimpleTable';
import ActivityEdit from './ActivityEdit';

function ActivityTable(props) {
  const { activityList, account } = props;
  const [mode, setMode] = useState('home');
  const [clickedActivity, setClickedActivity] = useState(null);
  const [filter, setFilter] = useState('');

  // console.log('ActivityTable called with accountId=' + accountId);
  // console.log(activityList);

  const handleActivityClick = (e) => {
    // console.log('handleActivityClick called');
    // console.log(e.target.id);
    const ca = activityList.find((j) => j._id === Number(e.target.id));
    if (ca) {
      setClickedActivity(ca);
      setMode('editactivity');
    }
    return false; // so that anchor will not process href
  };

  const columns = [
    {
      title: 'Date',
      field: 'date',
      type: 'date',
      formatter: (r, v) => (
        <a href="#" id={r._id} onClick={handleActivityClick}>
          {new Date(v).toISOString().split('T')[0]}
        </a>
      ),
    },
    { title: 'Type', field: 'type', type: 'string' },
    { title: 'Ticker', field: 'tickerName', type: 'string', formatter: (r, v) => <Link to={'/ticker/' + v}>{v}</Link> },
    { title: 'Price', field: 'price', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell' ? v : '') },
    { title: 'Shares', field: 'shares', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell' ? v : '') },
    { title: 'Net Shares', field: 'accumulatedShares', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell' ? v : '') },
    { title: 'Trade Cost', field: 'tradeCost', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell' ? v : '') },
    { title: 'Amount', field: 'amount', type: 'number' },
    { title: 'Comment', field: 'comment', type: 'string' },
  ];

  const handleAddClick = () => {
    // console.log('handleAddClick called');
    // navigate("/activities/" + accountId + '/new');
    setMode('addactivity');
  };

  const handleCancel = (e) => {
    setMode('home');
  };

  const filterActivityList = () => {
    if (!filter) {
      return activityList;
    }
    return activityList.filter((act) => (act.tickerName && act.tickerName.includes(filter.toUpperCase())) || (act.type && act.type.toLowerCase().includes(filter.toLowerCase())));
  };

  return (
    <>
      {mode === 'home' && (
        <Navbar expand="lg" className="bg-body-tertiary">
          <Container fluid>
            <Navbar.Brand as={Link} to="#">
              {account ? account.name : 'Trade Activities'}
            </Navbar.Brand>
            <Navbar.Collapse id="navbarActivities">
              <Form className="d-flex">
                <Form.Control type="text" id="filter" placeholder="please enter a word to filter..." value={filter} onChange={(e) => setFilter(e.target.value)} />
                {account && (
                  <Button variant="primary" className={styles.toolbarButton} onClick={handleAddClick}>
                    Create
                  </Button>
                )}
              </Form>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
      {mode === 'home' && <SimpleTable data={filterActivityList()} columns={columns} keyField="id" />}
      {mode === 'addactivity' && <ActivityEdit account={account} onCancel={handleCancel} />}
      {mode === 'editactivity' && <ActivityEdit account={account} activity={clickedActivity} onCancel={handleCancel} />}
    </>
  );
}

export default ActivityTable;
