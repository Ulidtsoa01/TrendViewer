import { useState } from 'react';
import { useRouteLoaderData, json } from 'react-router-dom';
import { Tab, Tabs } from 'react-bootstrap';
import AccountsSummary from './AccountsSummary';
import TradeActivities from './TradeActivities';
import AccountReport from './AccountReport';
import ReportByStock from './ReportByStock';

function AccountsHome() {
  const accounts = useRouteLoaderData('account');
  const [tabKey, setTabKey] = useState('home');

  return (
    <Tabs id="accountTabs" activeKey={tabKey} onSelect={(k) => setTabKey(k)} className="mb-3">
      <Tab eventKey="home" title="Summary">
        <AccountsSummary accounts={accounts} />
      </Tab>
      <Tab eventKey="tradeActivities" title="Trade Activities">
        {tabKey === 'tradeActivities' && <TradeActivities />}
      </Tab>
      <Tab eventKey="monthlyReport" title="Monthly Report">
        {tabKey === 'monthlyReport' && <AccountReport period="Monthly" />}
      </Tab>
      <Tab eventKey="annualReport" title="Annual Report">
        {tabKey === 'annualReport' && <AccountReport period="Annual" />}
      </Tab>
      <Tab eventKey="reportByStock" title="Report by Stock">
        {tabKey === 'reportByStock' && <ReportByStock />}
      </Tab>
    </Tabs>
  );
}

export default AccountsHome;

export async function loader({ params }) {
  const response = await fetch('/rest/account');
  console.log('AccountHome loader called');

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
    const summaryAccount = {
      name: 'Summary',
      originalCashAmount: resData.reduce((a, e) => a + e.originalCashAmount, 0),
      totalAmount: resData.reduce((a, e) => a + e.totalAmount, 0),
      cashAmount: resData.reduce((a, e) => a + e.cashAmount, 0),
      gain: resData.reduce((a, e) => a + e.gain, 0),
    };
    summaryAccount.cashPercent = (summaryAccount.cashAmount * 100.0) / summaryAccount.totalAmount;
    resData.push(summaryAccount);
    console.log(resData);
    return resData;
  }
}
