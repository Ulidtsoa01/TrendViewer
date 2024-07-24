import { useState } from 'react';
import { useRouteLoaderData, json } from 'react-router-dom';
import { Card, Container, Tab, Tabs } from 'react-bootstrap';
import MarketJournals from './MarketJournals';
import styles from './Market.module.css';

function MarketHome() {
    const journalList = useRouteLoaderData('market');
    const [tabKey, setTabKey] = useState('home');

    return (
        <Tabs
            id="marketTabs"
            activeKey={tabKey}
            onSelect={(k) => setTabKey(k)}
            className="mb-3"
        >
            <Tab eventKey="home" title="Market">
                <Card className={styles.panel}>
                    <Card.Header><Card.Title>Market</Card.Title></Card.Header>
                    <Card.Body>
                        <Container>
                            <ul>
                                <li>Market Analysis
                                    <ol>
                                        <li>Study market breadth at <a href="https://www.marketinout.com/chart/market.php?breadth=advance-decline-line" target="_blank">A/D Issues at Market InOut</a>.</li>
                                        <li>Market Index
                                            <ul>
                                                <li><a target="_blank" href="http://bigcharts.marketwatch.com/advchart/frames/frames.asp?show=&insttype=Index&symb=dji&x=0&y=0&time=9&startdate=1%2F4%2F1999&enddate=1%2F4%2F2020&freq=1&compidx=aaaaa%3A0&comptemptext=&comp=none&ma=4&maval=20%2C50%2C200&uf=0&lf=2&lf2=4&lf3=0&type=4&style=320&size=3&timeFrameToggle=false&compareToToggle=false&indicatorsToggle=false&chartStyleToggle=false&state=11">Dow Jones Daily</a></li>
                                                <li><a target="_blank" href="http://bigcharts.marketwatch.com/advchart/frames/frames.asp?show=&insttype=Index&symb=nasdaq&x=0&y=0&time=9&startdate=1%2F4%2F1999&enddate=1%2F4%2F2020&freq=1&compidx=aaaaa%3A0&comptemptext=&comp=none&ma=4&maval=20%2C50%2C200&uf=0&lf=2&lf2=4&lf3=0&type=4&style=320&size=3&timeFrameToggle=false&compareToToggle=false&indicatorsToggle=false&chartStyleToggle=false&state=11">Nasdaq</a></li>
                                                <li><a target="_blank" href="http://bigcharts.marketwatch.com/advchart/frames/frames.asp?show=&insttype=Index&symb=sp500&x=0&y=0&time=9&startdate=1%2F4%2F1999&enddate=1%2F4%2F2020&freq=1&compidx=aaaaa%3A0&comptemptext=&comp=none&ma=4&maval=20%2C50%2C200&uf=0&lf=2&lf2=4&lf3=0&type=4&style=320&size=3&timeFrameToggle=false&compareToToggle=false&indicatorsToggle=false&chartStyleToggle=false&state=11">S&P 500</a></li>
                                                <li><a target="_blank" href="http://bigcharts.marketwatch.com/advchart/frames/frames.asp?show=&insttype=Index&symb=djt&x=0&y=0&time=9&startdate=1%2F4%2F1999&enddate=1%2F4%2F2020&freq=1&compidx=aaaaa%3A0&comptemptext=&comp=none&ma=4&maval=20%2C50%2C200&uf=0&lf=2&lf2=4&lf3=0&type=4&style=320&size=3&timeFrameToggle=false&compareToToggle=false&indicatorsToggle=false&chartStyleToggle=false&state=11">Dow Jones Transportation Average</a></li>
                                                <li><a target="_blank" href="http://bigcharts.marketwatch.com/advchart/frames/frames.asp?show=&insttype=Index&symb=rut&x=0&y=0&time=9&startdate=1%2F4%2F1999&enddate=1%2F4%2F2020&freq=1&compidx=aaaaa%3A0&comptemptext=&comp=none&ma=4&maval=20%2C50%2C200&uf=0&lf=2&lf2=4&lf3=0&type=4&style=320&size=3&timeFrameToggle=false&compareToToggle=false&indicatorsToggle=false&chartStyleToggle=false&state=11">Russel 2000</a></li>
                                                <li>Cutting your stock-market exposure when the 50-day (10 weeks) average fell below the 200-day (40 weeks) average, and raising it when the 50-day rose above the 200-day, got you out of the market before the biggest crashes and kept you in it during the biggest bull markets.</li>
                                            </ul>
                                        </li>
                                        <li>Economy
                                            <ul>
                                                <li><a target="_blank" href="https://ycharts.com/indicators/us_pmi#:~:text=US%20ISM%20Manufacturing%20PMI%20is,manufacturing%20sector%20in%20the%20US.">US ISM Manufacturing PMI</a></li>
                                                <li><a target="_blank" href="https://ycharts.com/indicators/us_ism_non_manufacturing_index">US ISM Services PMI</a></li>
                                                <li><a target="_blank" href="https://ycharts.com/indicators/us_initial_claims_for_unemployment_insurance">U.S. Initial Jobless Claims</a></li>
                                            </ul>
                                        </li>
                                        <li>Commodities: <a target="_blank" href="http://futures.tradingcharts.com/chart/CO/W">Weekly Light Crude Oil (Pit)</a>,
                                            <a target="_blank" href="https://www.bullionvault.com/gold-price-chart.do">Gold Price</a>,
                                            <a target="_blank" href="https://www.bullionvault.com/silver-price-chart.do">Silver Price</a>
                                        </li>
                                        <li>Write <a target="_blank" href="#/market/assessments">Market Assessments</a></li>
                                    </ol>
                                </li>
                                <li>Sector Analysis
                                    <ol>
                                        <li><a target="_blank" href="#/stocklist/spdrs">Sector SPDRs Slides</a>
                                            (<a target="_blank" href="http://www.sectorspdr.com/">Sector SPDRs Home</a>)
                                        </li>
                                    </ol>
                                </li>
                            </ul>
                        </Container>
                    </Card.Body>
                </Card>
            </Tab>
            <Tab eventKey="assessments" title="Market Assessments">
                <MarketJournals journalList={journalList} />
            </Tab>
        </Tabs>
    );
}

export default MarketHome;

export async function loader({ params }) {
    const response = await fetch('/rest/journal/special/-5');
    // console.log('MarketHome loader called');

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