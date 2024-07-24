import { useState } from 'react';
import { Card, Container, Row, Navbar, Form, Button } from 'react-bootstrap';
import styles from './Home.module.css';

function HomeAction() {
    const [message, setMessage] = useState(' ');

    const postCall = (url, action, successMsg) => {
        // console.log('handleCheckQuotes called');
        fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json'
            },
        }).then((response) => {
            if (response.ok) {
                // console.log('response comes back okay');
                if (successMsg) {
                    setMessage(successMsg);
                } else {
                    response.json().then(resData => {
                        console.log(resData);
                        if (resData && resData.message)
                            setMessage(resData.message);
                    });
                }
            } else {
                setMessage('Response is back but not okay.');
            }
        }).catch((err) => {
            console.error(err);
            setMessage(action + ' failed.');
        });
    };

    const handleUpdateAccountValues = () => postCall('/rest/action/updateaccountvalues', 'Updating account values', 'Updating account values completed');

    const handleExportJSON = () => postCall('/rest/action/exportjson', 'Exporting JSON', 'Exporting JSON completed');

    return (
        <Card className={styles.panel}>
            <Card.Header><Card.Title>Action</Card.Title></Card.Header>
            <Card.Body>
                <Container>
                    <Row>
                        <Navbar expand="lg" className="bg-body-tertiary">
                            <Container fluid>
                                <Navbar.Collapse id="navbarHomeAction">
                                    <Form className="d-flex">
                                        <Button className={styles.toolbarButton} variant="primary" onClick={handleUpdateAccountValues}>Update Account Values</Button>
                                        <Button className={styles.toolbarButton} variant="primary" onClick={handleExportJSON}>Export JSON</Button>
                                    </Form>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                    </Row>
                    <Row>
                        <span>{message}</span>
                    </Row>
                </Container>
            </Card.Body>
        </Card>
    );
}

export default HomeAction;