import { useState } from 'react';
import { useRouteLoaderData, useParams, useNavigate, json, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import styles from './ActivityTable.module.css';
import SimpleTable from '../UI/SimpleTable';
import { getAccountName } from '../misc/Utils';

const columns = [
    { title: 'Date', field: 'date', type: 'date', formatter: (r, v) => <Link to={'/activities/' + r.accountId + '/edit/'+r.id} state={r}>{(new Date(v)).toISOString().split('T')[0]}</Link> },
    { title: 'Type', field: 'type', type: 'string' },
    { title: 'Ticker', field: 'tickerName', type: 'string', formatter: (r, v) => <Link to={'/ticker/' + v}>{v}</Link>  },
    { title: 'Price', field: 'price', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell') ? v : '' },
    { title: 'Shares', field: 'shares', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell') ? v : '' },
    { title: 'Net Shares', field: 'accumulatedShares', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell') ? v : '' },
    { title: 'Trade Cost', field: 'tradeCost', type: 'number', formatter: (r, v) => (r.type === 'Buy' || r.type === 'Sell') ? v : '' },
    { title: 'Amount', field: 'amount', type: 'number' },
    { title: 'Comment', field: 'comment', type: 'string' },
];

function ActivityTable() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');
    let { accountId } = useParams();
    let accounts = useSelector((state) => state.accounts);
    const accountName = getAccountName(accountId, accounts);
    const activityList = useRouteLoaderData('accountId');

    // console.log('ActivityTable called with accountId=' + accountId);
    // console.log(activityList);

    const handleAddClick = () => {
        console.log('handleAddClick called');
        navigate("/activities/" + accountId + '/new');
    };

    const handleFilterKeyUp = (e) => {
        console.log(e.key);
    };

    const filterActivityList = () => {
        if (!filter) {
            return activityList;
        }
        return activityList.filter(act => (act.tickerName && act.tickerName.includes(filter.toUpperCase())) || (act.type && act.type.toLowerCase().includes(filter.toLowerCase())));
    }

    return (
        <>
            <div className={styles.nav}>
                <span className={styles.header}>{accountName}</span>
                <input id='filter' className={styles.filter} value={filter} onChange={(e) => setFilter(e.target.value)}/>
                {accountId !== '0' &&
                    <ButtonGroup className={styles.addButtonGroup + ' mb-2'}>
                        <Button id="Add" variant="primary" onClick={handleAddClick}>Add</Button>
                    </ButtonGroup>
                }
            </div>
            <SimpleTable data={filterActivityList()} columns={columns} keyField='id' />
        </>
    )
}

export default ActivityTable;

export async function loader({ params }) {
    const accountId = params.accountId;
    const urlPrefix = '/rest/account/';
    const url = (accountId === '0') ? urlPrefix + 'tradeactivities' : urlPrefix + accountId + '/tradeactivities';
    const response = await fetch(url);
    // console.log('ActivityTable loader called with accountId=' + accountId);

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
        return resData.reverse();
    }
}