import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import styled from 'styled-components';
import { colors } from '@theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { DotsLoader } from '@components/XRampShared';
import XRampHome from '../../pages/XRampHome';
import XRampBuy from '../../pages/XRampBuy';
import XRampSell from '../../pages/XRampSell';
import XRampSend from '../../pages/XRampSend';
import XRampProofs from '../../pages/XRampProofs';
import XRampLogin from '../../pages/XRampLogin';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <LoadingScreen>
        <DotsLoader dots={4} />
      </LoadingScreen>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const SidePanel = () => {
  return (
    <AppContainer>
      <Routes>
        <Route path="/login" element={<XRampLogin />} />
        <Route path="/home" element={<AuthGuard><XRampHome /></AuthGuard>} />
        <Route path="/buy" element={<AuthGuard><XRampBuy /></AuthGuard>} />
        <Route path="/sell" element={<AuthGuard><XRampSell /></AuthGuard>} />
        <Route path="/send" element={<AuthGuard><XRampSend /></AuthGuard>} />
        <Route path="/proofs" element={<AuthGuard><XRampProofs /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AppContainer>
  );
};

const LoadingScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
`;

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

export default SidePanel;
