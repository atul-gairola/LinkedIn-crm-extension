import React, { useState, useEffect } from 'react';
import { Pane, Text, toaster } from 'evergreen-ui';
import axios from 'axios';

import Header from '../../components/Header';
import Loading from '../../components/Loading';
import NotLoggedInLinkedIn from './NotLoggedInLinkedIn';
import Connections from './Connections';
import Tags from './Tags';
import { sleep } from '../../utils';

function Dashboard({ setUserLoggedIn }) {
  const [loading, setLoading] = useState(true);
  const [linkedInUser, setLinkedInUser] = useState();
  const [retConnections, setRetConnections] = useState();
  const [selectedTab, setSelectedTab] = useState('Connections');

  function collectConnections(collected, total, user) {
    chrome.runtime.sendMessage(
      { action: 'getConnections', collected, total },
      async (res) => {
        const { connections } = res;
        for (let i = 0; i < connections.length; i++) {
          if (connections[i]) {
            try {
              await sleep(1500);
              const { data } = await axios.post(
                `/connections/`,
                { connection: connections[i] },
                {
                  headers: {
                    liuser: user._id,
                  },
                }
              );
              setLinkedInUser((prev) => ({
                ...prev,
                collectedConnections: prev.collectedConnections + 1,
              }));
              // console.log("Collected Index : ", i);
            } catch (e) {
              console.log(e);
              if (!(e.response && e.response.status === 409)) {
                toaster.warning('Error in collecting', {
                  duration: 6,
                });
              }
            }
          } else {
            console.log('No connection');
          }
        }

        toaster.success('Collected all connections', {
          description: 'Please refresh the page to view them',
          duration: 6,
        });
      }
    );
  }

  async function updateConnectionsProcess() {
    const updateConnection = (response) => {
      const allConnectionsUpdated =
        response.message && response.message === 'updatedAll';

      if (allConnectionsUpdated) {
        toaster.success('All the connections have been updated.');
        return;
      }

      const { connection } = response;

      // send update connection request to background
      

    };

    chrome.runtime.sendMessage({ action: 'getNextUpdate' }, updateConnection);
  }

  useEffect(() => {
    // for dev
    axios.defaults.baseURL = `http://localhost:8000`;
    // for prod
    // axios.defaults.baseURL = 'http://159.65.146.74:8000';
    setLoading(true);

    chrome.runtime.sendMessage({ action: 'initialize' }, async (response) => {
      if (response.status === 'failed') {
        setLoading(false);
        return;
      }
      const { userDetails, contacts } = response;

      const validContacts = contacts.filter((cur) => cur);

      const { data } = await axios.post('/connections/init', {
        userDetails: {
          ...userDetails,
          totalConnections: validContacts.length,
        },
        contacts: validContacts.filter((cur) => cur).slice(0, 300),
      });

      const { user, newInit } = data;

      setLinkedInUser(user);
      setRetConnections(user.retrievedConnections);
      setLoading(false);

      const { collectedConnections, totalConnections, retrievedConnections } =
        user;

      if (retrievedConnections !== totalConnections) {
        // updateConnectionsProcess();
      }

      if (collectedConnections !== totalConnections) {
        console.log('Connections to collect');
        // collect rest connections
        collectConnections(collectedConnections, totalConnections, user);
      }
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
          <Header
            setUserLoggedIn={setUserLoggedIn}
            user={linkedInUser}
            retConnections={retConnections}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
          <Pane paddingX={30} marginTop={50}>
            {selectedTab === 'Connections' ? (
              <Connections
                user={linkedInUser}
                setRetConnections={setRetConnections}
              />
            ) : (
              <Tags />
            )}
          </Pane>
        </div>
      ) : (
        <NotLoggedInLinkedIn />
      )}
    </div>
  );
}

export default Dashboard;
