import { useState, useEffect } from "react";
import { Container, Navbar } from 'react-bootstrap';
import SimpleTable from '../UI/SimpleTable';

const columns = [
    { title: 'Date', field: 'date', type: 'date' },
    { title: 'Deposit', field: 'deposit', type: 'number' },
    { title: 'Withdraw', field: 'withdraw', type: 'number' },
    { title: 'Cash', field: 'cash', type: 'number' },
    { title: 'Value', field: 'value', type: 'number' },
    { title: 'Gain', field: 'gain', type: 'number' },
    { title: 'Gain Percent', field: 'gainPercent', type: 'number' },
    { title: 'SPY Percent', field: 'referenceGainPercent', type: 'number' },
];

function AccountReport(props) {
    const { account, period } = props;
    const [reportItems, setReportItems] = useState([]);

    useEffect(() => {
        const url = '/rest/accountreport/' + period.toLowerCase() + '/' + (account ? account.id : 'all');
        fetch(url).then((response) => {
            // console.log(response);
            if (response.ok) {
                response.json().then((items) => {
                    // console.log("Account report items loaded.");
                    // console.log(items);
                    setReportItems(items);
                });
            }
        }).catch((err) => {
            console.error(err);
        });
    }, [account, period]);

    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container fluid>
                    <Navbar.Brand>{(account ? account.name : 'All Accounts') + ' ' + period}</Navbar.Brand>
                </Container>
            </Navbar>
            <SimpleTable data={reportItems} columns={columns} keyField='date' />
        </>
    );
}

export default AccountReport;