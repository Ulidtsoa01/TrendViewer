import { useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import styles from './Market.module.css';

function MarketJournalEdit(props) {
    const revalidator = useRevalidator();
    const { journal, toGeneralMode } = props;
    const [name, setName] = useState(journal ? journal.name : '');
    const oldDate = journal ? new Date(journal.date) : new Date();
    const [date, setDate] = useState(oldDate.toISOString().split('T')[0]);
    const [url, setUrl] = useState(journal ? journal.url : '');
    const [urlTitle, setUrlTitle] = useState(journal ? journal.urlTitle : '');
    const [value, setValue] = useState(journal ? journal.value : '');

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log('handleSubmit called');
        fetch('/rest/journal/normal', {
            method: journal ? 'PUT' : 'POST',
            mode: "cors",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: journal ? Number(journal.id) : null,
                tickerId: -5,
                name: name,
                date: date,
                url: url,
                urlTitle: urlTitle,
                value: value
            })
        }).then((response) => {
            // console.log('handleSubmit response');
            console.log(response);
            if (journal) {
                journal.name = name;
                journal.date = date;
                journal.url = url;
                journal.urlTitle = urlTitle;
                journal.value = value;
                toGeneralMode(journal);
            } else {
                revalidator.revalidate();
                toGeneralMode(journal);
            }
        }).catch((err) => {
            console.error(err);
            alert('Edit journal failed.');
        });
    };

    const handleDeleteClicked = () => {
        // console.log('handleDeleteClicked called');
        if (journal) {
            fetch('/rest/journal/normal/' + journal.id, {
                method: 'DELETE',
                mode: "cors",
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then((response) => {
                // console.log('handleDeleteClicked response');
                // console.log(response);
                revalidator.revalidate();
                toGeneralMode();
            }).catch((err) => {
                console.error(err);
                alert('Delete journal failed.');
            });
        }
    };

    return (
        <div className={styles.container}>
            <Form className={styles.form} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="ActivityEdit.Date">
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="tickerSector">
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="tickerSector">
                    <Form.Label>URL Name</Form.Label>
                    <Form.Control type="text" value={urlTitle} onChange={(e) => setUrlTitle(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="tickerIndustry">
                    <Form.Label>URL</Form.Label>
                    <Form.Control type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="ActivityEdit.Comment">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control as="textarea" rows={10} value={value} onChange={(e) => setValue(e.target.value)} />
                </Form.Group>

                <Container>
                    <Row>
                        <Col><Button variant="primary" type="submit">{journal ? 'Update' : 'Create'}</Button></Col>
                        <Col><Button variant="primary" onClick={toGeneralMode}>Cancel</Button></Col>
                        {journal &&
                            <Col><Button variant="primary" onClick={handleDeleteClicked}>Delete</Button></Col>
                        }
                    </Row>
                </Container>
            </Form>
        </div>
    );
}

export default MarketJournalEdit;