import { useState, useRef, useEffect } from 'react';
import { Card, Container, Row, Navbar, Form, Button } from 'react-bootstrap';
import styles from './Home.module.css';

function HomeAction() {
  const [message, setMessage] = useState(' ');
  // const [fileUploadR, setFileUploadR] = useState('');
  // const [fileUploadQ, setFileUploadQ] = useState('');
  const inputRefR = useRef();
  const inputRefQ = useRef();

  const postCall = (url, action) => {
    // console.log('handleCheckQuotes called');
    fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          // console.log('response comes back okay');
          setMessage(action + ' completed');

          // } else {
          //   response.json().then((resData) => {
          //     console.log(resData);
          //     if (resData && resData.message) setMessage(resData.message);
          //   });
          // }
        } else {
          setMessage('Response is back but not okay.');
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage(action + ' failed.');
      });
  };

  const deleteCall = (url, action) => {
    fetch(url, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          // console.log('response comes back okay');
          setMessage(action + ' completed');
        } else {
          setMessage('Response is back but not okay.');
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage(action + ' failed.');
      });
  };
  const getCall = (url, filename, action) => {
    fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        if (action) setMessage(action + ' completed');
      })
      .catch((err) => {
        console.error(err);
        setMessage(action + ' failed.');
      });
  };

  const postFileCall = (url, data, action) => {
    fetch(url, {
      method: 'POST',
      mode: 'cors',
      // headers: {
      //   'Content-Type': 'multipart/form-data',
      // },
      body: data,
    })
      .then((response) => {
        if (response.ok) {
          setMessage(action + ' completed');
        } else {
          setMessage('Response is back but not okay.');
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage(action + ' failed.');
      });
  };

  const handleUpdateAccountValues = () => postCall('/rest/action/updateaccountvalues', 'Updating account values');
  const handleClearRecordData = () => deleteCall('/rest/clearrecorddata', 'Clearing Record Data');
  const handleClearQuoteData = () => deleteCall('/rest/clearquotedata', 'Clearing Quote Data');
  const handleExportRecordJSON = () => getCall('/rest/exportrecordjson', 'TrendViewer-Record.json', 'Exporting Record JSON');
  const handleExportQuoteJSON = () => getCall('/rest/exportquotejson', 'TrendViewer-Quote.json', 'Exporting Quote JSON');
  const handleImportRecordJSON = (e) => {
    const data = new FormData();
    data.append('file', inputRefR.current.files[0]);
    postFileCall('/rest/importrecordjson', data, 'Importing Record JSON');
  };
  const handleImportQuoteJSON = (e) => {
    const data = new FormData();
    data.append('file', inputRefQ.current.files[0]);
    postFileCall('/rest/importquotejson', data, 'Importing Quote JSON');
  };

  return (
    <Card className={styles.panel}>
      <Card.Header>
        <Card.Title>Action</Card.Title>
      </Card.Header>
      <Card.Body>
        <Container>
          <Row>
            <Navbar expand="lg" className="bg-body-tertiary">
              <Container fluid>
                <Navbar.Collapse id="navbarHomeAction">
                  <Form className="d-flex">
                    <Button className={styles.toolbarButton} variant="primary" onClick={handleExportRecordJSON}>
                      Export Record JSON
                    </Button>
                    <Button className={styles.toolbarButton} variant="primary" onClick={handleExportQuoteJSON}>
                      Export Quote JSON
                    </Button>
                    <div>
                      <Button className={styles.toolbarButton} variant="primary" onClick={() => inputRefR.current.click()}>
                        Import Record JSON
                      </Button>
                      <input onChange={handleImportRecordJSON} multiple={true} ref={inputRefR} type="file" hidden />
                    </div>
                    <div>
                      <Button className={styles.toolbarButton} variant="primary" onClick={() => inputRefQ.current.click()}>
                        Import Quote JSON
                      </Button>
                      <input onChange={handleImportQuoteJSON} multiple={true} ref={inputRefQ} type="file" hidden />
                    </div>
                    {/* {fileUpload} */}
                    {/* <Button className={styles.toolbarButton} variant="primary" onClick={handleClearRecordData}>
                      Clear Record Data
                    </Button> */}
                    <Button className={styles.toolbarButton} variant="primary" onClick={handleClearQuoteData}>
                      Clear Quote Data
                    </Button>
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
