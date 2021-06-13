import React, { useState, useEffect } from 'react';
import { Text } from 'evergreen-ui';
import icon from '../assets/img/icon.svg';
import './Loading.css';

function Loading({ type }) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (type === 'init') {
      const timer = setTimeout(() => setShowText(true), 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="loadingContainer">
      <div className="loadingIcon">
        <img src={icon} alt="loading" />
      </div>
      {showText && (
        <Text maxWidth={500} color="muted" size={600} marginTop={50}>
          This might take sometime. Please bear with us as we organize all your
          connections.
        </Text>
      )}
    </div>
  );
}

export default Loading;
