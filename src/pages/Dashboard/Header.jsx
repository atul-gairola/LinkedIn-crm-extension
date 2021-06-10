import React from 'react';
import { Avatar, Pane, Heading, Text } from 'evergreen-ui';

import './Header.css';
import logo from '../../assets/img/icon.svg';

function Header({ user, retConnections }) {
  const { fullName, profilePicture, totalConnections } = user;

  return (
    <header>
      <Pane
        display="flex"
        padding={10}
        paddingX={30}
        background="#fff"
        boxShadow="0px 4px 20px rgba(0,0,0,0.06)"
      >
        <Pane flex={1} alignItems="center" display="flex">
          <img style={{ width: 40, marginRight: 20 }} src={logo} alt="logo" />
          <Heading is="h3" fontWeight="bold">
            LinkedIn CRM
          </Heading>
        </Pane>
        <Pane
          display="grid"
          gridTemplateColumns="1fr auto"
          gridGap={50}
          alignItems="center"
        >
          <Pane
            display="grid"
            gridTemplateColumns="auto auto"
            gridGap={30}
            aligntItems="center"
          >
            <Pane>
              <Text whiteSpace="nowrap" size={300}>
                Last Sync
              </Text>
              <br />
              <Text whiteSpace="nowrap" size={200} fontWeight="bold">
                9 / Jun / 2021 5:45 PM
              </Text>
            </Pane>
            <Pane>
              <Text whiteSpace="nowrap" size={300}>
                Updated connections
              </Text>
              <br />
              <Text whiteSpace="nowrap" size={200} fontWeight="bold">
                {retConnections} / {totalConnections}
              </Text>
            </Pane>
          </Pane>
          <Avatar
            name={fullName}
            size={40}
            color="purple"
            src={profilePicture}
            cursor="pointer"
          ></Avatar>
        </Pane>
      </Pane>
    </header>
  );
}

export default Header;
