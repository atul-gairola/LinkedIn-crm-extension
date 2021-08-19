import React, { useState } from 'react';
import { Text, Image, Pane, Heading } from 'evergreen-ui';

import logo from '../../assets/img/icon.svg';
import Login from './Login';
import Signup from './Signup';

function Auth() {
  const [formType, setFormType] = useState('login');

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
      {formType === 'login' ? (
        <Login setFormType={setFormType} />
      ) : (
        <Signup setFormType={setFormType} />
      )}
      <Text marginTop={10} size={300} color="muted">{`${
        chrome.runtime.getManifest().name
      } - v${chrome.runtime.getManifest().version}`}</Text>
    </Pane>
  );
}

export default Auth;
