import React from 'react';
import icon from '../assets/img/icon.svg';
import './Loading.css';

function Loading() {
  return (
    <div className="loadingContainer">
      <div className="loadingIcon">
        <img src={icon} alt="loading" />
      </div>
    </div>
  );
}

export default Loading;
