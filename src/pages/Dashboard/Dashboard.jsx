import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Header from './Header';
import Table from './Table/Table';

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [linkedInUser, setLinkedInUser] = useState();

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
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {!linkedInUser ? (
        <p>Loading</p>
      ) : (
        <div>
          <Header
            fullName={linkedInUser.fullName}
            profilePicture={linkedInUser.profilePicture}
          />
          <Table user={linkedInUser} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;
