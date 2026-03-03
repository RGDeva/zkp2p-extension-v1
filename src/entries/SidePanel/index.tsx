import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { PrivyWrapper } from '../../providers/PrivyProvider';
import { AuthProvider } from '../../contexts/AuthContext';
import SidePanel from './SidePanel';
import './index.scss';

const container = document.getElementById('app-container');
const root = createRoot(container!);

root.render(
  <PrivyWrapper>
    <AuthProvider>
      <HashRouter>
        <SidePanel />
      </HashRouter>
    </AuthProvider>
  </PrivyWrapper>
);
