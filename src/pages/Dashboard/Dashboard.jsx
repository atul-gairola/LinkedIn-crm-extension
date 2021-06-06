import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'initialize' }, (response) => {
      // if (response) {
        console.log(response);
        setLoading(false);
      // }
    });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}

export default Dashboard;
