import React from 'react';
import { Button, Heading, Text } from 'evergreen-ui';

import icon from '../../assets/img/icon-128.png';
import './HomePopup.css';

const HomePopup = () => {
  const handleDashboardPage = (e) => {
    e.preventDefault();
    chrome.tabs.create({
      url: `chrome-extension://${chrome.runtime.id}/dashboard.html`,
    });
  };

  return (
    <div className="container">
      <img src={icon} alt="logo" />
      <Heading marginBottom={30} is="h1">
        LINKEDIN CRM
      </Heading>
      <Button
        id="manage"
        onClick={handleDashboardPage}
        size="large"
        appearance="primary"
      >
        View Connections
      </Button>
      <Text marginTop={7}>
        Manage your professional connections like never before.
      </Text>
      <Text marginTop={30} size={300} color="muted">{`${
        chrome.runtime.getManifest().name
      } - v${chrome.runtime.getManifest().version}`}</Text>
    </div>
  );
};

export default HomePopup;
