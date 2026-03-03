import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import SidePanel from './SidePanel';
import './index.scss';

const container = document.getElementById('app-container');
const root = createRoot(container!);

root.render(
  <HashRouter>
    <SidePanel />
  </HashRouter>
);
