import React from 'react';
import { Text, Button, Pane } from 'evergreen-ui';

import logo from '../../assets/img/icon.svg';

function NotLoggedInLinkedIn() {
  return (
    <Pane
      width="100vw"
      height="100vh"
      display="grid"
      gridTemplateColumns="500px"
      placeContent="center"
      textAlign="center"
      justifyItems="center"
    >
      <img style={{ width: 80, marginBottom: 20 }} src={logo} alt="logo" />
      <Text size={600}>
        Seems like you are not logged into LinkedIn on this browser. Please log
        into your account to use this extension
      </Text>
      <a
        target="_blank"
        href="https://www.linkedin.com/"
        style={{ marginTop: 20, textDecoration: 'inherit' }}
      >
        <Button appearance="primary">Go to LinkedIn</Button>
      </a>
    </Pane>
  );
}

export default NotLoggedInLinkedIn;
