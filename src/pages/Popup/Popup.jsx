import React from 'react';
import './Popup.css';

const Popup = () => {
  const handleDashboardPage = (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: `chrome-extension://${chrome.runtime.id}/dashboard.html`,
    });
  };

  return (
    <div className="App">
      <h1>LinkedIn CRM</h1>
      <button id="manage" onClick={handleDashboardPage}>
        Manage connections
      </button>
    </div>
  );
};

export default Popup;
