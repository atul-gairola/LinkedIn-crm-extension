import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Header from './Header';
import Table from './Table';

function Dashboard() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    console.log('Getting data');
    chrome.runtime.sendMessage({ action: 'initialize' }, async (response) => {
      console.log(response);
      setLoading(false);
      /**
       * @todo
       * Send data to api
       */
      const { data } = await axios.post(
        `http://localhost:8000/connections/init`,
        response
      );
      console.log(data);
    });
  }, []);

  return (
    <div>
      {/* {loading ? (
        <h1>Loading</h1>
      ) : ( */}
      <div>
        <Header fullName={'Atul Gairola'} size={40} />
        <Table />
      </div>
      {/* )} */}
    </div>
  );
}

export default Dashboard;
