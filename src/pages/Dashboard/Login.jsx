import React from 'react';
import { Pane, Button, Text, Image } from 'evergreen-ui';

import logo from '../../assets/img/icon.svg';
import googleLogo from '../../assets/img/google-logo.svg';

function Login({ setUserLoggedIn }) {
  function GoogleIcon() {
    return <Image src={googleLogo} alt="google-logo" />;
  }

  const handleLogin = () => {
    chrome.runtime.sendMessage({ action: 'login' }, (res) => {
      console.log(res);
      if (res.status === 'success') {
        setUserLoggedIn(true);
      }
    });
  };

  return (
    <Pane
      display="grid"
      justifyItems="center"
      textAlign="center"
      gridGap={20}
      placeContent="center"
      height="100vh"
    >
      <Image width={80} src={logo} alt="logo" />
      <Text size={600} width={600}>
        You are not logged in. Please login with your google account to view
        your dashboard.
      </Text>
      <Button
        onClick={handleLogin}
        iconBefore={GoogleIcon}
        size="large"
        appearance="primary"
      >
        Login with google
      </Button>
    </Pane>
  );
}

export default Login;
