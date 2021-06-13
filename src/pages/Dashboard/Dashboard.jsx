import React, { useState, useEffect } from 'react';
import { Pane, Text } from 'evergreen-ui';
import axios from 'axios';

import Header from './Header';
import Table from './Table/Table';
import Loading from '../../components/Loading';
import NotLoggedInLinkedIn from './NotLoggedInLinkedIn';
import { sleep } from '../../utils';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [linkedInUser, setLinkedInUser] = useState();
  const [retConnections, setRetConnections] = useState();

  useEffect(() => {
    setLoading(true);

    chrome.runtime.sendMessage({ action: 'initialize' }, async (response) => {
      // if the user is not logged into linked in
      if (response.status === 'failed') {
        setLoading(false);
        return;
      }

      const { data } = await axios.post(
        // `http://localhost:8000/connections/init`,
        `http://159.65.146.74:8000/connections/init`,
        response
      );
      const { user } = data;

      console.log(user);

      setLinkedInUser(user);
      setRetConnections(user.retrievedConnections);
      setLoading(false);
    });
  }, []);

  // useEffect(() => {
  //   chrome.runtime.sendMessage({ action: 'getNextUpdate' }, () => {});

  //   const updateConnection = async (req, sender, sendResponse) => {
  //     if (req.message === 'next_data') {
  //       const { updateData } = req;
  //       const { data: result } = await axios.patch(
  //         `http://localhost:8000/connections/update/${updateData.entityUrn.replace(
  //           'fs_',
  //           'fsd_'
  //         )}`,
  //         updateData,
  //         {
  //           headers: linkedInUser._id,
  //         }
  //       );

  //       console.log('Updated Data: ', result);
  //       await sleep(3000);
  //       chrome.runtime.sendMessage({ action: 'getNextUpdate' }, () => {});
  //     } else if (req.message === 'collected_all') {
  //       console.log('Collected all');
  //       return;
  //     }
  //   };

  //   chrome.runtime.onMessage.addListener(updateConnection);

  //   return chrome.runtime.onMessage.removeListener(updateConnection);
  // }, [linkedInUser]);

  return (
    <div>
      {loading ? (
        <div style={{ width: '100%', height: '100vh' }}>
          <Loading type="init" />
        </div>
      ) : linkedInUser ? (
        <div>
          <Header user={linkedInUser} retConnections={retConnections} />
          <Pane paddingX={30} marginTop={50}>
            <Table user={linkedInUser} setRetConnections={setRetConnections} />
          </Pane>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <Text>
              {chrome.runtime.getManifest().name} - v
              {chrome.runtime.getManifest().version}
            </Text>
          </div>
        </div>
      ) : (
        <NotLoggedInLinkedIn />
      )}
    </div>
  );
}

export default Dashboard;
