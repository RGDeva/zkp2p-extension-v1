import React, { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import styled, { keyframes } from 'styled-components';
import { colors } from '@theme/colors';

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
      {/* Top Nav */}
      <TopNav>
        <LogoRow>
          <LogoMark>X</LogoMark>
          <LogoText>XRamp</LogoText>
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
        {/* Welcome Card */}
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

        {/* Action Grid — matches Peer extension layout */}
        <ActionGrid>
          <ActionCard onClick={() => navigate('/buy')}>
            <ActionIconWrapper $variant="buy">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </ActionIconWrapper>
            <ActionLabel>BUY</ActionLabel>
          </ActionCard>

          <ActionCard onClick={() => navigate('/sell')}>
            <ActionIconWrapper $variant="sell">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </ActionIconWrapper>
            <ActionLabel>SELL</ActionLabel>
          </ActionCard>

          <ActionCard onClick={() => navigate('/send')}>
            <ActionIconWrapper $variant="send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </ActionIconWrapper>
            <ActionLabel>SEND</ActionLabel>
          </ActionCard>
        </ActionGrid>

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

        {/* Powered by footer */}
        <FooterText>
          Minimal data · Proof-based settlement
        </FooterText>
      </ScrollArea>
    </PageWrapper>
  );
}

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  50%      { box-shadow: 0 0 20px 2px rgba(16, 185, 129, 0.15); }
`;

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const TopNav = styled.nav`
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

const LogoMark = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: ${colors.primary};
  color: #000;
  font-weight: 900;
  font-size: 16px;
  letter-spacing: -1px;
`;

const LogoText = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.titleColor};
  letter-spacing: -0.5px;
`;

const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  background: transparent;
  color: ${colors.subtitleColor};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${colors.card};
    color: ${colors.titleColor};
    border-color: ${colors.primary};
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${colors.defaultBorderColor};
  flex-shrink: 0;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${colors.defaultBorderColor};
    border-radius: 4px;
  }
`;

const WelcomeCard = styled.div`
  background: ${colors.card};
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 16px;
  padding: 1.25rem;
  animation: ${fadeIn} 0.35s ease both;
  transition: box-shadow 0.3s ease;

  &:hover {
    animation: ${glowPulse} 2s ease infinite;
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
  color: ${colors.titleColor};
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
  font-size: 28px;
  font-weight: 700;
  color: ${colors.titleColor};
  letter-spacing: -1px;
`;

const RefreshIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${colors.mutedForeground};
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: ${colors.primary};
  }
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  animation: ${fadeIn} 0.35s ease 0.08s both;
`;

const ActionCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: 16px;
  border: 1px solid ${colors.defaultBorderColor};
  background: ${colors.card};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: ${colors.selectorHover};
    border-color: ${colors.selectorHoverBorder};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:nth-child(3) {
    grid-column: 1 / -1;
  }
`;

const ActionIconWrapper = styled.div<{ $variant: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: ${({ $variant }: { $variant: string }) => {
    switch ($variant) {
      case 'buy': return colors.primary;
      case 'sell': return '#f59e0b';
      case 'send': return '#8b5cf6';
      default: return colors.primary;
    }
  }};
  background: ${({ $variant }: { $variant: string }) => {
    switch ($variant) {
      case 'buy': return colors.primaryMuted;
      case 'sell': return 'rgba(245,158,11,0.12)';
      case 'send': return 'rgba(139,92,246,0.12)';
      default: return colors.primaryMuted;
    }
  }};
`;

const ActionLabel = styled.span`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: ${colors.titleColor};
`;

const SectionHeader = styled.h3`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: ${colors.mutedForeground};
  margin: 0.25rem 0 0;
  animation: ${fadeIn} 0.35s ease 0.16s both;
`;

const ActivityCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  background: ${colors.card};
  border: 1px solid ${colors.defaultBorderColor};
  gap: 0.5rem;
  animation: ${fadeIn} 0.35s ease 0.24s both;
`;

const ActivityEmptyIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  opacity: 0.6;
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
  animation: ${fadeIn} 0.35s ease 0.32s both;
`;
