import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { colors } from '@theme/colors';

// ---------------------------------------------------------------------------
// ENV-based URL: set XRAMP_URL in secrets.development.js / secrets.production.js
// Falls back to localhost in dev, production URL in prod.
// ---------------------------------------------------------------------------
const XRAMP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://xramp-app.vercel.app'
    : 'http://localhost:5173';

type RampTab = 'Buy' | 'Sell' | 'Send';

interface XRampContext {
  intentId?: string;
  mode?: 'onramp' | 'offramp';
  rail?: string;
  amount?: string;
  asset?: string;
  chain?: string;
  tab?: RampTab;
}

const SidePanel = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<RampTab>('Buy');
  const [iframeReady, setIframeReady] = useState(false);
  const [context] = useState<XRampContext>({ tab: 'Buy' });

  // Build the iframe src URL with query params for initial context
  const buildSrc = (ctx: XRampContext): string => {
    const params = new URLSearchParams();
    if (ctx.tab) params.set('tab', ctx.tab);
    if (ctx.intentId) params.set('intentId', ctx.intentId);
    if (ctx.mode) params.set('mode', ctx.mode);
    if (ctx.rail) params.set('rail', ctx.rail);
    if (ctx.amount) params.set('amount', ctx.amount);
    if (ctx.asset) params.set('asset', ctx.asset);
    if (ctx.chain) params.set('chain', ctx.chain);
    return `${XRAMP_URL}/ramp?${params.toString()}`;
  };

  // When iframe signals it is loaded, push XRAMP_CONTEXT via postMessage
  const handleIframeLoad = () => {
    setIframeReady(true);
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      {
        type: 'XRAMP_CONTEXT',
        payload: {
          ...context,
          source: 'xramp-extension',
        },
      },
      XRAMP_URL
    );
  };

  // When user clicks a tab pill, update the iframe src
  const handleTabClick = (tab: RampTab) => {
    setActiveTab(tab);
    setIframeReady(false);
    const win = iframeRef.current;
    if (win) {
      win.src = buildSrc({ ...context, tab });
    }
  };

  // Listen for messages back from the XRamp app (e.g. intent created)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== XRAMP_URL) return;
      const { type, payload } = event.data || {};
      if (type === 'XRAMP_INTENT_CREATED') {
        console.log('[XRamp Extension] Intent created:', payload);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const tabs: RampTab[] = ['Buy', 'Sell', 'Send'];

  return (
    <AppContainer>
      <Header>
        <LogoRow>
          <LogoMark>✕</LogoMark>
          <LogoText>XRamp</LogoText>
          <TagLine>P2P Crypto Rails</TagLine>
        </LogoRow>
        <TabRow>
          {tabs.map((t) => (
            <TabPill
              key={t}
              $active={activeTab === t}
              onClick={() => handleTabClick(t)}
            >
              {t}
            </TabPill>
          ))}
        </TabRow>
      </Header>

      <IframeWrapper>
        {!iframeReady && (
          <LoadingOverlay>
            <DotsRow>
              <Dot style={{ animationDelay: '0ms' }} />
              <Dot style={{ animationDelay: '160ms' }} />
              <Dot style={{ animationDelay: '320ms' }} />
            </DotsRow>
          </LoadingOverlay>
        )}
        <StyledIframe
          ref={iframeRef}
          src={buildSrc({ ...context, tab: activeTab })}
          onLoad={handleIframeLoad}
          allow="clipboard-write"
          title="XRamp"
        />
      </IframeWrapper>

      <Footer>
        <FooterText>Powered by XRamp · P2P Crypto Rails</FooterText>
      </Footer>
    </AppContainer>
  );
};

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: ${colors.appBackground};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid ${colors.defaultBorderColor};
  background-color: ${colors.container};
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
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${colors.primary};
  color: #000;
  font-weight: 900;
  font-size: 14px;
`;

const LogoText = styled.span`
  font-size: 17px;
  font-weight: 700;
  color: ${colors.titleColor};
  letter-spacing: -0.3px;
`;

const TagLine = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
  margin-left: 2px;
`;

const TabRow = styled.div`
  display: flex;
  gap: 0.375rem;
`;

const TabPill = styled.button<{ $active: boolean }>`
  padding: 0.3rem 1rem;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${({ $active }: { $active: boolean }) =>
    $active ? colors.primary : colors.defaultBorderColor};
  background: ${({ $active }: { $active: boolean }) =>
    $active ? colors.primaryMuted : 'transparent'};
  color: ${({ $active }: { $active: boolean }) =>
    $active ? colors.primary : colors.subtitleColor};
  transition: all 0.15s ease;

  &:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
    background: ${colors.primaryMuted};
  }
`;

const IframeWrapper = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  display: block;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.appBackground};
  z-index: 10;
`;

const DotsRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${colors.primary};
  animation: xrDotBounce 0.9s ease-in-out infinite;

  @keyframes xrDotBounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40%           { transform: scale(1.1); opacity: 1;   }
  }
`;

const Footer = styled.div`
  padding: 0.5rem 1.25rem;
  border-top: 1px solid ${colors.defaultBorderColor};
  background: ${colors.container};
  flex-shrink: 0;
`;

const FooterText = styled.p`
  font-size: 10px;
  color: ${colors.mutedForeground};
  text-align: center;
  margin: 0;
`;

export default SidePanel;
