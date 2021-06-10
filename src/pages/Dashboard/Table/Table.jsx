import React, { useEffect, useState, useCallback } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';

import './Table.css';
import Pagination from './components/Pagination';
import Sorting from './components/Sorting';
import Filters from './components/Filters';
import { formatConnectionDataToRowData } from '../utils';

/**
 * @desc React component
 * @param {Object} Props
 * @returns Table component
 */

function Table({ user, latestRetConnection }) {
  // STATES
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState([]);
  const [pagination, setPagination] = useState({
    count: 50,
    currentPage: 1,
  });
  const [totalResults, setTotalResults] = useState(0);
  const [sorting, setSorting] = useState('connectedAt_desc');
  const [filters, setFilters] = useState({
    search: [],
    searchIn: [],
  });

  // -----

  /**
   * @desc Send a fetch req to the server to get back connections
   * @param {Number} [start] The start index of the results for pagination
   * @param {Number} [count] The no. of results per page for pagination
   * @param {String} [sortBy] the field to sort in
   * @param {String} [sortOrder] the order to sort in
   * @param {Array} [searchIn] the fields for text search
   * @param {Array} [search] the texts to search per field
   * @return {Object} - connections data from the server as per the filters
   */

  async function fetchConnections(
    start,
    count,
    sortBy,
    sortOrder,
    searchIn,
    search
  ) {
    let searchUrl = ``;
    if (searchIn.length === 0) {
      searchUrl = `&searchIn=&search=`;
    } else {
      searchIn.forEach((cur, i) => {
        searchUrl += `&searchIn=${cur}&search=${search[i]}`;
      });
    }
    const { data } = await axios.get(
      `http://localhost:8000/connections?start=${start}&count=${count}&sortBy=${sortBy}&sortOrder=${sortOrder}${searchUrl}`,
      {
        headers: {
          liuser: user._id,
        },
      }
    );

    return data;
  }

  // -----

  /**
   * @desc Calls fetchConnections and sets the results to component states
   */

  const fetchData = async () => {
    setLoading(true);

    const { data, meta } = await fetchConnections(
      pagination.count * (pagination.currentPage - 1),
      pagination.count,
      sorting.split('_')[0],
      sorting.split('_')[1] === 'asc' ? 1 : -1,
      filters.searchIn,
      filters.search
    );
    const connectionsArr = data.connections.map((cur) =>
      formatConnectionDataToRowData(cur)
    );
    console.log(meta);
    setTotalResults(meta.totalResults);
    setConnections(connectionsArr);
    setLoading(false);
  };

  // USE EFFECTS

  // runs when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // runs when any of the following state changes
  useEffect(() => {
    fetchData();
  }, [pagination, sorting, filters]);

  // runs when latest retrieved connection gets updated
  useEffect(() => {
    console.log(latestRetConnection);
    console.log(connections);
  }, [latestRetConnection]);

  // HANDLERS

  /**
   * @desc Sends Message to bckg to collect complete data of the current row connection and updates the server and current state accordingly
   * @param {Object} [cell] - The cell object passed in table column
   */
  const handleUpdateData = (cell) => {
    const {
      row: { original },
    } = cell;
    const { id, entityUrn, profileId, publicIdentifier } = original;

    chrome.runtime.sendMessage(
      {
        action: 'updateConnection',
        profileId: profileId || entityUrn.replace('urn:li:fsd_profile:', ''),
        publicIdentifier: publicIdentifier,
      },
      async (res) => {
        const { data: result } = await axios.patch(
          `http://localhost:8000/connections/update/${entityUrn}`,
          res,
          {
            headers: {
              liuser: user._id,
            },
          }
        );

        const { data, meta } = result;

        setConnections((prev) => {
          const copy = [...prev];
          copy[Number(cell.row.id)] = formatConnectionDataToRowData(
            data.update
          );
          return copy;
        });
      }
    );
  };

  // -----

  // Columns for the table
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'fullName', // accessor is the "key" in the data
      },
      {
        Header: 'Connected',
        accessor: 'connectedAt',
      },
      {
        Header: 'Headline',
        accessor: 'headline',
      },
      {
        Header: 'Location',
        accessor: 'location',
      },
      {
        Header: 'Company',
        accessor: 'company',
      },
      {
        Header: 'Title',
        accessor: 'companyTitle',
      },
      {
        Header: 'Contact Info',
        accessor: 'contact',
      },
      {
        Header: 'Industry',
        accessor: 'industry',
      },
      {
        Header: 'Fetch info',
        accessor: 'fetch',
        Cell: ({ cell }) => (
          <button onClick={() => handleUpdateData(cell)}>Fetch</button>
        ),
      },
      {
        Header: 'Actions',
        accessor: 'actions',
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: connections,
    });

  return (
    <>
      <Pagination
        pagination={pagination}
        setPagination={setPagination}
        totalResults={totalResults}
      />
      <Sorting sorting={sorting} setSorting={setSorting} />
      <Filters setFilters={setFilters} />
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
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default Table;
