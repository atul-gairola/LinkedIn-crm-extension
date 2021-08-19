import React, { useState } from 'react';
import { Pane, Button, Text, Image, TextInputField } from 'evergreen-ui';
import axios from "axios";
import logo from '../../assets/img/icon.svg';

function Login({ setUserLoggedIn }) {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `http://localhost:8000/auth/login`,
        credentials
      );

      chrome.storage.sync.set({ token: data.jwt });
      chrome.storage.sync.set({ currentUser: data.userId });
      setUserLoggedIn(true);
    } catch (e) {
      console.log(e);
      if (e.response) {
        toaster.danger(e.response.data.message);
      }
    }
    setLoading(false);
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
      <Pane width="60%" display="block" textAlign="left">
        <TextInputField
          label="Email"
          name="email"
          onChange={handleChange}
          placeholder="Enter your email"
        />
        <TextInputField
          label="Password"
          name="password"
          onChange={handleChange}
          type="password"
          placeholder="Enter your password"
        />
        <Button
          appearance="primary"
          position="relative"
          left="50%"
          size="large"
          transform="translateX(-50%)"
          onClick={handleLogin}
          isLoading={loading}
        >
          Login
        </Button>
      </Pane>
    </Pane>
  );
}

export default Login;
