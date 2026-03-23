import React, { useState, useRef, ReactElement } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { colors } from '@theme/colors';
import {
  PageWrapper, PageTopBar, BackButton, PageTitle, Divider,
  ScrollContent, Card, Label, InputRow, AmountInput,
  SelectorButton, ChevronDown, FixedDropdown, DropdownItem,
  InfoRow, InfoLabel, InfoValue, PrimaryButton, ButtonText, ErrorRow, DotsLoader, TextInput,
} from '@components/XRampShared';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../../contexts/AuthContext';
import { orchestratorClient } from '../../lib/orchestratorClient';
import { getProvider } from '../../lib/providers';

const XRAMP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://xramp-app.vercel.app'
    : 'http://localhost:5173';

const TOKENS = [
  { symbol: 'AVAX',  name: 'Avalanche',         icon: 'AVAX' },
  { symbol: 'USDC',  name: 'USD Coin',           icon: 'USDC' },
  { symbol: 'USDT',  name: 'Tether',             icon: 'USDT' },
  { symbol: 'BTC.b', name: 'Bitcoin (Bridged)',  icon: 'BTC'  },
];

const TOKEN_PRICES: Record<string, number> = {
  AVAX: 28.5, USDC: 1, USDT: 1, ETH: 2650, 'BTC.b': 62000,
};

