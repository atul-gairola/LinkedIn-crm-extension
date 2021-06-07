import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  return <div>{loading ? <h1>Loading</h1> : <h1>Dashboard</h1>}</div>;
}

export default Dashboard;
