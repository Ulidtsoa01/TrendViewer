import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Navbar, Form, Button } from 'react-bootstrap';
import SimpleTable from '../UI/SimpleTable';
import MarketJournalEdit from './MarketJournalEdit';

function MarketJournals(props) {
  const { journalList } = props;
  const [mode, setMode] = useState('general');
  const [clickedJournal, setClickedJournal] = useState(null);

  const handleAdd = () => {
    setMode('addjournal');
  };

  const handleRowClick = (e) => {
    console.log('handleRowClick called');
    console.log(e.target.id);
    const cj = journalList.find((j) => j._id === Number(e.target.id));
    if (cj) {
      setClickedJournal(cj);
      setMode('editjournal');
    }
    return false; // so that anchor will not procerss href
  };

  const toGeneralMode = (journal) => {
    if (journal) {
      const cj = journalList.find((j) => j._id === journal._id);
      if (cj) {
        cj.name = journal.name;
        cj.date = journal.date;
        cj.url = journal.url;
        cj.urlTitle = journal.urlTitle;
        cj.value = journal.value;
      }
    }
    setClickedJournal(null);
    setMode('general');
  };

  const columns = [
    {
      title: 'Date',
      field: 'date',
      type: 'date',
      formatter: (r, v) => (
        <a href="#" id={r._id} onClick={handleRowClick}>
          {new Date(v).toISOString().split('T')[0]}
        </a>
      ),
    },
    { title: 'Title', field: 'name', type: 'string' },
    { title: 'URL', field: 'urlTitle', type: 'string', formatter: (r, v) => <a href="{r.url}">{v}</a> },
    { title: 'Content', field: 'value', type: 'string', formatter: (r, v) => (v.length > 100 ? v.substring(0, 100) + ' ...' : v) },
  ];

  return (
    <>
      {mode === 'general' && (
        <Navbar expand="lg" className="bg-body-tertiary">
          <Container fluid>
            <Navbar.Brand as={Link} to="#">
              Market Assessment
            </Navbar.Brand>
            <Navbar.Collapse id="navbarMarketGeneral">
              <Form className="d-flex">
                <Button variant="primary" onClick={handleAdd}>
                  Add Assessment
                </Button>
              </Form>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
      {mode === 'general' && <SimpleTable data={journalList} columns={columns} keyField="id" onRowClick={handleRowClick} />}
      {mode === 'editjournal' && <MarketJournalEdit journal={clickedJournal} toGeneralMode={toGeneralMode} />}
      {mode === 'addjournal' && <MarketJournalEdit toGeneralMode={toGeneralMode} />}
    </>
  );
}

export default MarketJournals;
