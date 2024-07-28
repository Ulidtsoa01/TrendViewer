import { useEffect, useState } from 'react';
import { useRevalidator, Link } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Navbar, Form } from 'react-bootstrap';
import { toDateWithSeconds } from '../misc/Utils';
import SimpleTable from '../UI/SimpleTable';
import styles from './Ticker.module.css';

const columns = [
  { title: 'Date', field: 'date', type: 'date' },
  { title: 'High', field: 'high', type: 'number' },
  { title: 'Low', field: 'low', type: 'number' },
  { title: 'Open', field: 'open', type: 'number' },
  { title: 'Close', field: 'close', type: 'number' },
  { title: 'Adj. Close', field: 'adjclose', type: 'number' },
  { title: 'Volume', field: 'volume', type: 'number', formatter: (r, v) => v.toLocaleString() },
];

function TickerQuotes(props) {
  const { tickerInfo } = props;
  const revalidator = useRevalidator();
  const [quotes, setQuotes] = useState(null);
  const dQuote = tickerInfo.dQuote;

  useEffect(() => {
    // console.log('loading historical quotes for ' + tickerInfo.tickerName + '...');
    fetch('/rest/hquote/daily/' + tickerInfo._id)
      .then((response) => {
        if (response.ok) {
          response.json().then((resData) => {
            // console.log(resData);
            setQuotes(resData);
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [tickerInfo]);

  const handleDownload = () => {
    console.log('handleDownload called');
    fetch('/rest/action/download/' + tickerInfo.name, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        // console.log(response);
        if (response.ok) {
          revalidator.revalidate();
        } else {
          alert('Download quotes failed.');
        }
      })
      .catch((err) => {
        console.error(err);
        alert(err);
      });
  };

  const handleDeleteQuotes = () => {
    // console.log('handleDeleteQuotes called');
    const confirmed = window.confirm('Are you sure that you want to delete all quotes for ' + tickerInfo.name + '?');
    if (!confirmed) return;
    fetch('/rest/action/deletequotes/' + tickerInfo._id, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        // console.log(response);
        if (response.ok) {
          setQuotes(null);
        } else {
          alert('Delete quotes failed.');
        }
      })
      .catch((err) => {
        console.error(err);
        alert(err);
      });
  };

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Brand as={Link} to="#">
            {tickerInfo.tickerName}
          </Navbar.Brand>
          <Navbar.Collapse id="navbarTickerQuotes">
            <Button variant="primary" className={styles.toolbarButton} onClick={handleDownload}>
              Download
            </Button>
            <Button variant="primary" onClick={handleDeleteQuotes} disabled={!quotes || quotes.length === 0}>
              Delete Quotes
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Card className={styles.panel}>
        <Card.Header>
          <Card.Title>Latest Quote</Card.Title>
        </Card.Header>
        {dQuote && (
          <Card.Body>
            <Container>
              <Row>
                <Col lg="3">
                  <dl>
                    <dt>Ticker Name</dt>
                    <dd>{dQuote.tickerName}</dd>
                  </dl>
                </Col>
                <Col lg="3">
                  <dl>
                    <dt>Date</dt>
                    <dd>{toDateWithSeconds(dQuote.date)}</dd>
                  </dl>
                </Col>
                <Col lg="3">
                  <dl>
                    <dt>Open Price</dt>
                    <dd>{dQuote.open}</dd>
                  </dl>
                </Col>
                <Col lg="3">
                  <dl>
                    <dt>Last Price</dt>
                    <dd>{dQuote.last}</dd>
                  </dl>
                </Col>
              </Row>
              <Row>
                <Col lg="3">
                  <dl>
                    <dt>High Price</dt>
                    <dd>{dQuote.high}</dd>
                  </dl>
                </Col>
                <Col lg="3">
                  <dl>
                    <dt>Low Price</dt>
                    <dd>{dQuote.low}</dd>
                  </dl>
                </Col>
                <Col lg="3">
                  <dl>
                    <dt>Volume</dt>
                    <dd>{dQuote.volume ? dQuote.volume.toLocaleString() : ''}</dd>
                  </dl>
                </Col>
              </Row>
            </Container>
          </Card.Body>
        )}
      </Card>
      <Card className={styles.panel}>
        <Card.Header>
          <Card.Title>Historical Quotes</Card.Title>
        </Card.Header>
        <Card.Body>
          <SimpleTable data={quotes} columns={columns} keyField="date" />
        </Card.Body>
      </Card>
    </>
  );
}

export default TickerQuotes;
