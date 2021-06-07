import React from 'react';
import { Avatar, Pane, Heading } from 'evergreen-ui';

import styles from './Header.css';

function Header({ fullName, profilePicture }) {
  return (
    <header className={styles.header}>
      <Pane
        display="flex"
        padding={10}
        background="#fff"
        borderBottom="1px solid #000"
        boxShadow=""
        borderRadius={3}
      >
        <Pane flex={1} alignItems="center" display="flex">
          <Heading size={600}>LinkedIn CRM</Heading>
        </Pane>
        <Pane>
          <Avatar name={fullName} size={40} src={profilePicture}></Avatar>
        </Pane>
      </Pane>
    </header>
  );
}

export default Header;
