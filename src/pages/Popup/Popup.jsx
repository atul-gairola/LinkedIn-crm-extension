import React, { useEffect, useState } from 'react';

import Auth from '../Auth/Auth';

import HomePopup from '../HomePopup/HomePopup';

const Popup = () => {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get('token', (resp) => {
      const { token } = resp;
      console.log(token);
      if (token) {
        setUserLoggedIn(true);
      } else {
        setUserLoggedIn(false);
      }
    });
  }, []);

  return !userLoggedIn ? <Auth setUserLoggedIn={setUserLoggedIn} /> : <HomePopup />;
};

export default Popup;
