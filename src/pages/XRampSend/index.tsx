import React, { useState, ReactElement } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { colors } from '@theme/colors';
import {
  PageWrapper, PageTopBar, BackButton, PageTitle, Divider,
  ScrollContent, Card, Label, InputRow, AmountInput,
  SelectorButton, ChevronDown, DropdownOverlay, DropdownList, DropdownItem,
  InfoRow, InfoLabel, InfoValue, PrimaryButton, ButtonText, ErrorRow, DotsLoader, TextInput,
} from '@components/XRampShared';

const TOKENS = [
  { symbol: 'AVAX', name: 'Avalanche', icon: '🔺' },
  { symbol: 'USDC', name: 'USD Coin', icon: '💲' },
  { symbol: 'USDT', name: 'Tether', icon: '💵' },
  { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
  { symbol: 'BTC.b', name: 'Bitcoin (Bridged)', icon: '₿' },
  { symbol: 'SOL', name: 'Solana', icon: '◎' },
];

export default function XRampSend(): ReactElement {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(TOKENS[0]);
  const [showTokens, setShowTokens] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const num = parseFloat(amount) || 0;
  const hasAddress = walletAddress.trim().length >= 10;
  const canContinue = num > 0 && hasAddress;

  const handleSubmit = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    alert(`Demo: Send ${amount} ${token.symbol} to ${walletAddress.slice(0, 8)}…`);
  };

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
            <SelectorWrapper>
              <SelectorButton onClick={() => setShowTokens(!showTokens)}>
                <span>{token.icon}</span>
                <span>{token.symbol}</span>
                <ChevronDown />
              </SelectorButton>
              {showTokens && (
                <>
                  <DropdownOverlay onClick={() => setShowTokens(false)} />
                  <DropdownList>
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
                  </DropdownList>
                </>
              )}
            </SelectorWrapper>
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

const SelectorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const SelectorWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const DropdownSubtext = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
  margin-left: auto;
`;
