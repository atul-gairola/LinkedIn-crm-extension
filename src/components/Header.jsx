import React from 'react';
import {
  Avatar,
  Pane,
  Heading,
  Text,
  Tooltip,
  Popover,
  Menu,
  LogOutIcon,
  Position,
  toaster,
  Tab,
} from 'evergreen-ui';

import './Header.css';
import logo from '../assets/img/icon.svg';
import { formatTimeStamp } from '../utils';

function Header({
  user,
  retConnections,
  setUserLoggedIn,
  selectedTab,
  setSelectedTab,
}) {
  const { fullName, profilePicture, totalConnections, lastSync } = user;

  const tabs = ['Connections', 'Tags'];

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
          <Heading is="h3" marginRight={50} fontWeight="bold">
            LinkedIn CRM
          </Heading>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              id={tab}
              onSelect={() => setSelectedTab(tab)}
              isSelected={selectedTab === tab}
            >
              {tab}
            </Tab>
          ))}
        </Pane>
        <Pane
          display="grid"
          gridTemplateColumns="1fr auto"
          gridGap={50}
          alignItems="center"
        >
          <Pane
            display="grid"
            gridTemplateColumns="auto auto auto"
            gridGap={30}
            alignItems="center"
          >
            <Pane>
              <Text whiteSpace="nowrap" size={300}>
                Last Sync
              </Text>
              <br />
              <Tooltip content="Last synced">
                <Text whiteSpace="nowrap" size={300} fontWeight="bold">
                  {formatTimeStamp(new Date(lastSync)).date +
                    ' ' +
                    formatTimeStamp(new Date(lastSync)).time}
                </Text>
              </Tooltip>
            </Pane>
            <Pane>
              <Text whiteSpace="nowrap" size={300}>
                Collected connections
              </Text>
              <br />
              <Text whiteSpace="nowrap" size={300} fontWeight="bold">
                <Tooltip content="Collected connections">
                  <span style={{ color: '#5153ff' }}>
                    {user.collectedConnections}
                  </span>
                </Tooltip>{' '}
                /{' '}
                <Tooltip content="Total connections">
                  <span> {user.totalConnections} </span>
                </Tooltip>
              </Text>
            </Pane>
            <Pane>
              <Text whiteSpace="nowrap" size={300}>
                Updated connections
              </Text>
              <br />
              <Text whiteSpace="nowrap" size={300} fontWeight="bold">
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
            <Popover
              position={Position.BOTTOM_LEFT}
              content={({ close }) => (
                <Menu>
                  <Menu.Group>
                    <Menu.Item
                      onSelect={() => {
                        console.log('logout');
                        chrome.runtime.sendMessage(
                          { action: 'logout' },
                          (resp) => {
                            if (resp.status === 'error') {
                              toaster.danger('Error in logout', {
                                description: resp.error,
                                duration: 6,
                              });
                              return;
                            }
                            if (resp.status === 'success') {
                              setUserLoggedIn(false);
                            }
                          }
                        );
                      }}
                      icon={LogOutIcon}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Group>
                </Menu>
              )}
            >
              <Avatar
                // name={fullName}
                size={40}
                color="purple"
                src={profilePicture}
                cursor="pointer"
              >
                {fullName}
              </Avatar>
            </Popover>
          </Tooltip>
        </Pane>
      </Pane>
    </header>
  );
}

export default Header;
