import { useState } from 'react';
import { useRouteLoaderData, useParams, useNavigate, useRevalidator, useLocation } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import AccountSummary from './AccountSummary';
import ActivityTable from './ActivityTable';
import AccountReport from './AccountReport';
import ValueHistory from './ValueHistory';

function AccountHome() {
    let { accountId } = useParams();
    const accounts = useRouteLoaderData('account');
    const [tabKey, setTabKey] = useState('home');

    const account = accounts.find((e) => e.id === Number(accountId));

    return (
        <Tabs
            id="marketTabs"
            activeKey={tabKey}
            onSelect={(k) => setTabKey(k)}
            className="mb-3"
        >
            <Tab eventKey="home" title={account.name}>
                <AccountSummary account={account} />
            </Tab>
            <Tab eventKey="activities" title="Activities">
                {tabKey === 'activities' &&
                    <ActivityTable account={account} activityList={[...account.activityList].reverse()} />
                }
            </Tab>
            <Tab eventKey="monthlyReport" title="Monthly Report">
                {tabKey === 'monthlyReport' &&
                    <AccountReport account={account} period='Monthly' />
                }
            </Tab>
            <Tab eventKey="annualReport" title="Annual Report">
                {tabKey === 'annualReport' &&
                    <AccountReport account={account} period='Annual' />
                }
            </Tab>
            <Tab eventKey="valueHistory" title="Value History">
                {tabKey === 'valueHistory' &&
                    <ValueHistory account={account} />
                }
            </Tab>
        </Tabs>
    );
}

export default AccountHome;