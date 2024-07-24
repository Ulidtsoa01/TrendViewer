import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import styles from "./SortedTable.module.css"

function SimpleTable(props) {
    const { data, columns, keyField, preSlide } = props;

    const formatDate = (d) => {
        let dd = new Date(d);
        return dd.toISOString().split('T')[0];
    };

    return (
        <>
            <Table striped bordered hover className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col) => {
                            return (
                                <th key={col.field}>{col.title}</th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data && data.map((row) => (
                        <tr key={row[keyField]} id={row[keyField]} >
                            {columns.map((col) => {
                                if (col.formatter) {
                                    return (<td key={col.field}>{col.formatter(row, row[col.field])}</td>)
                                } else if (col.url && col.url(row)) {
                                    return (<td key={col.field}><Link to={col.url(row, preSlide)}>{row[col.field]}</Link></td>)
                                } else if (col.type === 'date') {
                                    return (<td key={col.field}>{formatDate(row[col.field])}</td>)
                                } else if (col.type === 'number') {
                                    if (typeof row[col.field] !== 'number') {
                                        return <td key={col.field}>{row[col.field]}</td>;
                                    } else if (col.format === 'locale') {
                                        return <td key={col.field}>{row[col.field].toLocaleString()}</td>;
                                    } else {
                                        return (<td key={col.field}>{row[col.field].toFixed(2)}</td>)
                                    }
                                } else {
                                    return (<td key={col.field}>{row[col.field]}</td>)
                                }
                            })}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </>
    );
};

export default SimpleTable;
