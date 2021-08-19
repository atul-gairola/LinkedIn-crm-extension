import React, { useState } from 'react';
import {
  Button,
  Text,
  Pane,
  TextInputField,
  Strong,
  toaster,
} from 'evergreen-ui';
import axios from 'axios';

function Signup({ setFormType, setUserLoggedIn }) {
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

  const handleSignup = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        // `http://localhost:8000/auth/signup`,
        "https://quiet-brook-98204.herokuapp.com/auth/signup",
        credentials
      );
      chrome.storage.sync.set({ token: data.jwt});
      chrome.storage.sync.set({ currentUser: data.userId});
      setUserLoggedIn(true)
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
        <Strong>Signup to continue</Strong>
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
        onClick={handleSignup}
        isLoading={loading}
      >
        Signup
      </Button>
      <Pane
        marginTop={10}
        cursor="pointer"
        onClick={() => setFormType('login')}
      >
        <Text>Already have an account ? Login</Text>
      </Pane>
    </Pane>
  );
}

export default Signup;
