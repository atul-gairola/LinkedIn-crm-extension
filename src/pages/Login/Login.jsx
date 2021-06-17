import React, { useState } from 'react';
import { Button, Text, Image, Pane, Heading } from 'evergreen-ui';

import logo from '../../assets/img/icon.svg';
import googleLogo from '../../assets/img/google-logo.svg';

function Login({ setUserLoggedIn }) {
  const [loading, setLoading] = useState(false);

  function GoogleIcon() {
    return <Image src={googleLogo} alt="google logo" />;
  }

  const handleLogin = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'login' }, (res) => {
      console.log(res);
      if (res.status === 'success') {
        setUserLoggedIn(true);
      }
      setLoading(false);
    });
  };

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
      <Button
        onClick={handleLogin}
        iconBefore={GoogleIcon}
        size="large"
        isLoading={loading}
        appearance="primary"
      >
        Login with google
      </Button>
      <Text marginTop={10} size={300} color="muted">{`${
        chrome.runtime.getManifest().name
      } - v${chrome.runtime.getManifest().version}`}</Text>
    </Pane>
  );
}

export default Login;
