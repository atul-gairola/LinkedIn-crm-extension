import React, { useEffect, useState, useCallback } from 'react';
import { useTable, useSortBy, useRowSelect } from 'react-table';
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
  Avatar,
  CaretDownIcon,
  CaretUpIcon,
  toaster,
  Dialog,
  Tooltip,
  TagIcon,
  Badge,
  RemoveIcon,
  Select,
} from 'evergreen-ui';
import { debounce } from 'debounce';
import axios from 'axios';

import './Table.css';
import Pagination from './components/Pagination';
import Sorting from './components/Sorting';
import SendMessage from './components/SendMessage';
import Loading from '../../../components/Loading';
import {
  formatConnectionDataToRowData,
  connectionCSVData,
  downloadAsCSV,
  getProfileIdFromUrn,
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
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [toDisconnect, setToDisconnect] = useState();

  const [showApplyTag, setShowApplyTag] = useState(false);
  const [showRemoveTag, setShowRemoveTag] = useState(false);
  const [curConnectionForTag, setCurConnectionForTag] = useState();
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState();
  const [removeTagValues, setRemoveTagValues] = useState([]);
  // TODO
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

    console.log(connectionsArr);
    setTotalResults(meta.totalResults);
    setConnections(connectionsArr);
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

        console.log('update: ', data);

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

  const handleVisitProfile = (publicIdentifier) => {
    chrome.tabs.create({ url: `https://linkedin.com/in/${publicIdentifier}` });
  };

  const handleFollow = (publicIdentifier, action, firstName) => {
    chrome.runtime.sendMessage({ action: action, publicIdentifier }, (resp) => {
      console.log(resp);
      if (resp.status === 'failed') {
        toaster.danger('Not logged into linkedin.', {
          description:
            'Kindly login to your linkedin in this browser to access the features of the extension.',
          duration: 6,
        });
      } else {
        const text =
          action === 'unfollowConnection'
            ? 'Unfollow successful'
            : 'Follow successful';

        toaster.success(text, {
          description: `You have successfully ${
            action === 'unfollowConnection' ? 'unfollowed' : 'followed'
          } ${
            Array.isArray(firstName)
              ? firstName.length + ' connections'
              : firstName.toUpperCase()
          }`,
          duration: 6,
        });
      }
    });
  };

  const handleApplyTagDialog = (connectionId, type) => {
    chrome.storage.sync.get('currentUser', async (resp) => {
      const { currentUser } = resp;
      const { data } = await axios.get(`/user/${currentUser}/tags`);
      setTags(data.tags);
      setCurConnectionForTag(connectionId);
      setSelectedTag(data.tags[0]._id);
      if (type === 'remove') {
        setShowRemoveTag(true);
      } else {
        setShowApplyTag(true);
      }
    });
  };

  const applyTag = () => {
    chrome.storage.sync.get('currentUser', async (resp) => {
      const { currentUser } = resp;
      const { data } = await axios.get(
        `/user/${currentUser}/tags/${selectedTag}/connection/${curConnectionForTag}/apply`
      );
      console.log(data);
      setShowApplyTag(false);
      await fetchData();
    });
  };

  const removeTag = () => {
    chrome.storage.sync.get('currentUser', async (resp) => {
      const { currentUser } = resp;
      const { data } = await axios.delete(
        `/user/${currentUser}/tags/${selectedTag}/connection/${curConnectionForTag}/remove`
      );
      console.log(data);
      setShowRemoveTag(false);
      await fetchData();
    });
  };

  const handleDisconnect = () => {
    console.log(toDisconnect);
    let profileIds = Array.isArray(toDisconnect.original)
      ? toDisconnect.original.map((cur) =>
          cur.profileId ? cur.profileId : getProfileIdFromUrn(cur.entityUrn)
        )
      : [
          toDisconnect.original.profileId ||
            getProfileIdFromUrn(toDisconnect.original.entityUrn),
        ];

    console.log(profileIds);
    chrome.runtime.sendMessage(
      {
        action: 'disconnect',
        profileId: profileIds,
      },
      (resp) => {
        console.log(resp);
        if (resp && resp.status >= 400) {
          toaster.danger('Disconnection error', {
            description: `Error occured while disconnecting with the connection. ${resp.message}`,
          });
        } else {
          toaster.success('Disconnected successfully', {
            description: `${
              Array.isArray(toDisconnect)
                ? toDisconnect.length + ' connections'
                : toDisconnect.original.fullName
            } disconnected successfully.`,
            duration: 6,
          });
          setShowDisconnect(false);
        }
      }
    );
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
        Header: ({ getToggleAllRowsSelectedProps }) => {
          return (
            <Checkbox
              // display="inline"
              // marginY={5}
              {...getToggleAllRowsSelectedProps()}
            />
          );
        },
        disableSortBy: true,
        accessor: 'check',
        Cell: ({ row }) => {
          return <Checkbox {...row.getToggleRowSelectedProps()} />;
        },
        className: 'checkboxCell',
      },
      {
        Header: '',
        disableSortBy: true,
        accessor: 'profilePicture',
        className: 'profilePictureCell',
        Cell: (row) => {
          return (
            <Avatar
              src={row.value}
              size={30}
              name={row.cell.row.original.fullName}
            />
          );
        },
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
        Header: 'Industry',
        accessor: 'industry',
        className: 'industryCell',
      },
      {
        Header: 'Tag',
        accessor: 'tags',
        className: 'tagCell',
        Cell: (row) => {
          if (row.value.length > 0) {
            return row.value.map((cur, i) => (
              <>
                <Badge key={i} color={cur.colorName}>
                  {cur.name && cur.name.replaceAll(' ', '_')}
                </Badge>
                <br />
              </>
            ));
          } else {
            return '';
          }
        },
      },
      {
        Header: 'Contact Info',
        accessor: 'contact',
        disableSortBy: true,
        className: 'contactInfoCell',
      },
      {
        Header: 'Fetch info',
        accessor: 'fetch',
        disableSortBy: true,
        Cell: (row) => {
          return (
            <Button
              onClick={() => handleUpdateData(row.cell)}
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
        disableSortBy: true,
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
                    <Menu.Item
                      onSelect={() => handleApplyTagDialog(original.id)}
                      icon={TagIcon}
                    >
                      Apply Tag
                    </Menu.Item>
                    <Menu.Item
                      onSelect={() =>
                        handleApplyTagDialog(original.id, 'remove')
                      }
                      intent="danger"
                      icon={RemoveIcon}
                    >
                      Remove Tag
                    </Menu.Item>
                    <Menu.Item
                      onSelect={() => {
                        setShowDisconnect(true);
                        setToDisconnect({
                          original: original,
                          // profileId: original.profileId,
                          // entityUrn: original.entityUrn,
                          // fullName: original.fullName,
                        });
                      }}
                      intent="danger"
                      icon={DisableIcon}
                    >
                      Disconnect
                    </Menu.Item>
                    <Menu.Item
                      onSelect={() =>
                        handleFollow(
                          original.publicIdentifier,
                          'followConnection',
                          original.firstName
                        )
                      }
                      icon={FollowingIcon}
                    >
                      Follow
                    </Menu.Item>
                    <Menu.Item
                      onSelect={() =>
                        handleFollow(
                          original.publicIdentifier,
                          'unfollowConnection',
                          original.firstName
                        )
                      }
                      icon={FollowerIcon}
                      intent="danger"
                    >
                      Unfollow
                    </Menu.Item>
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

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { sortBy, selectedRowIds },
  } = useTable(
    {
      columns,
      data: connections,
      disableMultiSort: true,
      manualSortBy: true,
    },
    useSortBy,
    useRowSelect
  );

  useEffect(() => {
    console.log('Table state: ', sortBy);
    if (sortBy.length > 0) {
      const { id, desc } = sortBy[0];
      desc ? setSorting(`${id}_desc`) : setSorting(`${id}_asc`);
    } else {
      setSorting('connectedAt_desc');
    }
  }, [sortBy]);

  return (
    <Pane>
      {showDisconnect ? (
        <Dialog
          isShown={showDisconnect ? true : false}
          title="Disconnect"
          intent="danger"
          onCloseComplete={() => setShowDisconnect(false)}
          onConfirm={handleDisconnect}
          confirmLabel="Disconnect"
        >
          Are you sure you want to disconnect {toDisconnect.fullName} from your
          connections?
        </Dialog>
      ) : null}
      <Dialog
        isShown={showApplyTag}
        title="Apply tag"
        onCloseComplete={() => setShowApplyTag(false)}
        onConfirm={applyTag}
        confirmLabel="Apply Tag"
      >
        <Select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          width="100%"
        >
          {tags.map((cur, i) => (
            <option key={i} value={cur._id}>
              {cur.name}
            </option>
          ))}
        </Select>
      </Dialog>
      <SendMessage
        showSendMessage={showSendMessage}
        setShowSendMessage={setShowSendMessage}
      />
      <Dialog
        isShown={showRemoveTag}
        title="Remove Tag"
        onCloseComplete={() => setShowRemoveTag(false)}
        onConfirm={removeTag}
        intent="danger"
        confirmLabel="Remove Tag"
      >
        <Select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          width="100%"
        >
          {tags.map((cur, i) => (
            <option key={i} value={cur._id}>
              {cur.name}
            </option>
          ))}
        </Select>
      </Dialog>
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
              gridTemplateColumns: '250px auto',
              alignItems: 'end',
              gridGap: '30px',
            }}
          >
            {/* <Sorting sorting={sorting} setSorting={setSorting} /> */}
            <TextInputField
              name="search"
              onChange={handleInputSearch}
              value={inputSearch}
              label="Search"
              width={250}
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
          {loading && (
            <div className="tableLoadingContainer">
              <Loading />
            </div>
          )}
          <table {...getTableProps()} className="table">
            <thead className="tableHeader">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column, i) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {i === 0 && Object.keys(selectedRowIds).length > 0
                        ? null
                        : column.render('Header')}
                      {column.isSorted ? (
                        column.isSortedDesc ? (
                          <span style={{ marginLeft: 5 }}>
                            <CaretDownIcon transform="translateY(3px)" />
                          </span>
                        ) : (
                          <span style={{ marginLeft: 5 }}>
                            <CaretUpIcon transform="translateY(3px)" />
                          </span>
                        )
                      ) : null}
                      {i === 0 && Object.keys(selectedRowIds).length > 0 ? (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            alignItems: 'center',
                            paddingLeft: 5,
                            gridGap: 5,
                          }}
                        >
                          <span>{column.render('Header')}</span>
                          <span style={{ marginLeft: 5, display: 'inline' }}>
                            {' '}
                            {Object.keys(selectedRowIds).length}{' '}
                          </span>
                          <Popover
                            position={Position.BOTTOM_LEFT}
                            content={({ close }) => (
                              <Menu>
                                <Menu.Group>
                                  <Menu.Item
                                    onSelect={() => {
                                      const rowIdsArr =
                                        Object.keys(selectedRowIds);

                                      const selectedRows = rows.filter(
                                        (cur, i) =>
                                          rowIdsArr.includes(String(i))
                                      );

                                      setShowSendMessage(
                                        selectedRows.map((cur) => cur.original)
                                      );
                                    }}
                                    disabled={
                                      Object.keys(selectedRowIds).length > 25
                                        ? true
                                        : false
                                    }
                                    color={
                                      Object.keys(selectedRowIds).length > 25
                                        ? 'rgba(0,0,0,.4)'
                                        : ''
                                    }
                                    icon={ChatIcon}
                                  >
                                    Message
                                  </Menu.Item>
                                  {/* <Menu.Item
                                    onSelect={() => {
                                      const rowIdsArr =
                                        Object.keys(selectedRowIds);

                                      const selectedRows = rows.filter(
                                        (cur, i) =>
                                          rowIdsArr.includes(String(i))
                                      );
                                      setShowDisconnect(true);
                                      // setToDisconnect({
                                      //   original: selectedRows.map(
                                      //     (cur) => cur.original
                                      //   ),
                                      //   // entityUrn: original.entityUrn,
                                      //   // fullName: original.fullName,
                                      // });
                                    }}
                                    icon={DisableIcon}
                                  >
                                    Disconnect
                                  </Menu.Item> */}
                                  <Menu.Item
                                    onSelect={() => {
                                      const rowIdsArr =
                                        Object.keys(selectedRowIds);

                                      const selectedRows = rows.filter(
                                        (cur, i) =>
                                          rowIdsArr.includes(String(i))
                                      );
                                      handleFollow(
                                        selectedRows.map(
                                          (cur) => cur.original.publicIdentifier
                                        ),
                                        'followConnection',
                                        selectedRows.map(
                                          (cur) => cur.original.firstName
                                        )
                                      );
                                    }}
                                    icon={FollowingIcon}
                                  >
                                    Follow
                                  </Menu.Item>
                                  <Menu.Item
                                    onSelect={() => {
                                      const rowIdsArr =
                                        Object.keys(selectedRowIds);

                                      const selectedRows = rows.filter(
                                        (cur, i) =>
                                          rowIdsArr.includes(String(i))
                                      );
                                      handleFollow(
                                        selectedRows.map(
                                          (cur) => cur.original.publicIdentifier
                                        ),
                                        'unfollowConnection',
                                        selectedRows.map(
                                          (cur) => cur.original.firstName
                                        )
                                      );
                                    }}
                                    icon={FollowerIcon}
                                  >
                                    Unfollow
                                  </Menu.Item>
                                </Menu.Group>
                              </Menu>
                            )}
                          >
                            <MoreIcon
                              cursor="pointer"
                              marginX="auto"
                              marginLeft={5}
                            />
                          </Popover>
                        </div>
                      ) : null}
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
