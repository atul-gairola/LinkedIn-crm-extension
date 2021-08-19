import React, { useEffect, useState } from 'react';

import Login from './Login';
import Dashboard from './Dashboard';

function Wrapper() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('token', (resp) => {
      const { token } = resp;
      console.log('User signed in: ', token);
      if (token) {
        setUserLoggedIn(true);
      } else {
        setUserLoggedIn(false);
      }
    });
  });
  return userLoggedIn ? (
    <Dashboard setUserLoggedIn={setUserLoggedIn} />
  ) : (
    <Login setUserLoggedIn={setUserLoggedIn} />
  );
}

export default Wrapper;
