import React, { useEffect, useState } from 'react';
import { useTable } from 'react-table';
import axios from 'axios';

import './Table.css';
import { formatTimeStamp } from './utils';
import { Button } from 'evergreen-ui';

function Table({ user }) {
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState([]);
  const [pagination, setPagination] = useState({
    count: 50,
    start: 0,
  });

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const { data } = await axios.get(
        `http://localhost:8000/connections?start=${pagination.start}&count=${pagination.count}`,
        {
          headers: {
            liuser: user._id,
          },
        }
      );
      const connectionsArr = data.data.connections.map((cur) => ({
        fullName: cur.fullName || '',
        connectedAt: formatTimeStamp(cur.connectedAt) || '',
        headline: cur.headline || '',
        company: cur.company || '',
        companyTitle: cur.companyTitle || '',
        contact: `${cur.contact.emailAddress || ''}\n${
          (cur.contact.phoneNumbers && cur.contact.phoneNumbers[0]) || ''
        }\n${cur.contact.address || ''}`,
        location: `${cur.location || ''}, ${cur.country || ''}`,
        industry: cur.industryName || '',
        id: cur._id,
        entityUrn: cur.entityUrn,
        publicIdentifier: cur.publicIdentifier,
        profileId: cur.profileId,
      }));

      setConnections(connectionsArr);
      setLoading(false);
    };

    fetchData();
  }, []);

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
        console.log(res);
        console.log(cell);
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

        console.log(data.update);

        setConnections((prev) => {
          const copy = [...prev];
          copy[Number(cell.row.id)] = {
            fullName: data.update.fullName || '',
            connectedAt: formatTimeStamp(data.update.connectedAt) || '',
            headline: data.update.headline || '',
            company: data.update.company || '',
            companyTitle: data.update.companyTitle || '',
            contact: `${data.update.contact.emailAddress || ''}\n${
              (data.update.contact.phoneNumbers &&
                data.update.contact.phoneNumbers[0]) ||
              ''
            }\n${data.update.contact.address || ''}`,
            location: `${data.update.location || ''}, ${
              data.update.country || ''
            }`,
            industry: data.update.industryName || '',
            id: data.update._id,
            entityUrn: data.update.entityUrn,
            publicIdentifier: data.update.publicIdentifier,
            profileId: data.update.profileId,
          };
          return copy;
        });
      }
    );
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

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: connections });

  console.log('connections: ', connections);

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