const PAYOUT_METHODS = [
  { id: 'venmo', label: 'Venmo', icon: '📱' },
  { id: 'cashapp', label: 'Cash App', icon: '💚' },
  { id: 'zelle', label: 'Zelle', icon: '⚡' },
  { id: 'revolut', label: 'Revolut', icon: '🔵' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
];


type Step = 'form' | 'pending';

export default function XRampSell(): ReactElement {
  const navigate = useNavigate();
  const { getAccessToken } = usePrivy();
  const { user } = useAuth();

  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [intentId, setIntentId] = useState<string | null>(null);
  const [token, setToken] = useState(TOKENS[0]);
  const [showTokens, setShowTokens] = useState(false);
  const [method, setMethod] = useState<typeof PAYOUT_METHODS[0] | null>(null);
  const [showMethods, setShowMethods] = useState(false);
  const tokenBtnRef = useRef<HTMLButtonElement>(null);
  const methodBtnRef = useRef<HTMLButtonElement>(null);
  const [handle, setHandle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const num = parseFloat(amount) || 0;
  const price = TOKEN_PRICES[token.symbol] ?? 1;
  const receiveUsd = num > 0 ? (num * price).toFixed(2) : '0.00';
  const fee = (num * price * 0.005).toFixed(2);
  const handleMeta = method ? getProvider(method.id).handleMeta : null;
  const requiresHandle = !!method && method.id !== 'bank';
  const hasHandle = !requiresHandle || handle.trim().length > 0;
  const canContinue = num > 0 && !!method && hasHandle;

  const getUserId = () =>
    user?.email || user?.walletAddress || user?.embeddedWalletAddress || 'guest';

  const handleSubmit = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    try {
      const token_ = await getAccessToken().catch(() => null);
      const { intent } = await orchestratorClient.createOfframpIntent({
        userId: getUserId(),
        amount,
        sourceAsset: token.symbol,
        targetAsset: 'USD',
        rail: method?.id,
        paymentHandle: handle.trim() || undefined,
      }, token_ ?? undefined);
      setIntentId(intent.id);
      setStep('pending');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create intent');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'pending' && intentId) {
    const shortId = intentId.slice(0, 8);
    return (
      <PageWrapper>
        <PageTopBar>
          <BackButton onClick={() => { setStep('form'); setIntentId(null); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </BackButton>
          <PageTitle>Sell Created</PageTitle>
        </PageTopBar>
        <Divider />
        <ScrollContent>
          <ConfirmCard>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.successGreen} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <ConfirmTitle>Sell intent created</ConfirmTitle>
            <ConfirmSub>Intent {shortId} · {amount} {token.symbol} → ${receiveUsd} via {method?.label}</ConfirmSub>
          </ConfirmCard>
          <InfoCard>
            <InfoRow>
              <InfoLabel>Next step</InfoLabel>
              <InfoValue style={{ color: colors.primary }}>Send {token.symbol} to XRamp escrow</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Your payout</InfoLabel>
              <InfoValue>${receiveUsd} USD via {method?.label}</InfoValue>
            </InfoRow>
            {handle && (
              <InfoRow>
                <InfoLabel>Your {method?.label} handle</InfoLabel>
                <InfoValue>{handle}</InfoValue>
              </InfoRow>
            )}
          </InfoCard>
          <OpenAppBtn onClick={() => chrome.tabs.create({ url: XRAMP_URL + '/activity' })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View in XRamp App
          </OpenAppBtn>
        </ScrollContent>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTopBar>
        <BackButton onClick={() => navigate('/home')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </BackButton>
        <PageTitle>Sell Crypto</PageTitle>
      </PageTopBar>
      <Divider />

      <ScrollContent>
        {/* Amount + Token */}
        <Card>
          <Label>You sell</Label>
          <SelectorRow>
            <InputRow style={{ flex: 1 }}>
              <AmountInput
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                autoFocus
                style={{ fontSize: '24px' }}
              />
            </InputRow>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <SelectorButton ref={tokenBtnRef} onClick={() => setShowTokens(!showTokens)}>
                <span>{token.icon}</span>
                <span>{token.symbol}</span>
                <ChevronDown />
              </SelectorButton>
              {showTokens && (
                <FixedDropdown anchorRef={tokenBtnRef as React.RefObject<HTMLElement>} onClose={() => setShowTokens(false)} minWidth={160}>
                  {TOKENS.map(t => (
                    <DropdownItem
                      key={t.symbol}
                      $active={t.symbol === token.symbol}
                      onClick={() => { setToken(t); setShowTokens(false); }}
                    >
                      <span>{t.icon}</span>
                      <span>{t.symbol}</span>
                      <DropdownSubtext>{t.name}</DropdownSubtext>
                    </DropdownItem>
                  ))}
                </FixedDropdown>
              )}
            </div>
          </SelectorRow>
        </Card>

        {/* You receive USD */}
        <Card>
          <Label>You receive</Label>
          <ReceiveAmount>${receiveUsd}</ReceiveAmount>
        </Card>

        {/* Payout Method */}
        <Card>
          <Label>Payout method</Label>
          <div>
            <SelectorButton
              ref={methodBtnRef}
              onClick={() => setShowMethods(!showMethods)}
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {method ? (
                  <><span>{method.icon}</span><span>{method.label}</span></>
                ) : (
                  <span style={{ color: colors.mutedForeground }}>Select method</span>
                )}
              </span>
              <ChevronDown />
            </SelectorButton>
            {showMethods && (
              <FixedDropdown anchorRef={methodBtnRef as React.RefObject<HTMLElement>} onClose={() => setShowMethods(false)}>
                {PAYOUT_METHODS.map(m => (
                  <DropdownItem
                    key={m.id}
                    $active={method?.id === m.id}
                    onClick={() => { setMethod(m); setHandle(''); setShowMethods(false); }}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </DropdownItem>
                ))}
              </FixedDropdown>
            )}
          </div>
        </Card>

        {/* Handle */}
        {handleMeta && (
          <Card>
            <Label>{handleMeta.label}</Label>
            <TextInput
              type="text"
              placeholder={handleMeta.prefix ? `${handleMeta.prefix}${handleMeta.placeholder}` : handleMeta.placeholder}
              value={handle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHandle(e.target.value)}
            />
          </Card>
        )}

        {/* Quote */}
        {num > 0 && (
          <Card style={{ padding: '0.75rem 1.25rem' }}>
            <InfoRow>
              <InfoLabel>Rate</InfoLabel>
              <InfoValue>1 {token.symbol} = ${price.toLocaleString()}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Fee (0.5%)</InfoLabel>
              <InfoValue>${fee}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>You get</InfoLabel>
              <InfoValue style={{ color: colors.primary, fontWeight: 700 }}>${receiveUsd}</InfoValue>
            </InfoRow>
          </Card>
        )}

        {error && (
          <ErrorRow>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </ErrorRow>
        )}

        {submitting && <DotsLoader dots={3} />}

        <PrimaryButton disabled={!canContinue || submitting} onClick={handleSubmit}>
          <ButtonText>{submitting ? 'Processing…' : 'Continue'}</ButtonText>
        </PrimaryButton>
      </ScrollContent>
    </PageWrapper>
  );
}

const ConfirmCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  background: rgba(34,197,94,0.06);
  border: 1px solid rgba(34,197,94,0.2);
  text-align: center;
`;

const ConfirmTitle = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.foreground};
`;

const ConfirmSub = styled.span`
  font-size: 12px;
  color: ${colors.mutedForeground};
  line-height: 1.5;
`;

const InfoCard = styled.div`
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 1rem;
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
`;

const OpenAppBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.875rem;
  border: 1px solid ${colors.border};
  background: transparent;
  color: ${colors.primary};
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: ${colors.primaryMuted}; }
`;

const SelectorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const ReceiveAmount = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.titleColor};
  letter-spacing: -0.5px;
`;

const DropdownSubtext = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
  margin-left: auto;
`;
