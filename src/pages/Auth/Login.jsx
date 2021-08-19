import React, { useState } from 'react';
import axios from 'axios';
import {
  Button,
  Text,
  Pane,
  TextInputField,
  Strong,
  toaster,
} from 'evergreen-ui';

function Login({ setFormType, setUserLoggedIn }) {
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
        // `http://localhost:8000/auth/login`,
        "https://quiet-brook-98204.herokuapp.com/auth/login",
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
    <Pane textAlign="left" display="block" width="100%" padding="10px">
      <Pane textAlign="center" marginBottom={20}>
        <Strong>Login to continue</Strong>
      </Pane>
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
        isLoading={loading}
      >
        Login
      </Button>
      <Pane
        onClick={() => setFormType('signup')}
        marginTop={10}
        cursor="pointer"
      >
        <Text>Don't have an account ? Signup</Text>
      </Pane>
    </Pane>
  );
}

export default Login;
