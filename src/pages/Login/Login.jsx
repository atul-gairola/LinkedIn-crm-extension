import React from 'react';
import { Button, Text, Image, Pane, Heading } from 'evergreen-ui';

import logo from '../../assets/img/icon.svg';
import googleLogo from '../../assets/img/google-logo.svg';

function Login() {
  function GoogleIcon() {
    return <Image src={googleLogo} alt="google logo" />;
  }

  return (
    <Pane
      display="grid"
      padding={10}
      textAlign="center"
      height="100%"
      justifyItems="center"
      gridGap={20}
    >
      <Image width={50} src={logo} alt="logo" />
      <Heading marginBottom={10} is="h1">
        LINKEDIN CRM
      </Heading>
      <Text>
        Manage and organize your connections in a faster and more elegant way.
      </Text>
      <Button iconBefore={GoogleIcon} size="large" appearance="primary">
        Login with google
      </Button>
      <Text marginTop={10} size={300} color="muted">{`${
        chrome.runtime.getManifest().name
      } - v${chrome.runtime.getManifest().version}`}</Text>
    </Pane>
  );
}

export default Login;
