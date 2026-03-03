import React, { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import styled, { keyframes } from 'styled-components';
import { colors } from '@theme/colors';
import { fadeIn, shimmerSweep, AnimatedGradientSpan } from '@components/XRampShared';

import xrampLogo from '../../assets/img/xramp-logo-full.png';

const XRAMP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://xramp-app.vercel.app'
    : 'http://localhost:5173';

export default function XRampHome(): ReactElement {
  const navigate = useNavigate();

  const handleOpenApp = () => {
    chrome.tabs.create({ url: XRAMP_URL });
  };

  return (
    <PageWrapper>
      {/* Subtle proof-grid bg */}
      <ProofGrid />

      {/* Top Nav */}
      <TopNav>
        <LogoRow>
          <LogoImg src={xrampLogo} alt="XRamp" />
        </LogoRow>
        <SettingsButton onClick={handleOpenApp} title="Open XRamp App">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </SettingsButton>
      </TopNav>

      <Divider />

      <ScrollArea>
        {/* Welcome Card — cyan glow on hover */}
        <WelcomeCard>
          <WelcomeRow>
            <div>
              <WelcomeTitle>Welcome to XRamp</WelcomeTitle>
              <WelcomeSubtitle>P2P Crypto On/Off-Ramp</WelcomeSubtitle>
            </div>
          </WelcomeRow>
          <BalanceRow>
            <BalanceAmount>$0</BalanceAmount>
            <RefreshIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </RefreshIcon>
          </BalanceRow>
        </WelcomeCard>

        {/* Action Grid — matches XRamp Home.tsx */}
        <ActionGrid>
          <ActionCard onClick={() => navigate('/buy')} $delay={0.1}>
            <ActionIconWrapper $variant="buy">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </ActionIconWrapper>
            <ActionLabel>Buy</ActionLabel>
          </ActionCard>

          <ActionCard onClick={() => navigate('/sell')} $delay={0.15}>
            <ActionIconWrapper $variant="sell">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </ActionIconWrapper>
            <ActionLabel>Sell</ActionLabel>
          </ActionCard>
        </ActionGrid>

        {/* Send — full-width card like Peer's PROOFS */}
        <SendCard onClick={() => navigate('/send')}>
          <ActionIconWrapper $variant="send" style={{ width: 36, height: 36 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </ActionIconWrapper>
          <ActionLabel>Send</ActionLabel>
        </SendCard>

        {/* Activity Section */}
        <SectionHeader>ACTIVITY</SectionHeader>
        <ActivityCard>
          <ActivityEmptyIcon>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.mutedForeground} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </ActivityEmptyIcon>
          <ActivityEmptyText>No activity yet</ActivityEmptyText>
          <ActivityEmptySubtext>Your buys and sells will show up here</ActivityEmptySubtext>
        </ActivityCard>

        {/* Footer */}
        <FooterText>
          Minimal data · <AnimatedGradientSpan>Proof-based settlement</AnimatedGradientSpan>
        </FooterText>
      </ScrollArea>
    </PageWrapper>
  );
}

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

const cyanGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(25,197,214,0); }
  50%      { box-shadow: 0 0 24px 2px rgba(25,197,214,0.15); }
`;

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const PageWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const ProofGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, ${colors.border} 1px, transparent 1px),
    linear-gradient(to bottom, ${colors.border} 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
`;

const TopNav = styled.nav`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  flex-shrink: 0;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LogoImg = styled.img`
  height: 28px;
  width: auto;
  object-fit: contain;
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.75rem;
  border: 1px solid ${colors.border};
  background: transparent;
  color: ${colors.subtitleColor};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.secondary};
    color: ${colors.foreground};
    border-color: ${colors.primary};
    box-shadow: 0 0 12px -3px rgba(25,197,214,0.25);
  }
`;

const Divider = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 1px;
  background: ${colors.border};
  flex-shrink: 0;
`;

const ScrollArea = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 4px; }
`;

const WelcomeCard = styled.div`
  position: relative;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 1.25rem;
  padding: 1.5rem;
  animation: ${fadeIn} 0.5s ease-out both;
  box-shadow: 0 8px 32px -8px rgba(0,0,0,0.5);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  overflow: hidden;

  &:hover {
    border-color: rgba(25,197,214,0.2);
    animation: ${cyanGlow} 2s ease infinite;
  }

  /* shimmer sweep */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(25,197,214,0.04) 50%, transparent 100%);
    transform: translateX(-100%);
    pointer-events: none;
  }
  &:hover::after {
    animation: ${shimmerSweep} 2s ease-in-out;
  }
`;

const WelcomeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const WelcomeTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${colors.foreground};
`;

const WelcomeSubtitle = styled.div`
  font-size: 12px;
  color: ${colors.subtitleColor};
  margin-top: 2px;
`;

const BalanceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BalanceAmount = styled.span`
  font-size: 32px;
  font-weight: 700;
  color: ${colors.foreground};
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
`;

const RefreshIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${colors.mutedForeground};
  cursor: pointer;
  transition: color 0.2s, transform 0.3s;

  &:hover {
    color: ${colors.primary};
    transform: rotate(180deg);
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const ActionCard = styled.button<{ $delay?: number }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: 1.25rem;
  border: 1px solid ${colors.border};
  background: ${colors.card};
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  box-shadow: 0 8px 32px -8px rgba(0,0,0,0.5);
  animation: ${fadeIn} 0.5s ease-out both;
  animation-delay: ${(p: { $delay?: number }) => p.$delay ?? 0}s;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.selectorHover};
    border-color: ${colors.selectorHoverBorder};
    transform: translateY(-2px);
    box-shadow: 0 12px 36px -8px rgba(0,0,0,0.6);
  }

  &:active { transform: translateY(0); }

  /* shimmer on hover */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(25,197,214,0.04) 50%, transparent 100%);
    transform: translateX(-100%);
    pointer-events: none;
  }
  &:hover::after {
    animation: ${shimmerSweep} 1.5s ease-in-out;
  }
`;

const SendCard = styled(ActionCard)`
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  animation-delay: 0.2s;
`;

const ActionIconWrapper = styled.div<{ $variant: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 0.75rem;
  color: ${({ $variant }: { $variant: string }) => {
    switch ($variant) {
      case 'buy': return colors.successGreen;
      case 'sell': return colors.primary;
      case 'send': return colors.indigoAccent;
      default: return colors.primary;
    }
  }};
  background: ${({ $variant }: { $variant: string }) => {
    switch ($variant) {
      case 'buy': return 'rgba(34,197,94,0.1)';
      case 'sell': return colors.primaryMuted;
      case 'send': return 'rgba(99,102,241,0.1)';
      default: return colors.primaryMuted;
    }
  }};
`;

const ActionLabel = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.foreground};
`;

const SectionHeader = styled.h3`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: ${colors.mutedForeground};
  margin: 0.5rem 0 0;
  animation: ${fadeIn} 0.5s ease-out 0.25s both;
`;

const ActivityCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  gap: 0.5rem;
  animation: ${fadeIn} 0.5s ease-out 0.3s both;
  box-shadow: 0 8px 32px -8px rgba(0,0,0,0.5);
`;

const ActivityEmptyIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  opacity: 0.5;
`;

const ActivityEmptyText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.subtitleColor};
`;

const ActivityEmptySubtext = styled.span`
  font-size: 12px;
  color: ${colors.mutedForeground};
`;

const FooterText = styled.p`
  text-align: center;
  font-size: 10px;
  color: ${colors.mutedForeground};
  padding: 0.5rem 0;
  margin: 0;
  animation: ${fadeIn} 0.5s ease-out 0.35s both;
`;
