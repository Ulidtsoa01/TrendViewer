import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Navbar, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import { fillTickerOptions, removeTicker } from '../misc/Utils';
import TickerEdit from './TickerEdit';

function TickerHome() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const tickers = useSelector((state) => state.tickers);
    const [mode, setMode] = useState('home');

    let options = [];
    fillTickerOptions(tickers, options, dispatch);
    const selectStyles = {
        container: base => ({
            ...base,
            width: 200,
            marginRight: 10,
            flex: 1
        })
    };

    const handleTickerSelectChange = (tickerName) => {
        // console.log('handleTickerSelectChange called');
        navigate("/ticker/" + tickerName);
    };

    const handleAddTicker = () => {
        // console.log('handleAddTicker called');
        setMode('addticker');
    };

    const handleCancel = () => {
        setMode('home');
    }

    const afterAdding = (newTickerName) => {
        setMode('home');
        fillTickerOptions(null, [], dispatch); // to reload tickers to include the new ticker
        // TODO: get newTickerName into the Select ticker name
    };

    return (
        <>
            {mode === 'home' &&
                <Navbar expand="lg" className="bg-body-tertiary">
                    <Container fluid>
                        <Navbar.Brand as={Link} to="#">Ticker</Navbar.Brand>
                        <Navbar.Collapse id="navbarTickerGeneral">
                            <Form className="d-flex">
                                <Select options={options} styles={selectStyles} onChange={(v) => handleTickerSelectChange(v['value'])} />
                                <Button variant="primary" onClick={handleAddTicker}>Add Ticker</Button>
                            </Form>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            }
            {mode === 'addticker' && <TickerEdit onAddClicked={afterAdding} onCancelClicked={handleCancel} tickers={tickers} />}
        </>
    );
}

export default TickerHome;