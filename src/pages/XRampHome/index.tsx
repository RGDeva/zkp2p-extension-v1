import React, { ReactElement, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import styled, { keyframes } from 'styled-components';
import { colors } from '@theme/colors';
import { fadeIn, scaleIn, shimmerSweep, AnimatedGradientSpan } from '@components/XRampShared';
import { useAuth, truncateAddress } from '../../contexts/AuthContext';

import xrampLogo from '../../assets/img/xramp-logo-full.png';

const XRAMP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://xramp-app.vercel.app'
    : 'http://localhost:5173';

const VERSION = '0.1.0';

// Demo activity — replace with real data from orchestrator later
const DEMO_ACTIVITY: ActivityItem[] = [
  { id: '1', type: 'buy', amount: '50.00 USD', result: '49.14 USDC', status: 'completed', date: '2/25/2026', method: 'venmo' },
  { id: '2', type: 'sell', amount: '0.5 AVAX', result: '14.25 USD', status: 'pending', date: '2/26/2026', method: 'zelle' },
  { id: '3', type: 'buy', amount: '100.00 USD', result: '0.038 ETH', status: 'cancelled', date: '2/24/2026', method: 'cashapp' },
];

type ActivityItem = {
  id: string;
  type: 'buy' | 'sell' | 'send';
  amount: string;
  result: string;
  status: 'completed' | 'pending' | 'cancelled' | 'failed';
  date: string;
  method: string;
};

export default function XRampHome(): ReactElement {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, login } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const displayId = user?.email ||
    (user?.walletAddress ? truncateAddress(user.walletAddress) : null) ||
    (user?.embeddedWalletAddress ? truncateAddress(user.embeddedWalletAddress) : null) ||
    'Account';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    if (showSettings) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettings]);

  const handleOpenApp = () => {
    chrome.tabs.create({ url: XRAMP_URL });
  };

  const handleLogout = async () => {
    setShowSettings(false);
    await logout();
    navigate('/login');
  };

  const statusColor = (s: ActivityItem['status']) => {
    switch (s) {
      case 'completed': return colors.successGreen;
      case 'pending': return colors.warningAmber;
      case 'cancelled': case 'failed': return colors.warningRed;
    }
  };

  const statusBg = (s: ActivityItem['status']) => {
    switch (s) {
      case 'completed': return 'rgba(34,197,94,0.1)';
      case 'pending': return 'rgba(245,158,11,0.1)';
      case 'cancelled': case 'failed': return 'rgba(239,68,68,0.1)';
    }
  };

  const typeIcon = (t: ActivityItem['type']) => {
    switch (t) {
      case 'buy': return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.successGreen} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
        </svg>
      );
      case 'sell': return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
        </svg>
      );
      case 'send': return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.indigoAccent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    }
  };

  return (
    <PageWrapper>
      <ProofGridBg />

      {/* Top Nav */}
      <TopNav>
        <LogoImg src={xrampLogo} alt="XRamp" />
        <SettingsArea ref={settingsRef}>
          <GearButton onClick={() => setShowSettings(!showSettings)} $active={showSettings}>
            {/* Gear icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </GearButton>

          {/* Settings Dropdown */}
          {showSettings && (
            <SettingsDropdown>
              <SettingsTitle>SETTINGS</SettingsTitle>

              <SettingsItem onClick={handleOpenApp}>
                {/* External link icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <SettingsItemText>
                  <span>Open XRamp App</span>
                  <SettingsItemSub>xramp-app.vercel.app</SettingsItemSub>
                </SettingsItemText>
              </SettingsItem>

              <SettingsItem onClick={() => { navigate('/proofs'); setShowSettings(false); }}>
                {/* Shield icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <SettingsItemText>
                  <span>Proofs</span>
                  <SettingsItemSub>View stored proofs</SettingsItemSub>
                </SettingsItemText>
              </SettingsItem>

              <SettingsItem onClick={() => chrome.tabs.create({ url: 'https://github.com/RGDeva/zkp2p-extension-v1/issues' })}>
                {/* Alert circle */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Report Issue</span>
              </SettingsItem>

              <SettingsItem onClick={() => { if (confirm('Reset extension data?')) { chrome.storage.local.clear(); location.reload(); } }}>
                {/* Refresh */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>Reset Extension</span>
              </SettingsItem>

              <LogoutItem onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </LogoutItem>

              <SettingsDivider />

              <SettingsFooter>
                <SocialRow>
                  {/* X/Twitter */}
                  <SocialLink onClick={() => chrome.tabs.create({ url: 'https://x.com/xramp_xyz' })}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </SocialLink>
                  {/* GitHub */}
                  <SocialLink onClick={() => chrome.tabs.create({ url: 'https://github.com/RGDeva' })}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                  </SocialLink>
                </SocialRow>
                <VersionText>v{VERSION}</VersionText>
              </SettingsFooter>
            </SettingsDropdown>
          )}
        </SettingsArea>
      </TopNav>

      <Divider />

      <ScrollArea>
        {/* Welcome Card */}
        <WelcomeCard>
          <WelcomeTop>
            <WelcomeSubtitle>P2P Crypto On/Off-Ramp</WelcomeSubtitle>
            {isAuthenticated ? (
              <UserChip>
                <UserDot />
                <UserLabel>{displayId}</UserLabel>
              </UserChip>
            ) : (
              <LoginButton onClick={login}>
                LOGIN
              </LoginButton>
            )}
          </WelcomeTop>
          <BalanceRow>
            <BalanceCurrency>$</BalanceCurrency>
            <BalanceInteger>0</BalanceInteger>
            <BalanceDecimal>.00</BalanceDecimal>
          </BalanceRow>
        </WelcomeCard>

        {/* Action Buttons Row — InteractiveHoverButton style */}
        <ActionRow>
          <HoverBtn onClick={() => navigate('/buy')} $color={colors.successGreen}>
            <HoverBtnDot $color={colors.successGreen} />
            <HoverBtnContent>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
              </svg>
              Buy
            </HoverBtnContent>
          </HoverBtn>

          <HoverBtn onClick={() => navigate('/sell')} $color={colors.primary}>
            <HoverBtnDot $color={colors.primary} />
            <HoverBtnContent>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
              </svg>
              Sell
            </HoverBtnContent>
          </HoverBtn>

          <HoverBtn onClick={() => navigate('/send')} $color={colors.indigoAccent}>
            <HoverBtnDot $color={colors.indigoAccent} />
            <HoverBtnContent>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send
            </HoverBtnContent>
          </HoverBtn>
        </ActionRow>

        {/* Proofs Card */}
        <ProofsCard onClick={() => navigate('/proofs')}>
          <ProofsIconWrap>
            {/* Shield/proof icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </ProofsIconWrap>
          <ProofsTextCol>
            <ProofsTitle>PROOFS</ProofsTitle>
            <ProofsSubtitle>View stored notarization proofs</ProofsSubtitle>
          </ProofsTextCol>
          <ProofsChevron>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </ProofsChevron>
        </ProofsCard>

        {/* Activity Section */}
        <SectionHeader>ACTIVITY</SectionHeader>

        {DEMO_ACTIVITY.length === 0 ? (
          <EmptyActivity>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.mutedForeground} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <EmptyText>No activity yet</EmptyText>
            <EmptySubtext>Your transactions will appear here</EmptySubtext>
          </EmptyActivity>
        ) : (
          <ActivityList>
            {DEMO_ACTIVITY.map((item, i) => (
              <ActivityRow key={item.id} style={{ animationDelay: `${0.3 + i * 0.06}s` }}>
                <ActivityIconBadge style={{ background: statusBg(item.status) }}>
                  {typeIcon(item.type)}
                </ActivityIconBadge>
                <ActivityInfo>
                  <ActivityMain>{item.amount} → {item.result}</ActivityMain>
                  <ActivityMeta>
                    <StatusBadge style={{ color: statusColor(item.status), background: statusBg(item.status) }}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </StatusBadge>
                    <span>·</span>
                    <span>{item.date}</span>
                  </ActivityMeta>
                </ActivityInfo>
                <ActivityExtLink>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </ActivityExtLink>
              </ActivityRow>
            ))}
          </ActivityList>
        )}

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
// Layout
// ---------------------------------------------------------------------------

const PageWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
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
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
`;

// ---------------------------------------------------------------------------
// Top Nav + Settings
// ---------------------------------------------------------------------------

const TopNav = styled.nav`
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  flex-shrink: 0;
`;

const LogoImg = styled.img`
  height: 26px;
  width: auto;
  object-fit: contain;
`;

const SettingsArea = styled.div`
  position: relative;
`;

const GearButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.625rem;
  border: 1px solid ${(p: { $active?: boolean }) => p.$active ? colors.primary : colors.border};
  background: ${(p: { $active?: boolean }) => p.$active ? colors.primaryMuted : 'transparent'};
  color: ${(p: { $active?: boolean }) => p.$active ? colors.primary : colors.subtitleColor};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.secondary};
    color: ${colors.foreground};
    border-color: ${colors.primary};
  }
`;

const SettingsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 1rem;
  padding: 1rem;
  z-index: 100;
  animation: ${scaleIn} 0.15s ease-out;
  box-shadow: 0 16px 48px -12px rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SettingsTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: ${colors.primary};
  margin-bottom: 0.5rem;
`;

const SettingsItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: ${colors.foreground};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.12s ease;
  text-align: left;

  &:hover {
    background: ${colors.selectorHover};
  }

  svg { flex-shrink: 0; color: ${colors.subtitleColor}; }
`;

const LogoutItem = styled(SettingsItem)`
  color: ${colors.warningRed};
  svg { color: ${colors.warningRed}; }
  &:hover { background: rgba(239,68,68,0.08); }
`;

const SettingsItemText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const SettingsItemSub = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
  font-weight: 400;
`;

const SettingsDivider = styled.div`
  height: 1px;
  background: ${colors.border};
  margin: 0.375rem 0;
`;

const SettingsFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0.5rem 0;
`;

const SocialRow = styled.div`
  display: flex;
  gap: 0.625rem;
`;

const SocialLink = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: ${colors.subtitleColor};
  cursor: pointer;
  transition: color 0.15s;
  &:hover { color: ${colors.foreground}; }
`;

const VersionText = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
`;

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

const Divider = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 1px;
  background: ${colors.border};
  flex-shrink: 0;
`;

// ---------------------------------------------------------------------------
// ScrollArea
// ---------------------------------------------------------------------------

const ScrollArea = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 4px; }
`;

// ---------------------------------------------------------------------------
// Welcome Card
// ---------------------------------------------------------------------------

const WelcomeCard = styled.div`
  position: relative;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  animation: ${fadeIn} 0.5s ease-out both;
  box-shadow: 0 8px 32px -8px rgba(0,0,0,0.5);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  overflow: hidden;

  &:hover {
    border-color: rgba(25,197,214,0.2);
    animation: ${cyanGlow} 2s ease infinite;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(25,197,214,0.04) 50%, transparent 100%);
    transform: translateX(-100%);
    pointer-events: none;
  }
  &:hover::after { animation: ${shimmerSweep} 2s ease-in-out; }
`;

const WelcomeTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.625rem;
`;

const WelcomeSubtitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${colors.subtitleColor};
`;

const UserChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 3px 10px 3px 7px;
  border-radius: 100px;
  background: ${colors.primaryMuted};
  border: 1px solid rgba(25,197,214,0.15);
  max-width: 160px;
  overflow: hidden;
`;

const UserDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${colors.successGreen};
  flex-shrink: 0;
`;

const LoginButton = styled.button`
  padding: 6px 16px;
  border-radius: 100px;
  border: 1.5px solid ${colors.foreground};
  background: transparent;
  color: ${colors.foreground};
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: ${colors.foreground};
    color: ${colors.appBackground};
  }
`;

const UserLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: ${colors.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BalanceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1px;
`;

const BalanceCurrency = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: ${colors.subtitleColor};
  align-self: flex-start;
  margin-top: 4px;
  margin-right: 2px;
`;

const BalanceInteger = styled.span`
  font-size: 36px;
  font-weight: 700;
  color: ${colors.foreground};
  letter-spacing: -1.5px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
`;

const BalanceDecimal = styled.span`
  font-size: 22px;
  font-weight: 600;
  color: ${colors.subtitleColor};
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
`;

// ---------------------------------------------------------------------------
// Action Buttons Row
// ---------------------------------------------------------------------------

const ActionRow = styled.div`
  display: flex;
  gap: 0.625rem;
  animation: ${fadeIn} 0.5s ease-out 0.08s both;
`;

/* InteractiveHoverButton — expanding dot fills button on hover */
const HoverBtn = styled.button<{ $color: string }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 44px;
  border-radius: 0.75rem;
  border: 1px solid ${(p: { $color: string }) => p.$color}33;
  background: transparent;
  color: ${colors.foreground};
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
  transition: color 0.3s ease, border-color 0.25s ease;

  &:hover {
    color: #000;
    border-color: ${(p: { $color: string }) => p.$color};
  }

  &:hover > span:first-child {
    width: 200%;
    padding-bottom: 200%;
  }

  &:active { transform: scale(0.97); }
`;

const HoverBtnDot = styled.span<{ $color: string }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  padding-bottom: 0;
  border-radius: 50%;
  background: ${(p: { $color: string }) => p.$color};
  transition: width 0.4s ease, padding-bottom 0.4s ease;
  z-index: 0;
`;

const HoverBtnContent = styled.span`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

// ---------------------------------------------------------------------------
// Proofs Card
// ---------------------------------------------------------------------------

const ProofsCard = styled.button`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  border: 1px solid ${colors.border};
  background: ${colors.card};
  cursor: pointer;
  text-align: left;
  animation: ${fadeIn} 0.5s ease-out 0.16s both;
  box-shadow: 0 8px 32px -8px rgba(0,0,0,0.5);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${colors.selectorHoverBorder};
    background: ${colors.selectorHover};
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(25,197,214,0.04) 50%, transparent 100%);
    transform: translateX(-100%);
    pointer-events: none;
  }
  &:hover::after { animation: ${shimmerSweep} 1.5s ease-in-out; }
`;

const ProofsIconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0.625rem;
  background: ${colors.primaryMuted};
  flex-shrink: 0;
`;

const ProofsTextCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ProofsTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: ${colors.foreground};
`;

const ProofsSubtitle = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
`;

const ProofsChevron = styled.div`
  color: ${colors.mutedForeground};
  flex-shrink: 0;
`;

// ---------------------------------------------------------------------------
// Activity Section
// ---------------------------------------------------------------------------

const SectionHeader = styled.h3`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: ${colors.mutedForeground};
  margin: 0.25rem 0 0;
  animation: ${fadeIn} 0.5s ease-out 0.24s both;
`;

const EmptyActivity = styled.div`
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
  opacity: 0.7;
`;

const EmptyText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.subtitleColor};
`;

const EmptySubtext = styled.span`
  font-size: 12px;
  color: ${colors.mutedForeground};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const ActivityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.875rem;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  animation: ${fadeIn} 0.35s ease-out both;
  transition: background 0.15s ease;

  &:hover {
    background: ${colors.selectorHover};
  }
`;

const ActivityIconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.5rem;
  flex-shrink: 0;
`;

const ActivityInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const ActivityMain = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.foreground};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 11px;
  color: ${colors.mutedForeground};
`;

const StatusBadge = styled.span`
  display: inline-flex;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
`;

const ActivityExtLink = styled.div`
  color: ${colors.mutedForeground};
  flex-shrink: 0;
  cursor: pointer;
  transition: color 0.15s;
  &:hover { color: ${colors.foreground}; }
`;

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

const FooterText = styled.p`
  text-align: center;
  font-size: 10px;
  color: ${colors.mutedForeground};
  padding: 0.25rem 0;
  margin: 0;
  animation: ${fadeIn} 0.5s ease-out 0.35s both;
`;
