import { useState, useEffect } from 'react';
import SortedTable from '../UI/SortedTable';

const formatter = (num) => {
  return (Math.round((num + Number.EPSILON) * 100) / 100).toLocaleString();
};

const percentFormatter = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100 + '%';
};

const columns = [
  { title: 'Ticker Name', field: 'tickerName', sortable: true, type: 'string', url: (row) => '/ticker/' + row.tickerName },
  { title: 'Cost', field: 'cost', type: 'number', sortable: true, formatter: formatter },
  { title: 'Sale', field: 'sale', type: 'number', sortable: true, formatter: formatter },
  { title: 'Holding', field: 'shares', type: 'number', sortable: true, formatter: formatter },
  { title: 'Gain', field: 'gain', type: 'number', sortable: true, formatter: formatter },
  { title: 'Gain Percent', field: 'gainPct', type: 'number', sortable: true, formatter: percentFormatter },
];

function ReportByStock() {
  const [reports, setReports] = useState([]);
  const [key, setKey] = useState(1);

  useEffect(() => {
    fetch('/rest/stockreport')
      .then((response) => {
        // console.log(response);
        if (response.ok) {
          response.json().then((items) => {
            console.log('Stocke report loaded.');
            console.log(items);
            setReports(items);
            setKey(key + 1);
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return <SortedTable key={key} title="Performance by Stock" data={reports} columns={columns} keyField="tickerId" />;
}

export default ReportByStock;
