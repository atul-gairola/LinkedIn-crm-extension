import React, { useState, useEffect } from 'react';
import { Text } from 'evergreen-ui';
import icon from '../assets/img/icon.svg';
import './Loading.css';

function Loading({ type }) {
  const [showText, setShowText] = useState(false);
  const [text, setText] = useState(0);

  useEffect(() => {
    if (type === 'init') {
      const timer1 = setTimeout(() => setShowText(true), 6000);
      const timer2 = setTimeout(() => setText(1), 35000);
      const timer3 = setTimeout(() => setText(2), 65000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, []);

  return (
    <div className="loadingContainer">
      <div className="loadingIcon">
        <img src={icon} alt="loading" />
      </div>
      {showText && (
        <Text maxWidth={500} color="muted" size={600} marginTop={50}>
          {text === 0 &&
            'This might take sometime. Please bear with us as we organize all your connections.'}
          {text === 1 &&
            "Wow you have a huge network! We are organising them for you. Don't worry this is a one time thing only."}
          {text === 2 &&
            "Just a little more and we're there. Remeber this process is only a one time thing."}
        </Text>
      )}
    </div>
  );
}

export default Loading;
