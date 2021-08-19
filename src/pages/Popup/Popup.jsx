import React, { useEffect, useState } from 'react';

import Auth from '../Auth/Auth';

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

  return !userLoggedIn ? <Auth /> : <HomePopup />;
};

export default Popup;
