import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Header from './Header';
import Table from './Table';

function Dashboard() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'initialize' }, async (response) => {
      console.log(response);
      const { data } = await axios.post(
        `http://localhost:8000/connections/init`,
        response
      );
      console.log(data);
      const { userDetails, contacts } = data;
      // save the user in the storage
      chrome.storage.sync.set({ linkedInUser: JSON.stringify(userDetails) });
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* {loading ? (
        <h1>Loading</h1>
      ) : ( */}
      <div>
        <Header fullName={'Atul Gairola'} size={40} />
        {loading ? <p>Loading</p> : <Table />}
      </div>
      {/* )} */}
    </div>
  );
}

export default Dashboard;
