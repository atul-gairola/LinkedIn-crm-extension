import React, { useState } from 'react';
import {
  Button,
  Text,
  Image,
  Pane,
  Heading,
  TextInputField,
} from 'evergreen-ui';

import logo from '../../assets/img/icon.svg';
import googleLogo from '../../assets/img/google-logo.svg';

function Login({ setUserLoggedIn }) {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  function GoogleIcon() {
    return <Image src={googleLogo} alt="google logo" />;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleLogin = async () => {
    setLoading(true);
    // chrome.runtime.sendMessage({ action: 'login' }, (res) => {
    //   console.log(res);
    //   if (res.status === 'success') {
    //     setUserLoggedIn(true);
    //   }
    //   setLoading(false);
    // });
    setLoading(false);
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
      {/* <Text>
        Manage and organize your connections in a faster and more elegant way.
      </Text> */}
      <Pane textAlign="left" display="block" width="100%" padding="10px">
        <TextInputField
          label="Email"
          placeholder="Enter your email"
          onChange={handleChange}
          name="email"
        />
        <TextInputField
          label="Password"
          placeholder="Enter your password"
          type="password"
          name="password"
          onChange={handleChange}
        />
        <Button
          appearance="primary"
          position="relative"
          left="50%"
          transform="translateX(-50%)"
          onClick={handleLogin}
        >
          Login
        </Button>
      </Pane>
      <Text marginTop={10} size={300} color="muted">{`${
        chrome.runtime.getManifest().name
      } - v${chrome.runtime.getManifest().version}`}</Text>
    </Pane>
  );
}

export default Login;
