import React, { useState } from 'react';
import { Button, Text, Pane, TextInputField, Strong } from 'evergreen-ui';

function Login({ setFormType }) {
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
