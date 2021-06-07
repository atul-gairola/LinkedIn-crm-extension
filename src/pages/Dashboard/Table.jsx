import React, { useEffect, useState } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';

import './Table.css';

function Table() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    count: 50,
    start: 0,
  });
  
  // const data = React.useMemo(
  //   () => [
  //     {
  //       col1: 'Hello',
  //       col2: 'World',
  //     },
  //     {
  //       col1: 'react-table',
  //       col2: 'rocks',
  //     },
  //     {
  //       col1: 'hello',
  //       col2: 'company',
  //       company: 'company',
  //     },
  //   ],
  //   []
  // );

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      await axios.get(`http://localhost:8000/connections?`);
    };
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'col1', // accessor is the "key" in the data
      },
      {
        Header: 'Connected',
        accessor: 'col2',
      },
      {
        Header: 'Headline',
        accessor: 'headline',
      },
      {
        Header: 'Company',
        accessor: 'company',
      },
      {
        Header: 'Location',
        accessor: 'location',
      },
      {
        Header: 'Contact Info',
        accessor: 'contactInfo',
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <table {...getTableProps()} className="table">
      <thead className="tableHeader">
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Table;
