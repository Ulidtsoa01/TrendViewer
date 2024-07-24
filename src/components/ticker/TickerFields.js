import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import styles from './Ticker.module.css';

function TickerFields(props) {
    const { tickerInfo, onEditTickerClicked, onModifySettingClicked } = props;

    return (
        <>
            <Card className={styles.panel}>
                <Card.Header><Card.Title>Summary</Card.Title></Card.Header>
                <Card.Body>
                    <Container>
                        <Row>
                            <Col lg='3'><dl><dt>Name</dt><dd>{tickerInfo.tickerName}</dd></dl></Col>
                            <Col lg='3'><dl><dt>Type</dt><dd>{tickerInfo.type}</dd></dl></Col>
                            <Col lg='3'><dl><dt>Id</dt><dd>{tickerInfo.tickerId}</dd></dl></Col>
                            <Col lg='3'><dl><dt>Description</dt><dd>{tickerInfo.tickerDescription}</dd></dl></Col>
                        </Row>
                        <Row>
                            <Col lg='3'><dl><dt>Sector</dt><dd>{tickerInfo.sector}</dd></dl></Col>
                            <Col lg='3'><dl><dt>Industry</dt><dd>{tickerInfo.industry}</dd></dl></Col>
                            <Col lg='3'><dl><dt>BC Symbol</dt><dd>{tickerInfo.bcSymbol}</dd></dl></Col>
                            <Col lg='3'><dl><dt>BC Industry</dt><dd>{tickerInfo.bcIndustry}</dd></dl></Col>
                        </Row>
                        <Row>
                            <Col lg='3'><a href={'https://seekingalpha.com/symbol/' + tickerInfo.tickerName} target="_blank">Seeking Alpha</a></Col>
                            <Col lg='3'><a href={'http://bigcharts.marketwatch.com/quickchart/quickchart.asp?symb=' + tickerInfo.tickerName} target="_blank">Big Chart</a></Col>
                            <Col lg='3'><a href={'http://finance.yahoo.com/q?s=' + tickerInfo.tickerName} target="_blank">Yahoo Finance</a></Col>
                            <Col lg='3'><a href={'http://bigcharts.marketwatch.com/industry/bigcharts-com/stockchart.asp?timeframe=ThreeMonth&compidx=SP500&symb=' + tickerInfo.tickerName} target="_blank">Big Chart Industry</a></Col>
                        </Row>
                        <Row className={styles.buttonRow}>
                            <Col lg='3'><Button variant="primary" onClick={onEditTickerClicked}>Edit Ticker</Button></Col>
                        </Row>
                    </Container>
                </Card.Body>
            </Card>
            <Card className={styles.panel}>
                <Card.Header><Card.Title>Settings</Card.Title></Card.Header>
                <Card.Body>
                    <Container>
                        <Row>
                            <Col lg='3'><dl><dt>Sell Limit</dt><dd>{tickerInfo.sellLimit}</dd></dl></Col>
                            <Col lg='3'><dl><dt>Sell Stop</dt><dd>{tickerInfo.sellStop}</dd></dl></Col>
                            <Col lg='3'><dl><dt>Buy Limit</dt><dd>{tickerInfo.buyLimit}</dd></dl></Col>
                            <Col lg='3'><dl><dt>Buy Stop</dt><dd>{tickerInfo.buyStop}</dd></dl></Col>
                        </Row>
                        <Row>
                            <Col lg='3'><dl><dt>Rating</dt><dd>{tickerInfo.rating}</dd></dl></Col>
                            <Col lg='3'><dl><dt>Class</dt><dd>{tickerInfo.tickerClass}</dd></dl></Col>
                            <Col lg='3'><dl><dt>Category</dt><dd>{tickerInfo.category}</dd></dl></Col>
                            <Col lg='3'><dl><dt>BC Industry</dt><dd>{tickerInfo.compareTo}</dd></dl></Col>
                        </Row>
                        <Row>
                            <Col lg='12'><dl><dt>Comment</dt><dd>{tickerInfo.comment}</dd></dl></Col>
                        </Row>
                        <Row>
                            <Col lg='3'><Button variant="primary" onClick={onModifySettingClicked}>Modify Settings</Button></Col>
                        </Row>
                    </Container>
                </Card.Body>
            </Card>
        </>
    );
}

export default TickerFields;