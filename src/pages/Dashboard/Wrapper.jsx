import React, { useEffect, useState } from 'react';

import Login from './Login';
import Dashboard from './Dashboard';
import Loading from '../../components/Loading';

function Wrapper() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.sync.get('token', (resp) => {
      const { token } = resp;
      console.log('User signed in: ', token);
      if (token) {
        setUserLoggedIn(true);
      } else {
        setUserLoggedIn(false);
      }

      setLoading(false);
    });
  }, []);
  return loading ? (
    <Loading />
  ) : userLoggedIn ? (
    <Dashboard setUserLoggedIn={setUserLoggedIn} />
  ) : (
    <Login setUserLoggedIn={setUserLoggedIn} />
  );
}

export default Wrapper;
