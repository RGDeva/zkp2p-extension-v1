import React, { ReactElement } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '@theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { fadeIn, scaleIn, DotsLoader } from '@components/XRampShared';

import xrampLogo from '../../assets/img/xramp-logo-full.png';

export default function XRampLogin(): ReactElement {
  const { login, isLoading } = useAuth();

  return (
    <Wrapper>
      <ProofGridBg />

      {/* Ambient cyan glow behind card */}
      <GlowOrb />

      <Card>
        <LogoWrap>
          <LogoImg src={xrampLogo} alt="XRamp" />
        </LogoWrap>

        <Headline>Sign in to XRamp</Headline>
        <Subline>
          Use the same account as the XRamp web app — your activity syncs automatically.
        </Subline>

        {isLoading ? (
          <DotsLoader dots={3} />
        ) : (
          <>
            <LoginButton onClick={login}>
              <LoginBtnDot />
              <LoginBtnText>Continue with Email or Wallet</LoginBtnText>
            </LoginButton>

            <Divider>
              <DividerLine /><DividerText>or</DividerText><DividerLine />
            </Divider>

            <OpenAppLink onClick={() => chrome.tabs.create({ url: 'https://xramp-app.vercel.app' })}>
              Open XRamp App
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </OpenAppLink>
          </>
        )}

        <FootNote>
          P2P crypto settlement · Zero-knowledge proofs
        </FootNote>
      </Card>
    </Wrapper>
  );
}

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const ProofGridBg = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, ${colors.border} 1px, transparent 1px),
    linear-gradient(to bottom, ${colors.border} 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.04;
  pointer-events: none;
`;

const GlowOrb = styled.div`
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(25,197,214,0.12) 0%, transparent 70%);
  pointer-events: none;
  animation: ${float} 4s ease-in-out infinite;
`;

const Card = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 2.5rem);
  max-width: 340px;
  padding: 2rem 1.75rem;
  border-radius: 1.25rem;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  box-shadow: 0 24px 64px -16px rgba(0,0,0,0.6);
  animation: ${scaleIn} 0.3s ease-out both;
  gap: 0;
`;

const LogoWrap = styled.div`
  margin-bottom: 1.75rem;
  animation: ${fadeIn} 0.4s ease-out both;
`;

const LogoImg = styled.img`
  height: 30px;
  width: auto;
  object-fit: contain;
`;

const Headline = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.foreground};
  margin: 0 0 0.5rem;
  text-align: center;
  letter-spacing: -0.3px;
  animation: ${fadeIn} 0.4s ease-out 0.05s both;
`;

const Subline = styled.p`
  font-size: 13px;
  color: ${colors.subtitleColor};
  text-align: center;
  line-height: 1.5;
  margin: 0 0 1.75rem;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

/* ---- InteractiveHoverButton style ---- */
const LoginButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  border-radius: 0.75rem;
  border: 1px solid rgba(25,197,214,0.35);
  background: transparent;
  color: ${colors.foreground};
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
  transition: color 0.3s ease, border-color 0.3s ease;
  animation: ${fadeIn} 0.4s ease-out 0.15s both;

  &:hover {
    color: ${colors.primaryForeground};
    border-color: ${colors.primary};
  }

  &:hover ${() => LoginBtnDot} {
    width: 200%;
    padding-bottom: 200%;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoginBtnDot = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  padding-bottom: 0;
  border-radius: 50%;
  background: ${colors.primary};
  transition: width 0.4s ease, padding-bottom 0.4s ease;
  z-index: 0;
`;

const LoginBtnText = styled.span`
  position: relative;
  z-index: 1;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  margin: 1rem 0;
  animation: ${fadeIn} 0.4s ease-out 0.2s both;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: ${colors.border};
`;

const DividerText = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
`;

const OpenAppLink = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: none;
  border: none;
  color: ${colors.subtitleColor};
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.15s;
  padding: 0;
  animation: ${fadeIn} 0.4s ease-out 0.25s both;

  &:hover { color: ${colors.primary}; }
`;

const FootNote = styled.p`
  margin: 1.5rem 0 0;
  font-size: 10px;
  color: ${colors.mutedForeground};
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out 0.3s both;
`;
