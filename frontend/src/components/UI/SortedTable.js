import { useSelector, useDispatch } from 'react-redux';
import { useState } from "react";
import { Link, useRevalidator } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import styles from "./SortedTable.module.css"

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Select from 'react-select';
import { fillTickerOptions } from '../misc/Utils';

function SortedTable(props) {
    const tickers = useSelector((state) => state.tickers);
    const { title, data, columns, keyField, preSlide, addUrl, deleteUrl } = props;
    const [selectedId, setSelectedId] = useState(0);
    const [sortField, setSortField] = useState("");
    const [order, setOrder] = useState("asc");
    const [tableData, setTableData] = useState(data);
    const [tickerToAdd, setTickerToAdd] = useState("");
    const [rowCount, setRowCount] = useState(0);
    let revalidator = useRevalidator();
    const dispatch = useDispatch();

    // console.log("SortedTable called with selectedId=" + selectedId + ", tickerToAdd=" + tickerToAdd + ", rowCount=" + rowCount);
    // console.log(data);
    // console.log(tableData);
    // console.log("selectedId=" + selectedId);

    let options = [];
    fillTickerOptions(tickers, options, dispatch);
    const selectStyles = {
        container: base => ({
          ...base,
          maxWidth: 200,
          marginRight: 10,
          flex: 1
        })
    };

    // data has one more row than tableData after a new ticker is added
    if (data.length === rowCount && tableData.length < rowCount) {
        setTableData(data);
        console.log('refreshing...with tickerToAdd=' + tickerToAdd);
        setRowCount(0);        
        if (tickerToAdd.length > 0) {
            let row = data.find(r => r['tickerName'] === tickerToAdd.toUpperCase());
            if (row) {
                setSelectedId(row[keyField]);
                setTickerToAdd('');
            }
        }
    }

    const handlingSortingChange = (col) => {
        const sortOrder =
            col.field === sortField && order === "asc" ? "desc" : "asc";
        setSortField(col.field);
        setOrder(sortOrder);

        if (col.field) {
            if (col.type === 'string') {
                const sorted = [...tableData].sort((a, b) => {
                    let astr = a[col.field] ? a[col.field].toString() : "";
                    let bstr = b[col.field] ? b[col.field].toString() : "";
                    return (
                        astr.localeCompare(bstr, "en", {
                            numeric: true,
                        }) * (sortOrder === "asc" ? 1 : -1)
                    );
                });
                setTableData(sorted);
            } else {
                const sorted = [...tableData].sort((a, b) => 
                    ( a[col.field] > b[col.field] ? 1 : -1) * (sortOrder === "asc" ? 1 : -1)
                );
                setTableData(sorted);
            }
        }
    };
    
    const selectHandler = (event) => {
        let newId = Number(event.currentTarget.id);
        if (selectedId === newId) {
            setSelectedId(0);
        } else {
            setSelectedId(newId);
        }
        //console.log("selectHandler called with id=" + event.currentTarget.id);
    };

    const handleRemoveClick = () => {
        //console.log('handleRemoveClick called.');

        if (selectedId <= 0) {
            return;
        }

        const row = tableData.find(r => selectedId === r[keyField]);
        if (!row) {
            return;
        }

        let url = deleteUrl + row['tickerName']; 
        //console.log('deleteUrl is ' + url);
        fetch(url, {
          method: "POST",
          mode: "cors",
          headers: {
            'Content-Type': 'application/json'
          },
          //body: JSON.stringify(j)
        }).then((response) => {
          console.log(response);
          if (response.ok) {
            // refresh data
            let newData = tableData.filter(r => selectedId !== r[keyField]);
            setTableData(newData);
            setSelectedId(0);
            setTickerToAdd('');
          }
        }).catch((err) => {
          console.error(err);
        });    
    };

    const issueAddRequest = () => {
        let url = addUrl + tickerToAdd.toUpperCase(); 
        //console.log('deleteUrl is ' + url);
        fetch(url, {
          method: "POST",
          mode: "cors",
          headers: {
            'Content-Type': 'application/json'
          },
          //body: JSON.stringify(j)
        }).then((response) => {
          console.log(response);
          if (response.ok) {
            // setSelectedId(0);
            // refresh data
            revalidator.revalidate();
            setRowCount(tableData.length + 1);
        }
        }).catch((err) => {
          console.error(err);
        });    
    };

    const handleAddClick = () => {
        if (!tickerToAdd) {
            return;
        }
        // setSelectedId(0);
        if (addUrl) {
            issueAddRequest();
        }
    };
        
    const handleSelectChange = (v) => {
        let ticker = v['value'];
        // console.log('handleSelectChange called with value=' + ticker);
        let row = tableData.find(r => r['tickerName'] === ticker);
        if (row) {
            setSelectedId(row[keyField]);
            setTickerToAdd('');
        } else {
            setTickerToAdd(ticker);
        }
    };

    return (
        <>
          <div className={styles.nav}>
            <span className={styles.header}>{title}</span>

            <Select options={options} styles={selectStyles} onChange={handleSelectChange} defaultValue={tickerToAdd} />

            { addUrl &&
            <ButtonGroup className="mb-2">
              {!tickerToAdd && <Button id="Add" variant="primary" onClick={handleAddClick} disabled>Add</Button>}
              {tickerToAdd && <Button id="Add" variant="primary" onClick={handleAddClick}>Add</Button>}
            </ButtonGroup>
            }

            { deleteUrl &&
            <ButtonGroup className="mb-2">
              {selectedId <= 0 && <Button id="Remove" variant="primary" onClick={handleRemoveClick} disabled>Remove</Button>}
              {selectedId > 0 && <Button id="Remove" variant="primary" onClick={handleRemoveClick}>Remove</Button>}
            </ButtonGroup>
            }
          </div>
          <Table bordered hover className={styles.table}>
            <thead>
                <tr>
                    {columns.map((col) => {
                        const cl = col.sortable ? (sortField === col.field && order === "asc" ? styles.up
                                : (sortField === col.field && order === "desc" ? styles.down : styles.default)) : "";
                        return (
                            <th key={col.field} className={cl} onClick={() => {if (col.sortable) handlingSortingChange(col);}}>{col.title}</th>
                        )
                    })}
                </tr>
            </thead>
            <tbody>
                {tableData.map((row) => (
                    <tr key={row[keyField]} id={row[keyField]} onClick={selectHandler} className={row[keyField] === selectedId ? 'table-active' : ''}>
                        {columns.map((col) => {
                            if (col.url && col.url(row)) {
                                return (<td key={col.field}><Link to={col.url(row, preSlide)}>{row[col.field]}</Link></td>)
                            } else if(col.alert) {
                                return (<td key={col.field} className={col.alert(row, styles)}>{col.formatter ? col.formatter(row[col.field]) : row[col.field]}</td>)
                            } else {
                                return (<td key={col.field}>{col.formatter ? col.formatter(row[col.field]) : row[col.field]}</td>)
                            }
                        })}
                    </tr>
                ))}
            </tbody>
        </Table>
      </>
    );
};

export default SortedTable;
