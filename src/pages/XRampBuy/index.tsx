import React, { useState, useRef, ReactElement, useCallback } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { colors } from '@theme/colors';
import {
  PageWrapper, PageTopBar, BackButton, PageTitle, Divider,
  ScrollContent, Card, Label, InputRow, CurrencyPrefix, AmountInput,
  SelectorButton, ChevronDown, FixedDropdown, DropdownItem,
  InfoRow, InfoLabel, InfoValue, PrimaryButton, ButtonText, ErrorRow, DotsLoader, TextInput,
  fadeIn,
} from '@components/XRampShared';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../../contexts/AuthContext';
import { VENMO_PROOF_ENABLED } from '../../lib/featureFlags';
import { orchestratorClient } from '../../lib/orchestratorClient';
import { verifyVenmoPayment } from '../../lib/venmoProofRunner';

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

type Step = 'form' | 'pending' | 'verifying' | 'verified' | 'failed';

const XRAMP_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://xramp-app.vercel.app'
    : 'http://localhost:5173';

export default function XRampBuy(): ReactElement {
  const navigate = useNavigate();
  const { getAccessToken } = usePrivy();
  const { user } = useAuth();

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

  // Multi-step state
  const [step, setStep] = useState<Step>('form');
  const [intentId, setIntentId] = useState<string | null>(null);
  const [proofHash, setProofHash] = useState<string | null>(null);
  const [proofReason, setProofReason] = useState<string | null>(null);

  const num = parseFloat(amount) || 0;
  const price = TOKEN_PRICES[token.symbol] ?? 1;
  const receive = num > 0 ? (num / price).toFixed(6) : '0';
  const fee = (num * 0.005).toFixed(2);
  const handleMeta = method ? HANDLE_META[method.id] ?? null : null;
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
      const { intent } = await orchestratorClient.createOnrampIntent({
        userId: getUserId(),
        amount,
        sourceAsset: 'USD',
        targetAsset: token.symbol,
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

  const handleVerifyVenmo = useCallback(async () => {
    if (!intentId || !method) return;
    setStep('verifying');
    setProofReason(null);
    try {
      const result = await verifyVenmoPayment({
        intentId,
        amount,
        receiverUsernameOrId: handle.trim(),
        note: `XRAMP-${intentId}`,
      });

      if (result.verified && result.proofHash) {
        // Submit proof to orchestrator
        try {
          const token_ = await getAccessToken().catch(() => null);
          await orchestratorClient.submitProof(intentId, {
            providerId: result.providerId,
            proofHash: result.proofHash,
            payload: result.proofPayload,
          }, token_ ?? undefined);
        } catch {
          // Non-fatal — proof is stored locally even if backend call fails
        }

        // Relay to XRamp web app tab
        try {
          chrome.runtime.sendMessage({
            action: 'xramp_proof_to_tab',
            data: result,
          });
        } catch {
          // Tab may not be open — that's fine
        }

        setProofHash(result.proofHash);
        setStep('verified');
      } else {
        setProofReason(result.reason ?? 'Verification failed');
        setStep('failed');
      }
    } catch (e) {
      setProofReason(e instanceof Error ? e.message : 'Unexpected error');
      setStep('failed');
    }
  }, [intentId, amount, handle, method, getAccessToken]);

  // ─── Pending / verified / failed screens ─────────────────────────────────
  if (step === 'pending' || step === 'verifying' || step === 'verified' || step === 'failed') {
    const shortId = intentId ? intentId.slice(0, 8) : '—';
    const venmoHandle = handle.trim() ? `@${handle.trim().replace(/^@/, '')}` : '(your handle)';
    const showVerifyBtn = VENMO_PROOF_ENABLED && method?.id === 'venmo' && step === 'pending';

    return (
      <PageWrapper>
        <PageTopBar>
          <BackButton onClick={() => { setStep('form'); setIntentId(null); setProofHash(null); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </BackButton>
          <PageTitle>
            {step === 'verified' ? 'Payment Verified' : step === 'failed' ? 'Verification Failed' : 'Awaiting Payment'}
          </PageTitle>
        </PageTopBar>
        <Divider />

        <ScrollContent>
          {/* Status icon */}
          <StatusIconCard $status={step}>
            {step === 'verifying' ? (
              <DotsLoader dots={3} />
            ) : step === 'verified' ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.successGreen} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            ) : step === 'failed' ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.warningRed} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.warningAmber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            )}
            <StatusTitle $status={step}>
              {step === 'verifying' ? 'Verifying payment…' :
               step === 'verified' ? 'Payment confirmed!' :
               step === 'failed' ? 'Not verified' :
               'Waiting for your payment'}
            </StatusTitle>
          </StatusIconCard>

          {/* Payment instructions */}
          {(step === 'pending' || step === 'failed') && (
            <InstructionsCard>
              <InstructionsTitle>How to pay</InstructionsTitle>
              <InstructionRow>
                <InstructionNumber>1</InstructionNumber>
                <InstructionText>Send <strong>${amount}</strong> via <strong>{method?.label}</strong></InstructionText>
              </InstructionRow>
              <InstructionRow>
                <InstructionNumber>2</InstructionNumber>
                <InstructionText>To: <strong>{venmoHandle}</strong></InstructionText>
              </InstructionRow>
              <InstructionRow>
                <InstructionNumber>3</InstructionNumber>
                <InstructionText>Memo: <MemoText>XRAMP-{shortId}</MemoText></InstructionText>
              </InstructionRow>
            </InstructionsCard>
          )}

          {/* Proof hash on success */}
          {step === 'verified' && proofHash && (
            <ProofHashCard>
              <ProofHashLabel>Proof Hash</ProofHashLabel>
              <ProofHashValue>{proofHash.slice(0, 16)}…{proofHash.slice(-8)}</ProofHashValue>
              <ProofHashSub>Submitted to orchestrator · Intent {shortId}</ProofHashSub>
            </ProofHashCard>
          )}

          {/* Failure reason */}
          {step === 'failed' && proofReason && (
            <ErrorRow>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{proofReason}</span>
            </ErrorRow>
          )}

          {/* Venmo Verify button (feature-flagged) */}
          {showVerifyBtn && (
            <VenmoVerifyButton onClick={handleVerifyVenmo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Verify with Venmo (Beta)
            </VenmoVerifyButton>
          )}

          {/* Retry after failure */}
          {step === 'failed' && VENMO_PROOF_ENABLED && method?.id === 'venmo' && (
            <VenmoVerifyButton onClick={handleVerifyVenmo} style={{ marginTop: 0 }}>
              Retry Verification
            </VenmoVerifyButton>
          )}

          {/* Open XRamp App button */}
          {(step === 'verified' || step === 'pending') && (
            <OpenAppButton onClick={() => chrome.tabs.create({ url: XRAMP_URL + '/activity' })}>
              View in XRamp App
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </OpenAppButton>
          )}
        </ScrollContent>
      </PageWrapper>
    );
  }

  // ─── Form screen ──────────────────────────────────────────────────────────
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

// ---------------------------------------------------------------------------
// Pending / Verify screens
// ---------------------------------------------------------------------------

const statusBorder = (s: Step) => {
  if (s === 'verified') return colors.successGreen;
  if (s === 'failed') return colors.warningRed;
  if (s === 'verifying') return colors.primary;
  return colors.warningAmber;
};

const StatusIconCard = styled.div<{ $status: Step }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  background: ${colors.card};
  border: 1px solid ${(p: { $status: Step }) => statusBorder(p.$status)}44;
  animation: ${fadeIn} 0.4s ease-out both;
`;

const StatusTitle = styled.span<{ $status: Step }>`
  font-size: 15px;
  font-weight: 700;
  color: ${(p: { $status: Step }) => statusBorder(p.$status)};
  text-align: center;
`;

const InstructionsCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1.125rem 1.25rem;
  border-radius: 1rem;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const InstructionsTitle = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: ${colors.mutedForeground};
  text-transform: uppercase;
  margin-bottom: 0.25rem;
`;

const InstructionRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
`;

const InstructionNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${colors.primaryMuted};
  color: ${colors.primary};
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
`;

const InstructionText = styled.span`
  font-size: 13px;
  color: ${colors.subtitleColor};
  line-height: 1.4;
  strong { color: ${colors.foreground}; font-weight: 600; }
`;

const MemoText = styled.code`
  font-family: monospace;
  font-size: 12px;
  color: ${colors.primary};
  background: ${colors.primaryMuted};
  padding: 1px 6px;
  border-radius: 4px;
`;

const ProofHashCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: rgba(34,197,94,0.06);
  border: 1px solid rgba(34,197,94,0.2);
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const ProofHashLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: ${colors.successGreen};
  text-transform: uppercase;
`;

const ProofHashValue = styled.span`
  font-family: monospace;
  font-size: 12px;
  color: ${colors.foreground};
  word-break: break-all;
`;

const ProofHashSub = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
`;

const VenmoVerifyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 0.875rem;
  border: 1.5px solid ${colors.primary};
  background: ${colors.primaryMuted};
  color: ${colors.primary};
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  animation: ${fadeIn} 0.4s ease-out 0.15s both;

  &:hover { background: rgba(25,197,214,0.15); }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const OpenAppButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.875rem;
  border: 1px solid ${colors.border};
  background: transparent;
  color: ${colors.subtitleColor};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  animation: ${fadeIn} 0.4s ease-out 0.2s both;

  &:hover { background: ${colors.selectorHover}; color: ${colors.foreground}; }
`;
