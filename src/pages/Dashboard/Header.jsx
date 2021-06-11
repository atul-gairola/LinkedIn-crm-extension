import React from 'react';
import { Avatar, Pane, Heading, Text, Tooltip } from 'evergreen-ui';

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
              <Tooltip content="Last synced">
                <Text whiteSpace="nowrap" size={200} fontWeight="bold">
                  9 / Jun / 2021 5:45 PM
                </Text>
              </Tooltip>
            </Pane>
            <Pane>
              <Text whiteSpace="nowrap" size={300}>
                Updated connections
              </Text>
              <br />
              <Text whiteSpace="nowrap" size={200} fontWeight="bold">
                <Tooltip content="Retrieved connections">
                  <span style={{ color: '#5153ff' }}>{retConnections}</span>
                </Tooltip>{' '}
                /{' '}
                <Tooltip content="Total connections">
                  <span> {totalConnections} </span>
                </Tooltip>
              </Text>
            </Pane>
          </Pane>
          <Tooltip content={fullName}>
            <Avatar
              // name={fullName}
              size={40}
              color="purple"
              src={profilePicture}
              cursor="pointer"
            >
              {fullName}
            </Avatar>
          </Tooltip>
        </Pane>
      </Pane>
    </header>
  );
}

export default Header;
