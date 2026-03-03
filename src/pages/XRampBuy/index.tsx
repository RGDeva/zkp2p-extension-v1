import React, { useState, useRef, ReactElement } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { colors } from '@theme/colors';
import {
  PageWrapper, PageTopBar, BackButton, PageTitle, Divider,
  ScrollContent, Card, Label, InputRow, CurrencyPrefix, AmountInput,
  SelectorButton, ChevronDown, FixedDropdown, DropdownItem,
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

const TOKEN_PRICES: Record<string, number> = {
  AVAX: 28.5, USDC: 1, USDT: 1, ETH: 2650, 'BTC.b': 62000, SOL: 145,
};

const PAYMENT_METHODS = [
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

export default function XRampBuy(): ReactElement {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [token, setToken] = useState(TOKENS[0]);
  const [showTokens, setShowTokens] = useState(false);
  const [method, setMethod] = useState<typeof PAYMENT_METHODS[0] | null>(null);
  const [showMethods, setShowMethods] = useState(false);
  const tokenBtnRef = useRef<HTMLButtonElement>(null);
  const methodBtnRef = useRef<HTMLButtonElement>(null);
  const [handle, setHandle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const num = parseFloat(amount) || 0;
  const price = TOKEN_PRICES[token.symbol] ?? 1;
  const receive = num > 0 ? (num / price).toFixed(6) : '0';
  const fee = (num * 0.005).toFixed(2);
  const handleMeta = method ? HANDLE_META[method.id] ?? null : null;
  const requiresHandle = !!method && method.id !== 'bank';
  const hasHandle = !requiresHandle || handle.trim().length > 0;
  const canContinue = num > 0 && !!method && hasHandle;

  const handleSubmit = async () => {
    if (!canContinue) return;
    setSubmitting(true);
    setError(null);
    // Simulate intent creation
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    // In production, this would call the orchestrator API
    alert(`Demo: Buy ${receive} ${token.symbol} for $${amount} via ${method?.label}`);
  };

  return (
    <PageWrapper>
      <PageTopBar>
        <BackButton onClick={() => navigate('/home')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </BackButton>
        <PageTitle>Buy Crypto</PageTitle>
      </PageTopBar>
      <Divider />

      <ScrollContent>
        {/* Amount Card */}
        <Card>
          <Label>You pay</Label>
          <InputRow>
            <CurrencyPrefix>$</CurrencyPrefix>
            <AmountInput
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              autoFocus
            />
          </InputRow>
        </Card>

        {/* Token Selector */}
        <Card>
          <Label>You receive</Label>
          <SelectorRow>
            <ReceivePreview>{receive} {token.symbol}</ReceivePreview>
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

        {/* Payment Method Selector */}
        <Card>
          <Label>Payment method</Label>
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
                {PAYMENT_METHODS.map(m => (
                  <DropdownItem
                    key={m.id}
                    $active={method?.id === m.id}
                    onClick={() => {
                      setMethod(m);
                      setHandle('');
                      setShowMethods(false);
                    }}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </DropdownItem>
                ))}
              </FixedDropdown>
            )}
          </div>
        </Card>

        {/* Handle Input */}
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

        {/* Quote Info */}
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
              <InfoValue style={{ color: colors.primary, fontWeight: 700 }}>{receive} {token.symbol}</InfoValue>
            </InfoRow>
          </Card>
        )}

        {/* Error */}
        {error && (
          <ErrorRow>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </ErrorRow>
        )}

        {/* Loader */}
        {submitting && <DotsLoader dots={3} />}

        {/* CTA */}
        <PrimaryButton
          disabled={!canContinue || submitting}
          onClick={handleSubmit}
        >
          <ButtonText>{submitting ? 'Processing…' : 'Continue'}</ButtonText>
        </PrimaryButton>
      </ScrollContent>
    </PageWrapper>
  );
}

// ---------------------------------------------------------------------------
// Local styled helpers
// ---------------------------------------------------------------------------

const SelectorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const ReceivePreview = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.titleColor};
  letter-spacing: -0.3px;
`;

const DropdownSubtext = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
  margin-left: auto;
`;
