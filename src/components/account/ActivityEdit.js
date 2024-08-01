import { useState } from 'react';
import { useNavigate, useRevalidator } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Card, Container, Row, Col, Button, Form } from 'react-bootstrap';
import Select from 'react-select';

import styles from './Account.module.css';
import { getAccountName, fillTickerOptions } from '../misc/Utils';

function ActivityEdit(props) {
  const { account, activity, onCancel } = props;
  const navigate = useNavigate();
  let revalidator = useRevalidator();
  const tickers = useSelector((state) => state.tickers);
  const dispatch = useDispatch();
  // console.log('ActivityEdit called with accountId=' + accountId);
  // console.log(state);
  // const [lastUsedDate, setLastUsedDate] = useState(new Date());
  const oldDate = activity ? new Date(activity.date) : new Date();
  const [date, setDate] = useState(oldDate.toISOString().split('T')[0]);
  const [type, setType] = useState(activity ? activity.type : '');
  const [ticker, setTicker] = useState(activity ? activity.tickerName : '');
  const [price, setPrice] = useState(activity ? activity.price : 0);
  const [shares, setShares] = useState(activity ? activity.shares : 0);
  const [tradeCost, setTradeCost] = useState(activity ? activity.tradeCost : 0);
  const [amount, setAmount] = useState(activity ? activity.amount : null);
  const [comment, setComment] = useState(activity ? activity.comment : '');

  let options = [];
  fillTickerOptions(tickers, options, dispatch);
  const selectStyles = {
    container: (base) => ({
      ...base,
      maxWidth: 200,
      marginRight: 10,
      flex: 1,
    }),
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log('handleSubmit called');
    // let dateObj = Date.parse(date);
    // setLastUsedDate(new Date(date));
    let url = '/rest/activity';
    fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        _id: activity ? activity.id : 0,
        accountId: account.id,
        tickerName: ticker,
        date: date,
        shares: Number(shares),
        amount: Number(amount),
        price: Number(price),
        tradeCost: Number(tradeCost),
        type: type,
        comment: comment,
      }),
    })
      .then((response) => {
        // console.log('activity created successfully');
        // console.log(response);
        revalidator.revalidate();
        //navigate('/activities/' + accountId, { replace: true });
        onCancel();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleDelete = () => {
    let url = '/rest/activity/' + activity.id;
    fetch(url, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        // console.log('activity deleted successfully');
        // console.log(response);
        revalidator.revalidate();
        onCancel();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Card className={styles.activityPanel}>
      <Card.Header>
        <Card.Title>Create Activity for {account.name}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Form className={styles.editActivityForm} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="ActivityEdit.Date">
            <Form.Label>Date</Form.Label>
            <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="ActivityEdit.Type">
            <Form.Label>Type</Form.Label>
            <Form.Select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} disabled={activity ? true : false}>
              <option value=""></option>
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
              <option value="Dividend">Dividend</option>
              <option value="Interest">Interest</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdraw">Withdraw</option>
              <option value="Expense">Expense</option>
              <option value="Gain">Gain</option>
              <option value="Split">Split</option>
            </Form.Select>
          </Form.Group>

          {(type === 'Buy' || type === 'Sell' || type === 'Dividend' || type === 'Expense' || type === 'Gain' || type === 'Split') && (
            <Form.Group className="mb-3" controlId="ActivityEdit.Ticker">
              <Form.Label>Ticker</Form.Label>
              {/*<Form.Control type="text" value={ticker} onChange={(e) => setTicker(e.target.value)} />*/}
              <Select options={options} styles={selectStyles} onChange={(v) => setTicker(v['value'])} defaultValue={{ label: ticker, value: ticker }} />
            </Form.Group>
          )}

          {(type === 'Buy' || type === 'Sell') && (
            <Form.Group className="mb-3" controlId="ActivityEdit.Price">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" step="0.0001" value={price} onChange={(e) => setPrice(e.target.value)} />
            </Form.Group>
          )}

          {(type === 'Buy' || type === 'Sell') && (
            <Form.Group className="mb-3" controlId="ActivityEdit.Shares">
              <Form.Label>Shares</Form.Label>
              <Form.Control type="number" step="0.001" value={shares} onChange={(e) => setShares(e.target.value)} />
            </Form.Group>
          )}

          {(type === 'Buy' || type === 'Sell') && (
            <Form.Group className="mb-3" controlId="ActivityEdit.TradeCost">
              <Form.Label>Trade Cost</Form.Label>
              <Form.Control type="number" step="0.01" value={tradeCost} onChange={(e) => setTradeCost(e.target.value)} />
            </Form.Group>
          )}

          {type !== '' && type !== 'Split' && (
            <Form.Group className="mb-3" controlId="ActivityEdit.Amount">
              <Form.Label>Amount</Form.Label>
              <Form.Control type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Form.Group>
          )}

          {type === 'Split' && (
            <Form.Group className="mb-3" controlId="ActivityEdit.Ratio">
              <Form.Label>Ratio</Form.Label>
              <div>
                <input className={styles.ratioLine} type="number" step="0.01" value={shares} onChange={(e) => setShares(e.target.value)}></input>
                <span className={styles.arrow}>&#8594;</span>
                <input className={styles.ratioLine} type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}></input>
              </div>
            </Form.Group>
          )}

          {type !== '' && (
            <Form.Group className="mb-3" controlId="ActivityEdit.Comment">
              <Form.Label>Comment</Form.Label>
              <Form.Control as="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
            </Form.Group>
          )}

          <Container>
            <Row>
              <Col>
                <Button variant="primary" type="submit">
                  {activity ? 'Update' : 'Create'}
                </Button>
              </Col>
              <Col>
                <Button variant="primary" onClick={onCancel}>
                  Cancel
                </Button>
              </Col>
              {activity && (
                <Col>
                  <Button variant="primary" className={styles.deleteButton} onClick={handleDelete}>
                    Delete
                  </Button>
                </Col>
              )}
            </Row>
          </Container>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ActivityEdit;
