import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import styles from './Ticker.module.css';

function TickerEdit(props) {
  const navigate = useNavigate();

  const { tickerInfo, tickers, onCancelClicked, onDeleteClicked, onAddClicked } = props;
  const [tickerName, setTickerName] = useState(tickerInfo ? tickerInfo.name : '');
  const [type, setType] = useState(tickerInfo ? tickerInfo.type.toLowerCase() : '');
  const [sector, setSector] = useState(tickerInfo ? tickerInfo.sector : '');
  const [industry, setIndustry] = useState(tickerInfo ? tickerInfo.industry : '');
  const [description, setDescription] = useState(tickerInfo ? tickerInfo.tickerDescription : '');
  const [exchangeCode, setExchangeCode] = useState(tickerInfo ? tickerInfo.exchangeCode : '');

  console.log(tickerName);

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log('handleSubmit called');
    if (!tickerInfo && tickers && tickers.includes(tickerName.toUpperCase())) {
      alert(tickerName.toUpperCase() + ' already exists.');
      return;
    }
    fetch('/rest/tinfo/update', {
      method: tickerInfo ? 'PUT' : 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: tickerInfo ? Number(tickerInfo._id) : null,
        name: tickerName.toUpperCase(),
        type: type,
        sector: sector,
        industry: industry,
        tickerDescription: description,
        exchangeCode: exchangeCode,
      }),
    })
      .then((response) => {
        if (tickerInfo) {
          tickerInfo.type = type;
          tickerInfo.sector = sector;
          tickerInfo.industry = industry;
          tickerInfo.tickerDescription = description;
          tickerInfo.exchangeCode = exchangeCode;
          onCancelClicked();
        } else {
          onAddClicked();
          navigate('/ticker/' + tickerName.toUpperCase());
        }
      })
      .catch((err) => {
        console.error(err);
        alert('Edit ticker failed.');
      });
  };

  const handleDeleteClicked = () => {
    if (tickerInfo.activityList && tickerInfo.activityList.length > 0) {
      alert('Cannot delete a ticker with activities.');
      return;
    }
    fetch('/rest/tinfo/' + tickerInfo._id, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        onDeleteClicked();
        navigate('/ticker');
      })
      .catch((err) => {
        console.error(err);
        alert('Delete ticker failed.');
      });
  };

  return (
    <div className={styles.container}>
      <Form className={styles.form} onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="tickerName">
          <Form.Label>Ticker</Form.Label>
          <Form.Control
            type="text"
            value={tickerName}
            onChange={(e) => setTickerName(e.target.value)}
            disabled={tickerInfo ? true : false}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="tickerType">
          <Form.Label>Type</Form.Label>
          <Form.Select aria-label="ticker type" value={type} onChange={(e) => setType(e.target.value)}>
            <option value=""></option>
            <option value="ETF">ETF</option>
            <option value="Fixed">Fixed</option>
            <option value="Fund">Fund</option>
            <option value="Index">Index</option>
            <option value="stock">Stock</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="tickerSector">
          <Form.Label>Sector</Form.Label>
          <Form.Control type="text" value={sector} onChange={(e) => setSector(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="tickerIndustry">
          <Form.Label>Industry</Form.Label>
          <Form.Control type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="tickerDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="tickerExchangeCode">
          <Form.Label>Exchange Code</Form.Label>
          <Form.Control type="text" value={exchangeCode} onChange={(e) => setExchangeCode(e.target.value)} />
        </Form.Group>

        <Container>
          <Row>
            <Col>
              <Button variant="primary" type="submit">
                {tickerInfo ? 'Update' : 'Create'}
              </Button>
            </Col>
            <Col>
              <Button variant="primary" onClick={onCancelClicked}>
                Cancel
              </Button>
            </Col>
            {tickerInfo && (
              <Col>
                <Button
                  variant="primary"
                  onClick={handleDeleteClicked}
                  disabled={!tickerInfo.activityList || tickerInfo.activityList.length > 0}
                >
                  Delete
                </Button>
              </Col>
            )}
          </Row>
        </Container>
      </Form>
    </div>
  );
}
export default TickerEdit;
