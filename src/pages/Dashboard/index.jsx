import React from 'react';
import { render } from 'react-dom';

import Dashboard from './Dashboard';
import './index.css';

render(<Dashboard />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
