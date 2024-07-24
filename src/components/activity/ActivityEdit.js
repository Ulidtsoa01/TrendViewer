import { useState } from 'react';
import { useParams, useNavigate, useRevalidator, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import Select from 'react-select';

import styles from './ActivityEdit.module.css';
import { getAccountName, fillTickerOptions } from '../misc/Utils';

function ActivityEdit(props) {
    const { state } = useLocation();
    const navigate = useNavigate();
    let revalidator = useRevalidator();
    let { accountId } = useParams();
    let accounts = useSelector((state) => state.accounts);
    const accountName = getAccountName(accountId, accounts);
    const tickers = useSelector((state) => state.tickers);
    const dispatch = useDispatch();
    // console.log('ActivityEdit called with accountId=' + accountId);
    // console.log(state);
    // const [lastUsedDate, setLastUsedDate] = useState(new Date());
    const oldDate = state ? new Date(state.date) : new Date();
    const [date, setDate] = useState(oldDate.toISOString().split('T')[0]);
    const [type, setType] = useState(state ? state.type : '');
    const [ticker, setTicker] = useState(state ? state.tickerName : '');
    const [price, setPrice] = useState(state ? state.price : 0);
    const [shares, setShares] = useState(state ? state.shares : 0);
    const [tradeCost, setTradeCost] = useState(state ? state.tradeCost : 0);
    const [amount, setAmount] = useState(state ? state.amount : null);
    // const [from, setFrom] = useState(state ? state.shares : 1);
    // const [to, setTo] = useState(state ? state.amount : 1);
    const [comment, setComment] = useState(state ? state.comment : '');

    let options = [];
    fillTickerOptions(tickers, options, dispatch);
    const selectStyles = {
        container: base => ({
          ...base,
          maxWidth: 200,
          marginRight: 10,
          flex: 1
        })
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log('handleSubmit called');
        // let dateObj = Date.parse(date);
        // setLastUsedDate(new Date(date));
        let url = "/rest/activity";
        fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountId: Number(accountId),
                type: type,
                date: date,
                tickerName: ticker,
                price: Number(price),
                shares: Number(shares),
                tradeCost: Number(tradeCost),
                amount: Number(amount),
                comment: comment,
                id: state ? state.id : 0
            })
        }).then((response) => {
            // console.log('activity created successfully');
            // console.log(response);
            revalidator.revalidate();
            navigate('/activities/' + accountId, { replace: true });
        }).catch((err) => {
            console.error(err);
        });
    };

    const handleCancel = () => {
        navigate('/activities/' + accountId);
    };

    const handleDelete = () => {
        let url = "/rest/activity/" + state.id;
        fetch(url, {
            method: "DELETE",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            // console.log('activity deleted successfully');
            // console.log(response);
            revalidator.revalidate();
            navigate('/activities/' + accountId, { replace: true });
        }).catch((err) => {
            console.error(err);
        });
    };

    return (
        <div className={styles.container}>
            <h1>{accountName}</h1>

            <Form className={styles.form} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="ActivityEdit.Date">
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="ActivityEdit.Type">
                    <Form.Label>Type</Form.Label>
                    <Form.Select aria-label="Type" value={type} onChange={(e) => setType(e.target.value)} disabled={state ? true : false} >
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

                {(type === 'Buy' || type === 'Sell' || type === 'Dividend' || type === 'Expense' || type === 'Gain' || type === 'Split') &&
                    <Form.Group className="mb-3" controlId="ActivityEdit.Ticker">
                        <Form.Label>Ticker</Form.Label>
                        {/*<Form.Control type="text" value={ticker} onChange={(e) => setTicker(e.target.value)} />*/}
                        <Select options={options} styles={selectStyles} onChange={(v) => setTicker(v['value'])} defaultValue={{ label: ticker, value: ticker }} />
                    </Form.Group>
                }

                {(type === 'Buy' || type === 'Sell') &&
                    <Form.Group className="mb-3" controlId="ActivityEdit.Price">
                        <Form.Label>Price</Form.Label>
                        <Form.Control type="number" step="0.0001" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </Form.Group>
                }

                {(type === 'Buy' || type === 'Sell') &&
                    <Form.Group className="mb-3" controlId="ActivityEdit.Shares">
                        <Form.Label>Shares</Form.Label>
                        <Form.Control type="number" step="0.001" value={shares} onChange={(e) => setShares(e.target.value)} />
                    </Form.Group>
                }

                {(type === 'Buy' || type === 'Sell') &&
                    <Form.Group className="mb-3" controlId="ActivityEdit.TradeCost">
                        <Form.Label>Trade Cost</Form.Label>
                        <Form.Control type="number" step="0.01" value={tradeCost} onChange={(e) => setTradeCost(e.target.value)} />
                    </Form.Group>
                }

                {(type !== '' && type !== 'Split') &&
                    <Form.Group className="mb-3" controlId="ActivityEdit.Amount">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </Form.Group>
                }

                {type === 'Split' &&
                    <Form.Group className="mb-3" controlId="ActivityEdit.Ratio">
                        <Form.Label>Ratio</Form.Label>
                        <div>
                            <input className={styles.ratioLine} type="number" step="0.01" value={shares} onChange={(e) => setShares(e.target.value)}></input>
                            <span className={styles.arrow}>&#8594;</span>
                            <input className={styles.ratioLine} type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}></input>
                        </div>
                    </Form.Group>
                }

                {(type !== '') &&
                    <Form.Group className="mb-3" controlId="ActivityEdit.Comment">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control as="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
                    </Form.Group>
                }

                <Container>
                    <Row>
                        <Col><Button variant="primary" type="submit">{state ? 'Update' : 'Create'}</Button></Col>
                        <Col><Button variant="primary" onClick={handleCancel}>Cancel</Button></Col>
                        {state &&
                            <Col><Button variant='primary' className={styles.deleteButton} onClick={handleDelete}>Delete</Button></Col>
                        }
                    </Row>
                </Container>
            </Form>
        </div>
    );
}

export default ActivityEdit;
