import { Card, Container, Row, Col } from 'react-bootstrap';
import SimpleTable from '../UI/SimpleTable';
import { calcAccountCashPercent } from './AccountsSummary';
import styles from './Account.module.css';

const columns = [
    { title: 'Name', field: 'tickerName', type: 'string' },
    { title: 'Shares', field: 'number', type: 'number' },
    { title: 'Enter Price', field: 'enterPrice', type: 'number' },
    { title: 'Current Price', field: 'lastPrice', type: 'number' },
    { title: 'Change', field: 'change', type: 'number' },
    { title: 'Cost', field: 'cost', type: 'number' },
    { title: 'Value', field: 'value', type: 'number' },
    { title: 'Gain', field: 'gain', type: 'number' },
    { title: 'Gain Percent', field: 'gainPercent', type: 'number' },
    { title: 'Comment', field: 'comment', type: 'string' },
];

function AccountSummary(props) {
    const { account } = props;

    return (
        <>
            <Card className={styles.panel}>
                <Card.Header><Card.Title>Summary</Card.Title></Card.Header>
                <Card.Body>
                    <Container>
                        <Row>
                            <Col lg='2'><dl><dt>Account Name</dt><dd>{account.name}</dd></dl></Col>
                            <Col lg='2'><dl><dt>Original Cash</dt><dd>{account.originalCashAmount.toFixed(2)}</dd></dl></Col>
                            <Col lg='2'><dl><dt>Value</dt><dd>{account.totalAmount.toFixed(2)}</dd></dl></Col>
                            <Col lg='2'><dl><dt>Gain</dt><dd>{account.gain.toFixed(2)}</dd></dl></Col>
                            <Col lg='2'><dl><dt>Current Cash</dt><dd>{account.cashAmount.toFixed(2)}</dd></dl></Col>
                            <Col lg='2'><dl><dt>Cash Percentage</dt><dd>{calcAccountCashPercent(account)}%</dd></dl></Col>
                        </Row>
                    </Container>
                </Card.Body>
            </Card>
            <Card className={styles.panel}>
                <Card.Header><Card.Title>Holdings</Card.Title></Card.Header>
                <Card.Body>
                        <SimpleTable data={account.holdingList} columns={columns} keyField='tickerId' />
                </Card.Body>
            </Card>
        </>
    );
}

export default AccountSummary;