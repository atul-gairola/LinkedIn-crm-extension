import React from 'react';
import { Button, Text, Image, Pane } from 'evergreen-ui';

import logo from '../../assets/img/icon.svg';

function Login() {
  return (
    <Pane>
      <Image width={50} src={logo} alt="logo" />
      <Text>
        Manage and organize your connections in a faster and more elegant way.
      </Text>
      <Button>Login with google</Button>
    </Pane>
  );
}

export default Login;
