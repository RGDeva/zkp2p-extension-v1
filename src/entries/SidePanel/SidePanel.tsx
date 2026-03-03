import React, { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router';
import styled, { keyframes, css } from 'styled-components';

import { colors } from '@theme/colors';
import XRampHome from '../../pages/XRampHome';
import XRampBuy from '../../pages/XRampBuy';
import XRampSell from '../../pages/XRampSell';
import XRampSend from '../../pages/XRampSend';

const XRAMP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://xramp-app.vercel.app'
    : 'http://localhost:5173';

const SidePanel = () => {
  return (
    <AppContainer>
      <Routes>
        <Route path="/home" element={<XRampHome />} />
        <Route path="/buy" element={<XRampBuy />} />
        <Route path="/sell" element={<XRampSell />} />
        <Route path="/send" element={<XRampSend />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </AppContainer>
  );
};

// ---------------------------------------------------------------------------
// Root container
// ---------------------------------------------------------------------------

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: ${colors.appBackground};
  font-family: 'Satoshi', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: ${colors.titleColor};
`;

export { XRAMP_URL };
export default SidePanel;
