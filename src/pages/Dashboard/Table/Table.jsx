import React, { useEffect, useState, useCallback } from 'react';
import { useTable, useSortBy } from 'react-table';
import {
  Pane,
  Checkbox,
  MoreIcon,
  Button,
  RefreshIcon,
  TextInputField,
  DownloadIcon,
  Popover,
  Menu,
  PersonIcon,
  ChatIcon,
  DisableIcon,
  FollowingIcon,
  FollowerIcon,
  Position,
} from 'evergreen-ui';
import { debounce } from 'debounce';
import axios from 'axios';

import './Table.css';
import Pagination from './components/Pagination';
import Sorting from './components/Sorting';
// import Filters from './components/Filters';
import SendMessage from './components/SendMessage';
import {
  formatConnectionDataToRowData,
  connectionCSVData,
  downloadAsCSV,
} from '../../../utils';

/**
 * @desc React component
 * @param {Object} Props
 * @returns Table component
 */

function Table({ user, setRetConnections }) {
  // STATES
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState([]);
  const [pagination, setPagination] = useState({
    count: 50,
    currentPage: 1,
  });
  const [totalResults, setTotalResults] = useState(0);
  const [sorting, setSorting] = useState('connectedAt_desc');

  const [inputSearch, setInputSearch] = useState('');
  const [fetchSearch, setFetchSearch] = useState('');

  const [showSendMessage, setShowSendMessage] = useState(false);

  // TODO
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [fetchLoading, setFetchLoading] = useState([]);

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
    fetchSearch
  ) {
    let searchUrl = ``;
    if (fetchSearch !== '') {
      searchUrl = `&search=${fetchSearch}`;
    }
    const { data } = await axios.get(
      `/connections?start=${start}&count=${count}&sortBy=${sortBy}&sortOrder=${sortOrder}${searchUrl}`,

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
      fetchSearch
    );
    const connectionsArr = data.connections.map((cur) =>
      formatConnectionDataToRowData(cur)
    );
    setTotalResults(meta.totalResults);
    setConnections(connectionsArr);
    setSelected(connectionsArr.map((cur) => false));
    setFetchLoading(connectionsArr.map((cur) => false));
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
  }, [pagination, sorting, fetchSearch]);

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
    setFetchLoading((prev) => {
      const arr = [...prev];
      arr[cell.row.id] = true;
      return arr;
    });
    chrome.runtime.sendMessage(
      {
        action: 'updateConnection',
        profileId: profileId || entityUrn.replace('urn:li:fsd_profile:', ''),
        publicIdentifier: publicIdentifier,
      },
      async (res) => {
        const { data: result } = await axios.patch(
          `/connections/update/${entityUrn}`,

          res,
          {
            headers: {
              liuser: user._id,
            },
          }
        );

        const { data, meta } = result;

        // update state
        setRetConnections(meta.retrieved);

        setConnections((prev) => {
          const copy = [...prev];
          copy[Number(cell.row.id)] = formatConnectionDataToRowData(
            data.update
          );
          return copy;
        });
        setFetchLoading((prev) => {
          const arr = [...prev];
          arr[cell.row.id] = false;
          return arr;
        });
      }
    );
  };

  const handleFetchSearch = (e) => {
    const { value } = e.target;
    setFetchSearch(value);
  };

  const handler = useCallback(debounce(handleFetchSearch, 300), []);

  const handleInputSearch = (e) => {
    const { value } = e.target;
    setInputSearch(value);
    handler(e);
  };

  // -----

  const handleCheckAll = () => {
    setSelectAll(true);
    setSelected((prev) => prev.map(() => true));
  };

  const handleVisitProfile = (publicIdentifier) => {
    chrome.tabs.create({ url: `https://linkedin.com/in/${publicIdentifier}` });
  };

  const handleDownload = () => {
    const headers = [
      'First Name',
      'Last Name',
      'Connected At',
      'Headline',
      'Company',
      'Title',
      'Industry',
      'Email',
      'Phone',
      'Address',
      'Location',
      'Profile link',
    ];

    const dataArr = [headers];

    const connectionCSV = connections.map((cur) => connectionCSVData(cur));

    const finalCSVData = dataArr.concat(connectionCSV);

    downloadAsCSV(
      finalCSVData,
      `Connections page_${pagination.currentPage} count_${pagination.count}.csv`
    );
  };

  // Columns for the table
  const columns = React.useMemo(
    () => [
      {
        Header: (
          <Checkbox
            borderColor="#5153ff"
            checked={selectAll}
            onChange={handleCheckAll}
          />
        ),
        accessor: 'check',
        Cell: (row) => (
          <Checkbox
            borderColor="#5153ff"
            checked={selected[row.index]}
            onChange={(e) => setSelected(e.target.checked)}
          />
        ),
        className: 'checkboxCell',
      },
      {
        Header: 'Name',
        accessor: 'fullName', // accessor is the "key" in the data
        className: 'nameCell',
      },
      {
        Header: 'Connected',
        accessor: 'connectedAt',
        className: 'connectedAtCell',
      },
      {
        Header: 'Headline',
        accessor: 'headline',
        className: 'headlineCell',
      },
      {
        Header: 'Location',
        accessor: 'location',
        className: 'locationCell',
      },
      {
        Header: 'Company',
        accessor: 'company',
        className: 'companyCell',
      },
      {
        Header: 'Title',
        accessor: 'companyTitle',
        className: 'companyTitleCell',
      },
      {
        Header: 'Contact Info',
        accessor: 'contact',
        className: 'contactInfoCell',
      },
      {
        Header: 'Industry',
        accessor: 'industry',
        className: 'industryCell',
      },
      {
        Header: 'Fetch info',
        accessor: 'fetch',
        Cell: (row) => {
          return (
            <Button
              onClick={() => handleUpdateData(row.cell)}
              // color="#cfd2fc"
              // color="#8690fa"
              color="#5153ff"
              disabled={fetchLoading[row.id]}
              iconBefore={RefreshIcon}
              size="medium"
            >
              Update
            </Button>
          );
        },
        className: 'fetchInfoCell',
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ cell }) => {
          const { original } = cell.row;
          return (
            <Popover
              position={Position.BOTTOM_LEFT}
              content={({ close }) => (
                <Menu>
                  <Menu.Group>
                    <Menu.Item
                      onSelect={() => {
                        close();
                        handleVisitProfile(original.publicIdentifier);
                      }}
                      icon={PersonIcon}
                    >
                      Visit Profile
                    </Menu.Item>
                    <Menu.Item
                      onSelect={() => setShowSendMessage(original)}
                      icon={ChatIcon}
                    >
                      Message
                    </Menu.Item>
                    <Menu.Item icon={DisableIcon}>Disconnect</Menu.Item>
                    <Menu.Item icon={FollowingIcon}>Follow</Menu.Item>
                    <Menu.Item icon={FollowerIcon}>Unfollow</Menu.Item>
                  </Menu.Group>
                </Menu>
              )}
            >
              <MoreIcon cursor="pointer" marginX="auto" />
            </Popover>
          );
        },
        className: 'actionsCell',
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: connections,
        disableMultiSort: true,
      },
      useSortBy
    );

  return (
    <Pane>
      <SendMessage
        showSendMessage={showSendMessage}
        setShowSendMessage={setShowSendMessage}
      />
      {/* <Pane marginBottom={20}>
        <Filters
          searchValues={searchValues}
          searchFilterValues={searchFilterValues}
          handleClearFilters={handleClearFilters}
        />
      </Pane> */}
      <Pane
        background="#fff"
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.06)"
        style={{ borderRadius: '5px 5px 5px 5px' }}
        paddingTop={0}
      >
        <div
          style={{
            alignItems: 'end',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 200px auto',
              alignItems: 'end',
              gridGap: '30px',
            }}
          >
            <Sorting sorting={sorting} setSorting={setSorting} />
            <TextInputField
              name="search"
              onChange={handleInputSearch}
              value={inputSearch}
              label="Search"
              width={200}
              marginBottom={2}
              placeholder="Search in all columns"
            />
            <Button
              maxWidth={100}
              iconBefore={DownloadIcon}
              appearance="primary"
              marginBottom={4}
              onClick={handleDownload}
            >
              Download
            </Button>
          </div>
          <Pane justifySelf="end">
            <Pagination
              pagination={pagination}
              setPagination={setPagination}
              totalResults={totalResults}
            />
          </Pane>
        </div>
        <div className="tableContainer">
          <table {...getTableProps()} className="table">
            <thead className="tableHeader">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column, i) => (
                    <th
                      style={i === 0 ? { paddingLeft: '15px' } : {}}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render('Header')}
                    </th>
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
                        <td
                          {...cell.getCellProps()}
                          className={`${cell.column.className || ''}`}
                        >
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Pane>
    </Pane>
  );
}

export default Table;
