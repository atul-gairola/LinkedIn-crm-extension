import React, { useEffect, useState } from 'react';

import Login from './Login';
import Dashboard from './Dashboard';

function Wrapper() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('userSignedIn', (resp) => {
      const { userSignedIn } = resp;
      console.log('User signed in: ', userSignedIn);
      if (userSignedIn) {
        setUserLoggedIn(true);
      } else {
        setUserLoggedIn(false);
      }
    });
  });
  return userLoggedIn ? (
    <Dashboard userLoggedIn={userLoggedIn} setUserLoggedIn={setUserLoggedIn} />
  ) : (
    <Login setUserLoggedIn={setUserLoggedIn} />
  );
}

export default Wrapper;
