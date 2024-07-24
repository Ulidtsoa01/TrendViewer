import { Link } from 'react-router-dom';
import { Accordion } from 'react-bootstrap';
import HomeAction from './HomeAction';
import styles from './Home.module.css';

function HomePage() {

  return (
    <>
      <HomeAction />
      <Accordion defaultActiveKey="1" className={styles.accordion}>
        <Accordion.Item eventKey="0">
          <Accordion.Header><b>Daily</b></Accordion.Header>
          <Accordion.Body>
            <ol>
              <li>Go into <Link to="/holdings">Holdings</Link>, hit "Update". Check if any Sell Stop broken.</li>
              <li>Check <Link to="/hot">Hot List</Link>, hit "Update". Check if any Buy Limit reached.</li>
              <li>Read <Link to="/account">Account</Link>.</li>
              <li><a target="_blank" href="http://stockcharts.com/freecharts/marketsummary.html">Intraday Market Summary from StockCharts.com</a></li>
              <li>Head to <a href="https://seekingalpha.com/" target="_blank">Seeking Alpha</a> for Home page, Holding, Core and Hot portfolios.</li>
              <li>Write <Link to="/journal">Journal</Link> if any.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header><b>Weekly</b></Accordion.Header>
          <Accordion.Body>
            <ol>
              <li>Hit Download All button up top.</li>
              <li>Study <Link to="/account">Account</Link> including Monthly and Annual reports.</li>
              <li>Review most recent McClellan report.</li>
              <li>Do <Link to="/market">market analysis</Link>.</li>
              <li>Study <Link to="/holdings">Holdings</Link> in both Trend and <a href="https://seekingalpha.com/account/portfolio/summary?portfolioId=61730272" target="_blank">Seeking Alpha</a>.</li>
              <li>Check <Link to="/hot">Hot List</Link> in both Trend and <a href="https://seekingalpha.com/account/portfolio/summary?portfolioId=61686749" target="_blank">Seeking Alpha</a>.</li>
              <li>Check <a href="https://seekingalpha.com/screeners/96793299-Top-Rated-Stocks?source=top_stocks%3Aexpanded%3Anavbar_left" target="_blank">Top Stocks</a> from Seeking Alpha.</li>
              <li>Go through all sections in <b>Watch</b> for climax signals. </li>
              <ul>
                <li>When time permit, do my my slide.</li>
                <li>With good climax signal and right market direction, add it to hot and study it in <a href="https://seekingalpha.com/" target="_blank">Seeking Alpha</a>.</li>
                <li>If bought, set sell stop and be alert.</li>
              </ul>
              <li>Write <Link to="/journal">Journal</Link> if any.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header><b>Monthly on first Saturday of the month</b></Accordion.Header>
          <Accordion.Body>
            <ol>
              <li>Hit Download All button up top.</li>
              <li>Review spending with Yan in <a href="https://app.simplifimoney.com/" target="_blank">Quicken Simplifi</a>.</li>
              <li>Update Trend from Fidelity with interests and dividends (or any remaining trades).</li>
              <li>Hit Update Account Values button up top.</li>
              <li>Study Monthly and Annual reports in <Link to="/account">Account</Link></li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header><b>Strategy</b></Accordion.Header>
          <Accordion.Body>
            <ul>
              <li>Index
                <ol>
                  <li>Put a big portion (30%?) of my asset into ETF: SPY, IXUS, VTI</li>
                  <li>Reduce when market is high and increase when it is low</li>
                  <li>Study their reports and try to pick better ones</li>
                </ol>
              </li>
              <li>Fundamental
                <ol>
                  <li>Use the Core portfolia for stocks I hold long term</li>
                  <li>Keep up with their financials and earning reports</li>
                  <li>Reduce when going up and increase when it goes down</li>
                  <li>The high limit should be 60k and the low limit should be 10k</li>
                </ol>
              </li>
              <li>Market Timing
                <ol>
                  <li>Use McClellan Report for direction, to decide whether it is bull, bear or side way.</li>
                  <li>Use Seeking Alpha to monitor portfolios and research individual stocks.</li>
                  <li>Use Trend for my trading record and climax signals.</li>
                </ol>
              </li>
              <li>In general
                <ul>
                  <li>In Bull Market
                    <ol>
                      <li>Try to get 90% invested. Use SPY if picking stocks are difficult.</li>
                      <li>Use bottom climax signal.</li>
                    </ol>
                  </li>
                  <li>In Bear or Side way Market
                    <ol>
                      <li>Hold 50% in index fund. Avoid holding individual stocks except utilities.</li>
                      <li>Focus on solid stocks that are unfairly beaten down too low.</li>
                    </ol>
                  </li>
                  <li>Climax Signal in bull market or rally time
                    <ol>
                      <li>CLX indicator by Joe Granville measures the difference between SMAx and SMA200. When SMA2-SMA200 reaches a bottom, it's CLX2 buy signal. When it reaches a top, it's sell signal.</li>
                      <li>Read climax signal for all stock under watch twice a week, ideally weekend and Wednesday.</li>
                      <li>Buy after climax 2 and 5 are out, and it breaks out the base.</li>
                      <li>When small bottom climax is out, it means that the down trend has slowed down, and it might be forming a base.
                        For a fundamentally sound stock being beaten down, it is time to watch closely, hoping it will break out the base soon.
                        Once it breaks out the base, it can often start a long up trend.</li>
                      <li>When a top climax is out, it means that the up trend is slowing down. Time to watch close and tighten the sell stop.</li>
                    </ol>
                  </li>
                  <li>Define Core Stocks
                    <ol>
                      <li>Company that is doing well and with potential.</li>
                      <li>No scandals (like CMG).</li>
                      <li>Business that I understand well and keeps up with earning report.</li>
                      <li>High ratings per Seeking Alpha.</li>
                    </ol>
                  </li>
                </ul>
              </li>
            </ul>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="4">
          <Accordion.Header><b>Goal</b></Accordion.Header>
          <Accordion.Body>
            <ol>
              <li>Beat SPY</li>
              <li>Don't lose money. That means cutting losses fast and not holding hopeless stocks for too long.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="5">
          <Accordion.Header><b>Lessons</b></Accordion.Header>
          <Accordion.Body>
            <ol>
              <li>Sold 360k stocks in November 2021 before the top as predicted by Tom McClellan, which is good.
                But I should have set sell stops for all remaining holdings, and get rid of stocks as they went down in 2022.
                And I should not have bought in blindly following Motley Fool suggestions.
              </li>
              <li>Early 2016, when precious metal stocks turn up, did not catch on soon enough.</li>
              <li>2015-10, after 200 Day SMA crossed down under 50 Day SMA for most indexes, did not tighten up sell stop and be cautious when buying.</li>
              <li>Starting 2012, held precious metal stocks way too long after they started going down.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

export default HomePage;
