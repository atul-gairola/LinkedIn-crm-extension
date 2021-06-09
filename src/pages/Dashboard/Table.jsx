import React, { useEffect, useState } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';
import debounce from 'lodash.debounce';

import './Table.css';
import { formatTimeStamp } from './utils';

function Table({ user }) {
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

  function formatConnectionDataToRowData(connection) {
    return {
      fullName: connection.fullName || '',
      connectedAt: formatTimeStamp(connection.connectedAt) || '',
      headline: connection.headline || '',
      company: connection.company || '',
      companyTitle: connection.companyTitle || '',
      contact: `${connection.contact.emailAddress || ''}\n${
        (connection.contact.phoneNumbers &&
          connection.contact.phoneNumbers[0]) ||
        ''
      }\n${connection.contact.address || ''}`,
      location: `${connection.location || ''}, ${connection.country || ''}`,
      industry: connection.industryName || '',
      id: connection._id,
      entityUrn: connection.entityUrn,
      publicIdentifier: connection.publicIdentifier,
      profileId: connection.profileId,
    };
  }

  async function fetchConnections(
    start,
    count,
    sortBy,
    sortOrder,
    searchIn,
    search
  ) {
    console.log(searchIn);
    console.log(search);
    let searchUrl = ``;
    if (searchIn.length === 0) {
      searchUrl = `&searchIn=&search=`;
    } else {
      searchIn.forEach((cur, i) => {
        searchUrl += `&searchIn=${cur}&search=${search[i]}`;
      });
    }

    console.log(searchUrl);

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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [pagination, sorting, filters]);

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

        // console.log(data.update);

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

  const handlePage = async (e) => {
    const { name } = e.target;
    if (name === 'next') {
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    } else {
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
    }
  };

  const handleCountChange = async (e) => {
    const { value } = e.target;
    console.log(value);
    setPagination((prev) => ({
      ...prev,
      count: value,
    }));
  };

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

  const handleSorting = (e) => {
    const { value } = e.target;
    setSorting(value);
  };

  const handleSearch = (e) => {
    const { value, name } = e.target;
    setFilters((prev) => {
      let searchIn =
        value === '' ? [...prev.searchIn] : [...prev.searchIn, name];
      let search = value === '' ? [...prev.search] : [...prev.search, value];

      if (value === '') {
        const index = searchIn.indexOf(name);
        if (index !== -1) {
          searchIn = [...prev.searchIn];
          searchIn.splice(index, 1);
          search = [...prev.search];
          search.splice(index, 1);
        }
      } else {
        const index = prev.searchIn.indexOf(name);
        if (index !== -1) {
          searchIn = [...prev.searchIn];
          const searchArr = [...prev.search];
          searchArr[index] = value;
          search = searchArr;
        }
      }

      console.log('Search In: ', searchIn);
      console.log('search: ', search);

      return { ...prev, searchIn: searchIn, search: search };
    });
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: connections,
    });

  function getPaginationDetails() {
    const startCount = (pagination.currentPage - 1) * pagination.count + 1;
    const endCount =
      startCount + pagination.count > totalResults
        ? totalResults
        : startCount + pagination.count;
    return `${startCount} - ${endCount} / ${totalResults}`;
  }

  return (
    <>
      <div className="pagination">
        <p>{getPaginationDetails()}</p>
        <p>Page : {pagination.currentPage}</p>
        <button
          disabled={pagination.currentPage === 1}
          name="prev"
          onClick={handlePage}
        >
          {'<'}
        </button>
        <button
          disabled={
            pagination.currentPage ===
            Math.ceil(totalResults / pagination.count)
          }
          name="next"
          onClick={handlePage}
        >
          {'>'}
        </button>
        <select
          name="countPerPage"
          id="count-per-page"
          value={pagination.count}
          onChange={handleCountChange}
        >
          <option value={50}>50</option>
          <option value={70}>70</option>
          <option value={100}>100</option>
        </select>
      </div>
      <div className="sorting">
        <select
          name="sorting"
          id="sorting"
          value={sorting}
          onChange={handleSorting}
        >
          <option value="fullName_asc">Name (asc)</option>
          <option value="fullName_desc">Name (desc)</option>
          <option value="connectedAt_asc">Connected At (asc)</option>
          <option value="connectedAt_desc">Connected At (desc)</option>
        </select>
      </div>
      <div className="filters">
        <label>Search Name</label>
        <input type="text" name="fullName" onChange={handleSearch} />
        <label>Search Headline</label>
        <input type="text" name="headline" onChange={handleSearch} />
        <label>Search Location</label>
        <input type="text" name="location" onChange={handleSearch} />
        <label>Search Company</label>
        <input type="text" name="company" onChange={handleSearch} />
      </div>
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
