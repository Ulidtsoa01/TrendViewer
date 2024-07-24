import { useState } from 'react';
import { useRouteLoaderData, json } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Tab, Tabs } from 'react-bootstrap';
import { removeTicker } from '../misc/Utils';
import TickerFields from './TickerFields';
import TickerEdit from './TickerEdit';
import EditSettings from './EditSettings';
import TickerActivities from './TickerActivities';
import TickerJournals from './TickerJournals';
import TickerQuotes from './TickerQuotes';

function TickerGeneral() {
    const tickerInfo = useRouteLoaderData('tickerGeneral');
    const dispatch = useDispatch();
    const tickers = useSelector((state) => state.tickers);
    const [tabKey, setTabKey] = useState('ticker');
    const [generalMode, setGeneralMode] = useState('general');

    // console.log('TickerGeneral called, and tickerInfo is');
    // console.log(tickerInfo);

    const handleEditTicker = () => {
        setGeneralMode('editticker');
    }

    const handleModifySettings = () => {
        setGeneralMode('modifysetting');
    }

    const handleEditTickerCancel = () => {
        setGeneralMode('general');
    };

    const handleEditTickerDelete = () => {
        removeTicker(tickerInfo.tickerName, tickers, dispatch);
        setGeneralMode('general');
    };

    return (
        <Tabs
            id="ticker_page"
            activeKey={tabKey}
            onSelect={(k) => setTabKey(k)}
            className="mb-3"
        >
            <Tab eventKey="ticker" title={tickerInfo ? tickerInfo.tickerName : 'General'}>
                {tickerInfo && generalMode === 'general' && <TickerFields tickerInfo={tickerInfo} onEditTickerClicked={handleEditTicker} onModifySettingClicked={handleModifySettings} />}
                {tickerInfo && generalMode === 'editticker' && <TickerEdit tickerInfo={tickerInfo} onCancelClicked={handleEditTickerCancel} onDeleteClicked={handleEditTickerDelete} />}
                {tickerInfo && generalMode === 'modifysetting' && <EditSettings tickerInfo={tickerInfo} onCancelClicked={handleEditTickerCancel} />}
            </Tab>
            <Tab eventKey="activities" title="Activities" disabled={!tickerInfo}>
                {tickerInfo &&
                    <TickerActivities tickerInfo={tickerInfo} />
                }
            </Tab>
            <Tab eventKey="journals" title="Journals" disabled={!tickerInfo}>
                {tickerInfo &&
                    <TickerJournals tickerInfo={tickerInfo} />
                }
            </Tab>
            <Tab eventKey="quotes" title="Quotes" disabled={!tickerInfo}>
                {tickerInfo &&
                    <TickerQuotes tickerInfo={tickerInfo} />
                }
            </Tab>
        </Tabs>
    );
}

export default TickerGeneral;

export async function loader({ params }) {
    const tickerName = params.tickerName;
    const response = await fetch('/rest/tinfo/' + tickerName);
    // console.log('TickerGeneral loader called with tickerName=' + tickerName);

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