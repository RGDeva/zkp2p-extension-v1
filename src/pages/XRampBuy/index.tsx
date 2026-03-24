import React, { useState, useRef, ReactElement, useCallback, useEffect } from 'react';
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
import { getProvider } from '../../lib/providers';
import { orchestratorClient } from '../../lib/orchestratorClient';
import { verifyVenmoPayment } from '../../lib/venmoProofRunner';
import { verifyRevolutPayment } from '../../lib/revolutProofRunner';

// Avalanche-native tokens only — these are the only chains XRamp settles today
const TOKENS = [
  { symbol: 'USDC',  name: 'USD Coin',            icon: 'USDC', chain: 'Avalanche' },
  { symbol: 'AVAX',  name: 'Avalanche',            icon: 'AVAX', chain: 'Avalanche' },
  { symbol: 'USDT',  name: 'Tether',               icon: 'USDT', chain: 'Avalanche' },
  { symbol: 'BTC.b', name: 'Bitcoin (Avalanche)',  icon: 'BTC',  chain: 'Avalanche' },
  { symbol: 'WAVAX', name: 'Wrapped AVAX',         icon: 'WAVAX', chain: 'Avalanche' },
];

// Live payment methods — Venmo has automated proof, Wise is manual verification for now
const PAYMENT_METHODS = [
  { id: 'venmo',   label: 'Venmo',   icon: '📱', live: true },
  { id: 'revolut', label: 'Revolut', icon: '🔄', live: true },
  { id: 'wise',    label: 'Wise',    icon: '🌐', live: true },
];


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
  const [token, setToken] = useState(TOKENS[0]); // USDC is index 0
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

  // SDK destination (rich object from web app)
  const [sdkDestination, setSdkDestination] = useState<{
    chainId: number;
    token: string;
    recipientAddress: string;
    app?: string;
    memo?: string;
  } | null>(null);
  const [sdkPrefilled, setSdkPrefilled] = useState(false);

  // SDK prefill: listen for navigate messages with context from background
  useEffect(() => {
    const handler = (message: { action?: string; route?: string; context?: Record<string, unknown> }) => {
      if (message.action === 'navigate' && message.route === '/buy' && message.context) {
        const ctx = message.context as Record<string, unknown>;
        if (ctx.amount) setAmount(String(ctx.amount));
        if (ctx.provider) {
          const found = PAYMENT_METHODS.find(m => m.id === ctx.provider);
          if (found) setMethod(found);
        }
        if (ctx.destination && typeof ctx.destination === 'object') {
          const dest = ctx.destination as { chainId?: number; token?: string; recipientAddress?: string; app?: string; memo?: string };
          if (dest.recipientAddress) {
            setSdkDestination({
              chainId: dest.chainId ?? 43113,
              token: dest.token ?? 'USDC',
              recipientAddress: dest.recipientAddress,
              app: dest.app,
              memo: dest.memo,
            });
          }
        }
        if (ctx.asset) {
          const found = TOKENS.find(t => t.symbol === ctx.asset);
          if (found) setToken(found);
        }
        setSdkPrefilled(true);
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  // Load saved handle from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xramp_buyer_handle');
      if (saved) setHandle(h => h || saved);
    } catch { /* ignore */ }
  }, []);

  // When method changes, try to prefill from localStorage
  useEffect(() => {
    if (!method) return;
    try {
      const saved = localStorage.getItem('xramp_buyer_handle');
      if (saved) setHandle(h => h || saved);
    } catch { /* ignore */ }
  }, [method]);

  const num = parseFloat(amount) || 0;
  const fee = (num * 0.005).toFixed(2);
  const receive = num > 0 ? (num - num * 0.005).toFixed(2) : '0';
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
      if (handle.trim()) {
        try { localStorage.setItem('xramp_buyer_handle', handle.trim()); } catch { /* ignore */ }
      }
      const token_ = await getAccessToken().catch(() => null);
      const { intent } = await orchestratorClient.createOnrampIntent({
        userId: getUserId(),
        amount,
        sourceAsset: 'USD',
        targetAsset: token.symbol,
        rail: method?.id,
        paymentHandle: handle.trim() || undefined,
        ...(sdkDestination ? { destination: sdkDestination } : {}),
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

        // Persist proof to chrome.storage so XRampProofs page can display it
        try {
          const PROOF_KEY = 'xramp_proofs';
          chrome.storage.local.get([PROOF_KEY], (existing) => {
            const prev: unknown[] = existing[PROOF_KEY] || [];
            const entry = {
              intentId,
              providerId: result.providerId,
              proofHash: result.proofHash,
              verified: true,
              amount: result.extracted?.amount,
              receiverUsername: result.extracted?.receiverUsername,
              date: result.extracted?.date,
              storedAt: new Date().toISOString(),
            };
            chrome.storage.local.set({ [PROOF_KEY]: [...prev, entry] });
          });
        } catch {
          // Non-fatal
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

        // Emit SDK intent completion
        try {
          chrome.runtime.sendMessage({
            action: 'xramp_intent_complete_to_tab',
            data: {
              intentId,
              rail: 'venmo',
              amount,
              state: 'COMPLETE',
              proofHash: result.proofHash,
              ...(sdkDestination ? { destination: sdkDestination } : {}),
            },
          });
        } catch {
          // Non-fatal
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
  }, [intentId, amount, handle, method, getAccessToken, sdkDestination]);

  const handleVerifyRevolut = useCallback(async () => {
    if (!intentId || !method) return;
    setStep('verifying');
    setProofReason(null);
    try {
      const result = await verifyRevolutPayment({
        intentId,
        amount,
        recipientTag: handle.trim(),
        memo: `XRAMP-${intentId.slice(0, 8)}`,
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

        // Persist proof to chrome.storage so XRampProofs page can display it
        try {
          const PROOF_KEY = 'xramp_proofs';
          chrome.storage.local.get([PROOF_KEY], (existing) => {
            const prev: unknown[] = existing[PROOF_KEY] || [];
            const entry = {
              intentId,
              providerId: result.providerId,
              proofHash: result.proofHash,
              verified: true,
              amount: result.extracted?.amount,
              recipientName: result.extracted?.recipientName,
              date: result.extracted?.date,
              storedAt: new Date().toISOString(),
            };
            chrome.storage.local.set({ [PROOF_KEY]: [...prev, entry] });
          });
        } catch {
          // Non-fatal
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

        // Emit SDK intent completion
        try {
          chrome.runtime.sendMessage({
            action: 'xramp_intent_complete_to_tab',
            data: {
              intentId,
              rail: 'revolut',
              amount,
              state: 'COMPLETE',
              proofHash: result.proofHash,
              ...(sdkDestination ? { destination: sdkDestination } : {}),
            },
          });
        } catch {
          // Non-fatal
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
  }, [intentId, amount, handle, method, getAccessToken, sdkDestination]);

  // ─── Pending / verified / failed screens ─────────────────────────────────
  if (step === 'pending' || step === 'verifying' || step === 'verified' || step === 'failed') {
    const shortId = intentId ? intentId.slice(0, 8) : '—';
    const lpHandle = method ? getProvider(method.id).lpHandle : '(LP handle)';
    const showVenmoVerifyBtn = VENMO_PROOF_ENABLED && method?.id === 'venmo' && step === 'pending';
    const showRevolutVerifyBtn = method?.id === 'revolut' && step === 'pending';

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
              <InstructionsTitle>Payment instructions</InstructionsTitle>

              <PaymentField>
                <PaymentFieldLabel>Amount</PaymentFieldLabel>
                <PaymentFieldRow>
                  <PaymentFieldValue>${amount} USD</PaymentFieldValue>
                  <CopyButton onClick={() => navigator.clipboard.writeText(amount).catch(() => {})}>Copy</CopyButton>
                </PaymentFieldRow>
              </PaymentField>

              <PaymentField>
                <PaymentFieldLabel>Send to ({method?.label})</PaymentFieldLabel>
                <PaymentFieldRow>
                  <PaymentFieldValue style={{ color: colors.primary }}>{lpHandle}</PaymentFieldValue>
                  <CopyButton onClick={() => navigator.clipboard.writeText(lpHandle).catch(() => {})}>Copy</CopyButton>
                </PaymentFieldRow>
              </PaymentField>

              <PaymentField>
                <PaymentFieldLabel>Memo (required)</PaymentFieldLabel>
                <PaymentFieldRow>
                  <MemoText>XRAMP-{shortId}</MemoText>
                  <CopyButton onClick={() => navigator.clipboard.writeText(`XRAMP-${shortId}`).catch(() => {})}>Copy</CopyButton>
                </PaymentFieldRow>
              </PaymentField>

              {method?.id === 'venmo' && (
                <VenmoDeepLink
                  onClick={() => {
                    const handle = lpHandle.replace('@', '');
                    const note = encodeURIComponent(`XRAMP-${shortId}`);
                    const amt = encodeURIComponent(amount);
                    chrome.tabs.create({ url: `https://venmo.com/${handle}?txn=pay&amount=${amt}&note=${note}` });
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open Venmo &amp; Pay
                </VenmoDeepLink>
              )}

              {method?.id === 'revolut' && (
                <VenmoDeepLink
                  onClick={() => {
                    const tag = lpHandle.replace('@', '');
                    chrome.tabs.create({ url: `https://revolut.me/${tag}` });
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open Revolut &amp; Pay
                </VenmoDeepLink>
              )}

              {method?.id === 'wise' && (
                <VenmoDeepLink
                  onClick={() => chrome.tabs.create({ url: 'https://wise.com/send' })}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Open Wise &amp; Send
                </VenmoDeepLink>
              )}
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
          {showVenmoVerifyBtn && (
            <VenmoVerifyButton onClick={handleVerifyVenmo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Verify with Venmo (Beta)
            </VenmoVerifyButton>
          )}

          {/* Revolut Verify button */}
          {showRevolutVerifyBtn && (
            <VenmoVerifyButton onClick={handleVerifyRevolut}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Verify with Revolut
            </VenmoVerifyButton>
          )}

          {/* Manual verification notice for rails without automated proof */}
          {step === 'pending' && method?.id !== 'venmo' && method?.id !== 'revolut' && (
            <ManualVerifyNotice>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Automated proof coming soon — payment will be verified manually by admin.</span>
            </ManualVerifyNotice>
          )}

          {/* Retry after failure */}
          {step === 'failed' && VENMO_PROOF_ENABLED && method?.id === 'venmo' && (
            <VenmoVerifyButton onClick={handleVerifyVenmo} style={{ marginTop: 0 }}>
              Retry Verification
            </VenmoVerifyButton>
          )}

          {step === 'failed' && method?.id === 'revolut' && (
            <VenmoVerifyButton onClick={handleVerifyRevolut} style={{ marginTop: 0 }}>
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

        {/* Payment Method — between pay and receive */}
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
                  <><span>{method.icon}</span><span>{method.label}</span>
                    <LiveBadge>Live</LiveBadge>
                  </>
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
                    {m.live && <LiveBadge style={{ marginLeft: 'auto' }}>Live</LiveBadge>}
                  </DropdownItem>
                ))}
              </FixedDropdown>
            )}
          </div>
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

        {/* Best Quote card */}
        {num > 0 && (
          <BestQuoteCard>
            <BestQuoteHeader>
              <BestQuoteBadge>✦ Best Quote</BestQuoteBadge>
              <ChainBadge>Avalanche · Fuji testnet</ChainBadge>
            </BestQuoteHeader>
            <BestQuoteProvider>
              <ProviderIcon>X</ProviderIcon>
              <ProviderName>XRamp LP</ProviderName>
              <ProviderRoute>{method?.label ?? 'Venmo'} → USDC</ProviderRoute>
            </BestQuoteProvider>
            <BestQuoteDivider />
            <InfoRow>
              <InfoLabel>Rate</InfoLabel>
              <InfoValue>1 USD = 1.00 USDC</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>XRamp fee (0.5%)</InfoLabel>
              <InfoValue>−${fee}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>You receive</InfoLabel>
              <InfoValue style={{ color: colors.primary, fontWeight: 700 }}>{receive} {token.symbol}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Settlement</InfoLabel>
              <InfoValue style={{ color: colors.mutedForeground, fontSize: '11px' }}>Escrow → Avalanche Fuji</InfoValue>
            </InfoRow>
          </BestQuoteCard>
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

        {/* SDK destination badge */}
        {sdkDestination && (
          <Card>
            <Label>Delivering to</Label>
            <InfoRow>
              <InfoLabel>Address</InfoLabel>
              <InfoValue style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                {sdkDestination.recipientAddress.slice(0, 6)}…{sdkDestination.recipientAddress.slice(-4)}
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Chain</InfoLabel>
              <InfoValue>{sdkDestination.chainId === 43113 ? 'Avalanche Fuji' : `Chain ${sdkDestination.chainId}`}</InfoValue>
            </InfoRow>
            {sdkDestination.app && (
              <InfoRow>
                <InfoLabel>App</InfoLabel>
                <InfoValue style={{ color: colors.primary }}>{sdkDestination.app.toUpperCase()}</InfoValue>
              </InfoRow>
            )}
          </Card>
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

const PaymentField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${colors.border};
  &:last-of-type { border-bottom: none; }
`;

const PaymentFieldLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.6px;
  color: ${colors.mutedForeground};
  text-transform: uppercase;
`;

const PaymentFieldRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const PaymentFieldValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.foreground};
`;

const CopyButton = styled.button`
  flex-shrink: 0;
  padding: 0.2rem 0.6rem;
  border-radius: 0.375rem;
  border: 1px solid ${colors.border};
  background: transparent;
  color: ${colors.mutedForeground};
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  &:hover { background: ${colors.primaryMuted}; color: ${colors.primary}; border-color: ${colors.primary}; }
`;

const VenmoDeepLink = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.625rem;
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid ${colors.primary};
  background: ${colors.primaryMuted};
  color: ${colors.primary};
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(25,197,214,0.18); }
`;

// ---------------------------------------------------------------------------
// Best Quote card
// ---------------------------------------------------------------------------

const BestQuoteCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.125rem;
  border-radius: 1rem;
  background: ${colors.card};
  border: 1px solid ${colors.primary}33;
  animation: ${fadeIn} 0.3s ease-out both;
`;

const BestQuoteHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BestQuoteBadge = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: ${colors.primary};
  text-transform: uppercase;
`;

const ChainBadge = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${colors.mutedForeground};
  background: ${colors.primaryMuted};
  border: 1px solid ${colors.primary}33;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
`;

const BestQuoteProvider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
`;

const ProviderIcon = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: ${colors.primary};
  color: #000;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ProviderName = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${colors.foreground};
`;

const ProviderRoute = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
  margin-left: auto;
`;

const BestQuoteDivider = styled.div`
  height: 1px;
  background: ${colors.border};
  margin: 0.125rem 0;
`;

const LiveBadge = styled.span`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #22c55e;
  background: rgba(34,197,94,0.12);
  border: 1px solid rgba(34,197,94,0.25);
  padding: 0.1rem 0.4rem;
  border-radius: 99px;
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

const ManualVerifyNotice = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: ${colors.primaryMuted};
  border: 1px solid ${colors.primary}33;
  color: ${colors.mutedForeground};
  font-size: 12px;
  line-height: 1.5;
  animation: ${fadeIn} 0.4s ease-out 0.15s both;

  svg { flex-shrink: 0; margin-top: 1px; color: ${colors.primary}; }
`;
