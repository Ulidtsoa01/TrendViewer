import { useState, useEffect } from 'react';
import { Container, Navbar } from 'react-bootstrap';
import SimpleTable from '../UI/SimpleTable';

const columns = [
  { title: 'Date', field: 'date', type: 'date' },
  { title: 'Cash', field: 'cash', type: 'number', format: 'locale' },
  { title: 'Value', field: 'value', type: 'number', format: 'locale' },
  { title: 'Comment', field: 'comment', type: 'string' },
];

function ValueHistory(props) {
  const { account } = props;
  const [values, setValues] = useState([]);

  useEffect(() => {
    fetch('/rest/accountvalue/' + account._id)
      .then((response) => {
        // console.log(response);
        if (response.ok) {
          response.json().then((items) => {
            // console.log("Account values loaded.");
            console.log(items);
            setValues(items);
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, [account]);

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Brand>{account.name} Values</Navbar.Brand>
        </Container>
      </Navbar>
      <SimpleTable data={values} columns={columns} keyField="date" />
    </>
  );
}

export default ValueHistory;
