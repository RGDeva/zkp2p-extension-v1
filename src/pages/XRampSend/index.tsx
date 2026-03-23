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

const XRAMP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://xramp-app.vercel.app'
    : 'http://localhost:5173';

const TOKENS = [
  { symbol: 'AVAX',  name: 'Avalanche',        icon: 'AVAX' },
  { symbol: 'USDC',  name: 'USD Coin',          icon: 'USDC' },
  { symbol: 'USDT',  name: 'Tether',            icon: 'USDT' },
  { symbol: 'BTC.b', name: 'Bitcoin (Bridged)', icon: 'BTC'  },
];

type Step = 'form' | 'confirmed';

export default function XRampSend(): ReactElement {
  const navigate = useNavigate();
  const { getAccessToken } = usePrivy();
  const { user } = useAuth();

  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(TOKENS[0]);
  const [showTokens, setShowTokens] = useState(false);
  const tokenBtnRef = useRef<HTMLButtonElement>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('form');
  const [intentId, setIntentId] = useState<string | null>(null);

  const num = parseFloat(amount) || 0;
  const hasAddress = walletAddress.trim().length >= 10;
  const canContinue = num > 0 && hasAddress;

  const getUserId = () =>
    user?.email || user?.walletAddress || user?.embeddedWalletAddress || 'guest';

  const handleSubmit = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    try {
      const authToken = await getAccessToken().catch(() => null);
      const { intent } = await orchestratorClient.createOnrampIntent({
        userId: getUserId(),
        amount,
        sourceAsset: token.symbol,
        targetAsset: token.symbol,
        rail: 'wallet',
        paymentHandle: walletAddress.trim(),
      }, authToken ?? undefined);
      setIntentId(intent.id);
      setStep('confirmed');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'confirmed' && intentId) {
    return (
      <PageWrapper>
        <PageTopBar>
          <BackButton onClick={() => { setStep('form'); setIntentId(null); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </BackButton>
          <PageTitle>Send Queued</PageTitle>
        </PageTopBar>
        <Divider />
        <ScrollContent>
          <ConfirmCard>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.successGreen} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <ConfirmTitle>Send queued</ConfirmTitle>
            <ConfirmSub>{amount} {token.symbol} → {walletAddress.slice(0, 10)}…{walletAddress.slice(-6)}</ConfirmSub>
          </ConfirmCard>
          <InfoCard>
            <InfoRow>
              <InfoLabel>Intent ID</InfoLabel>
              <InfoValue style={{ fontFamily: 'monospace', fontSize: '11px' }}>{intentId.slice(0, 12)}…</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Amount</InfoLabel>
              <InfoValue style={{ color: colors.primary, fontWeight: 700 }}>{amount} {token.symbol}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>To</InfoLabel>
              <InfoValue style={{ fontFamily: 'monospace', fontSize: '11px' }}>{walletAddress.slice(0, 10)}…{walletAddress.slice(-6)}</InfoValue>
            </InfoRow>
          </InfoCard>
          <OpenAppBtn onClick={() => chrome.tabs.create({ url: XRAMP_URL + '/activity' })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Track in XRamp App
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
        <PageTitle>Send Crypto</PageTitle>
      </PageTopBar>
      <Divider />

      <ScrollContent>
        {/* Wallet Address */}
        <Card>
          <Label>Recipient address</Label>
          <TextInput
            type="text"
            placeholder="0x… or wallet address"
            value={walletAddress}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWalletAddress(e.target.value)}
            autoFocus
            style={{ fontFamily: 'monospace', fontSize: '13px' }}
          />
        </Card>

        {/* Amount + Token */}
        <Card>
          <Label>Amount</Label>
          <SelectorRow>
            <InputRow style={{ flex: 1 }}>
              <AmountInput
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
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

        {/* Summary */}
        {canContinue && (
          <Card style={{ padding: '0.75rem 1.25rem' }}>
            <InfoRow>
              <InfoLabel>Sending</InfoLabel>
              <InfoValue style={{ color: colors.primary, fontWeight: 700 }}>
                {amount} {token.symbol}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>To</InfoLabel>
              <InfoValue style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                {walletAddress.slice(0, 12)}…{walletAddress.slice(-6)}
              </InfoValue>
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
          <ButtonText>{submitting ? 'Sending…' : 'Send'}</ButtonText>
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
  word-break: break-all;
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

const DropdownSubtext = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
  margin-left: auto;
`;
