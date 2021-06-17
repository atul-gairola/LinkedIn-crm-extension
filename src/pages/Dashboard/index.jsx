import React from 'react';
import { render } from 'react-dom';

import Wrapper from './Wrapper';
import './index.css';

render(<Wrapper />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
