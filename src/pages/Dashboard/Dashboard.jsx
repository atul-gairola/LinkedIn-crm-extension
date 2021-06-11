import React, { useState, useEffect } from 'react';
import { Pane, Text } from 'evergreen-ui';
import axios from 'axios';

import Header from './Header';
import Table from './Table/Table';
import Loading from '../../components/Loading';
import { sleep } from './utils';

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [linkedInUser, setLinkedInUser] = useState();
  const [retConnections, setRetConnections] = useState();
  const [latestRetConnection, setLatestRetConnection] = useState();

  useEffect(() => {
    setLoading(true);

    chrome.runtime.sendMessage({ action: 'initialize' }, async (response) => {
      const { data } = await axios.post(
        `http://localhost:8000/connections/init`,
        response
      );
      const { user } = data;
      // save the user in the storage
      await chrome.storage.sync.set({
        linkedInUser: JSON.stringify(user),
      });

      await chrome.storage.sync.set({
        totalConnections: user.totalConnections,
      });

      await chrome.storage.sync.set({
        retrievedConnections: user.retrievedConnections,
      });

      setLinkedInUser(user);
      setRetConnections(user.retrievedConnections);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    console.log('Running task');
    chrome.runtime.sendMessage({ action: 'getNextUpdate' }, () => {});

    const updateConnection = async (req, sender, sendResponse) => {
      if (req.message === 'next_data') {
        const { updateData } = req;
        const { data: result } = await axios.patch(
          `http://localhost:8000/connections/update/${updateData.entityUrn.replace(
            'fs_',
            'fsd_'
          )}`,
          updateData,
          {
            headers: linkedInUser._id,
          }
        );

        console.log('Updated Data: ', result);
        await sleep(3000);
        chrome.runtime.sendMessage({ action: 'getNextUpdate' }, () => {});
      } else if (req.message === 'collected_all') {
        console.log('Collected all');
        return;
      }
    };

    chrome.runtime.onMessage.addListener(updateConnection);

    return chrome.runtime.onMessage.removeListener(updateConnection);
  }, [linkedInUser]);

  return (
    <div>
      {!linkedInUser ? (
        <div style={{ width: '100%', height: '100vh' }}>
          <Loading />
        </div>
      ) : (
        <div>
          <Header user={linkedInUser} retConnections={retConnections} />
          <Pane paddingX={30} marginTop={50}>
            <Table
              user={linkedInUser}
              retConnections={retConnections}
              latestRetConnection={latestRetConnection}
            />
          </Pane>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Text>
              {chrome.runtime.getManifest().name} - v
              {chrome.runtime.getManifest().version}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
