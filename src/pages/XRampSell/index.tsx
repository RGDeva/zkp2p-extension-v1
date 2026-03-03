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

const HANDLE_META: Record<string, { label: string; placeholder: string; prefix?: string }> = {
  venmo:   { label: 'Venmo username',    placeholder: 'yourname',     prefix: '@' },
  cashapp: { label: 'Cash Tag',          placeholder: 'yourcashtag',  prefix: '$' },
  zelle:   { label: 'Zelle email/phone', placeholder: 'email or phone' },
  revolut: { label: 'Revolut tag',       placeholder: 'yourrevtag',   prefix: '@' },
  paypal:  { label: 'PayPal email',      placeholder: 'you@email.com' },
};

export default function XRampSell(): ReactElement {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(TOKENS[0]);
  const [showTokens, setShowTokens] = useState(false);
  const [method, setMethod] = useState<typeof PAYOUT_METHODS[0] | null>(null);
  const [showMethods, setShowMethods] = useState(false);
  const [handle, setHandle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const num = parseFloat(amount) || 0;
  const price = TOKEN_PRICES[token.symbol] ?? 1;
  const receiveUsd = num > 0 ? (num * price).toFixed(2) : '0.00';
  const fee = (num * price * 0.005).toFixed(2);
  const handleMeta = method ? HANDLE_META[method.id] ?? null : null;
  const requiresHandle = !!method && method.id !== 'bank';
  const hasHandle = !requiresHandle || handle.trim().length > 0;
  const canContinue = num > 0 && !!method && hasHandle;

  const handleSubmit = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    alert(`Demo: Sell ${amount} ${token.symbol} for $${receiveUsd} via ${method?.label}`);
  };

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

        {/* You receive USD */}
        <Card>
          <Label>You receive</Label>
          <ReceiveAmount>${receiveUsd}</ReceiveAmount>
        </Card>

        {/* Payout Method */}
        <Card>
          <Label>Payout method</Label>
          <SelectorWrapper style={{ position: 'relative' }}>
            <SelectorButton
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
              <>
                <DropdownOverlay onClick={() => setShowMethods(false)} />
                <DropdownList>
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
                </DropdownList>
              </>
            )}
          </SelectorWrapper>
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
