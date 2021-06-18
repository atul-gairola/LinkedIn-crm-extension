import React, { useEffect, useState } from 'react';
import {
  Pane,
  Button,
  AddIcon,
  Text,
  Dialog,
  TextInputField,
  TextareaField,
  Select,
  IconButton,
  TrashIcon,
  toaster,
} from 'evergreen-ui';
import axios from 'axios';
import { useTable } from 'react-table';

import Loading from '../../components/Loading';
import { formatTimeStamp } from '../../utils';
import './Tags.css';

function Tags() {
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [tagData, setTagData] = useState({
    color: {
      colorName: 'blue',
      colorHex: '#d6e0ff',
    },
    name: '',
    description: '',
  });

  const fetchTags = () => {
    setLoading(true);
    chrome.storage.sync.get('currentUser', async (resp) => {
      const { currentUser } = resp;
      const { data } = await axios.get(`/user/${currentUser}/tags`);
      const finalRes = data.tags.map((cur) => ({
        ...cur,
        createdAt:
          formatTimeStamp(Date(cur.createdAt)).date +
          ' ' +
          formatTimeStamp(Date(cur.createdAt)).time,
      }));

      setTags(finalRes);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleTagCreate = async () => {
    chrome.storage.sync.get('currentUser', async (resp) => {
      const { currentUser } = resp;
      const { data } = await axios.post(`/user/${currentUser}/tags/create`, {
        name: tagData.name,
        description: tagData.description,
        colorHex: tagData.color.colorHex,
        colorName: tagData.color.colorName,
      });
      setShowDialog(false);
      fetchTags();
    });
  };

  const handleDelete = (tagId) => {
    chrome.storage.sync.get('currentUser', async (resp) => {
      const { currentUser } = resp;
      const { data } = await axios.delete(`/user/${currentUser}/tags/${tagId}`);
      toaster.success('Deleted tag successfully', { duration: 6 });
      fetchTags();
    });
  };

  function ColorTag({ colorName, colorHex }) {
    return (
      <Pane
        background={colorHex}
        width={30}
        height={30}
        borderRadius={'50%'}
        id={colorName}
        onClick={() =>
          setTagData((prev) => ({
            ...prev,
            color: {
              colorName,
              colorHex,
            },
          }))
        }
        marginRight={5}
        cursor="pointer"
        style={
          tagData.color.colorHex === colorHex
            ? { border: '2px solid rgba(0,0,0,0.6)' }
            : { border: '1px solid rgba(0,0,0,0.3)' }
        }
      ></Pane>
    );
  }

  // Columns for the table
  const columns = React.useMemo(
    () => [
      {
        Header: '',
        accessor: 'colorHex', // accessor is the "key" in the data
        className: 'tagnameCell',
        Cell: ({ row }) => {
          console.log(row);
          return (
            <Pane
              background={row.values.colorHex}
              width={30}
              borderRadius={'50%'}
              height={30}
              border="1px solid rgba(0,0,0,0.3)"
            ></Pane>
          );
        },
      },
      {
        Header: 'Name',
        accessor: 'name',
        className: 'tagNameCell',
      },
      {
        Header: 'Description',
        accessor: 'description',
        className: 'tagDescriptionCell',
      },
      {
        Header: 'Date Created',
        accessor: 'createdAt',
      },
      {
        Header: '',
        accessor: 'action',
        Cell: ({row}) => {
          return (
            <IconButton
              onClick={() => handleDelete(row.original._id)}
              icon={TrashIcon}
              intent="danger"
            />
          );
        },
        className: 'tagActionCell',
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({
      columns,
      data: tags,
      disableMultiSort: true,
      manualSortBy: true,
    });

  return (
    <Pane>
      {loading ? (
        <Loading />
      ) : (
        <Pane>
          <Dialog
            isShown={showDialog}
            title="Create Tag"
            onCloseComplete={() => setShowDialog(false)}
            confirmLabel="Create"
            onConfirm={handleTagCreate}
          >
            {({ close }) => (
              <>
                <Pane display="flex" marginBottom={30}>
                  <ColorTag colorName={'blue'} colorHex="#d6e0ff" />
                  <ColorTag colorName={'green'} colorHex="#dcf2ea" />
                  <ColorTag colorName={'red'} colorHex="#f9dada" />
                  <ColorTag colorName={'orange'} colorHex="#f8e3da" />
                  <ColorTag colorName={'purple'} colorHex="#e7e4f9" />
                  <ColorTag colorName={'teal'} colorHex="#d3f5f7" />
                  <ColorTag colorName={'yellow'} colorHex="#ffefd2" />
                  <ColorTag colorName={'gray'} colorHex="#edeff5" />
                </Pane>
                <TextInputField
                  label="Name"
                  value={tagData.name}
                  onChange={(e) =>
                    setTagData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter name"
                />
                <TextareaField
                  label="Description"
                  value={tagData.description}
                  onChange={(e) =>
                    setTagData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter lines decribing the tag"
                />
              </>
            )}
          </Dialog>
          <Button
            onClick={() => setShowDialog(true)}
            marginBottom={30}
            appearance="primary"
            iconBefore={AddIcon}
          >
            Create Tags
          </Button>
          <Pane>
            {tags.length === 0 ? (
              <Pane display="grid" placeContent="center" minHeight={500}>
                <Text>
                  You don't have any tags. Create one to apply it to your
                  connections.
                </Text>
              </Pane>
            ) : (
              <Pane>
                <table {...getTableProps()} className="table">
                  <thead className="tableHeader">
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column, i) => (
                          <th {...column.getHeaderProps()}>
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
              </Pane>
            )}
          </Pane>
        </Pane>
      )}
    </Pane>
  );
}

export default Tags;
