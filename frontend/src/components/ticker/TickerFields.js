import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import styles from './Ticker.module.css';

function Cell({ label, value }) {
  return (
    <Col lg="3">
      <dl>
        <dt>{label}</dt>
        <dd>{value}</dd>
      </dl>
    </Col>
  );
}
function TickerFields(props) {
  const { tickerInfo, onEditTickerClicked, onModifySettingClicked } = props;

  return (
    <>
      <Card className={styles.panel}>
        <Card.Header>
          <Card.Title>Summary</Card.Title>
        </Card.Header>
        <Card.Body>
          <Container>
            <Row>
              <Cell label="Name" value={tickerInfo.name} />
              <Cell label="Type" value={tickerInfo.type} />
              <Cell label="Id" value={tickerInfo._id} />
              <Cell label="Description" value={tickerInfo.tickerDescription} />
              <Cell label="Sector" value={tickerInfo.sector} />
              <Cell label="Industry" value={tickerInfo.industry} />
            </Row>
            <Row>
              <Col lg="3">
                <a href={'https://seekingalpha.com/symbol/' + tickerInfo.name} target="_blank" rel="noreferrer">
                  Seeking Alpha
                </a>
              </Col>
              <Col lg="3">
                <a
                  href={'http://bigcharts.marketwatch.com/quickchart/quickchart.asp?symb=' + tickerInfo.name}
                  target="_blank"
                  rel="noreferrer"
                >
                  Big Chart
                </a>
              </Col>
              <Col lg="3">
                <a href={'http://finance.yahoo.com/q?s=' + tickerInfo.name} target="_blank" rel="noreferrer">
                  Yahoo Finance
                </a>
              </Col>
              <Col lg="3">
                <a
                  href={
                    'http://bigcharts.marketwatch.com/industry/bigcharts-com/stockchart.asp?timeframe=ThreeMonth&compidx=SP500&symb=' +
                    tickerInfo.name
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Big Chart Industry
                </a>
              </Col>
            </Row>
            <Row className={styles.buttonRow}>
              <Col lg="3">
                <Button variant="primary" onClick={onEditTickerClicked}>
                  Edit Ticker
                </Button>
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>
      <Card className={styles.panel}>
        <Card.Header>
          <Card.Title>Settings</Card.Title>
        </Card.Header>
        <Card.Body>
          <Container>
            {tickerInfo.settings && (
              <Row>
                <Cell label="Sell Limit" value={tickerInfo.settings.sellLimit} />
                <Cell label="Sell Stop" value={tickerInfo.settings.sellStop} />
                <Cell label="Buy Limit" value={tickerInfo.settings.buyLimit} />
                <Cell label="Buy Stop" value={tickerInfo.settings.buyStop} />
                <Cell label="Rating" value={tickerInfo.settings.rating} />
                <Cell label="Class" value={tickerInfo.settings.tickerClass} />
                <Cell label="Category" value={tickerInfo.settings.category} />
                <Cell label="BC Industry" value={tickerInfo.settings.bcIndustry} />
                <Cell label="Comment" value={tickerInfo.settings.comment} />
              </Row>
            )}
            <Row>
              <Col lg="3">
                <Button variant="primary" onClick={onModifySettingClicked}>
                  Modify Settings
                </Button>
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>
    </>
  );
}

export default TickerFields;
