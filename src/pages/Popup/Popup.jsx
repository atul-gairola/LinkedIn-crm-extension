import React, { useEffect, useState } from 'react';

import Login from '../Login/Login';

import HomePopup from '../HomePopup/HomePopup';

const Popup = () => {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('userSignedIn', (resp) => {
      const { userSignedIn } = resp;

      if (userSignedIn) {
        setUserLoggedIn(true);
      } else {
        setUserLoggedIn(false);
      }
    });
  });

  return !userLoggedIn ? (
    <Login setUserLoggedIn={setUserLoggedIn} />
  ) : (
    <HomePopup />
  );

};

export default Popup;
