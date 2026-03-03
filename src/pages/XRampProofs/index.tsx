import React, { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { colors } from '@theme/colors';
import {
  PageWrapper, PageTopBar, BackButton, PageTitle, Divider,
  ScrollContent, Card,
} from '@components/XRampShared';
import { fadeIn } from '@components/XRampShared';

// ---------------------------------------------------------------------------
// What are Proofs?
//
// XRamp uses TLS Notarization (TLSNotary) to create zero-knowledge proofs
// of fiat payments. When you pay someone through Venmo, Zelle, CashApp, etc.,
// the extension captures the HTTPS response from the payment provider, sends
// it to a notary server, and generates a cryptographic proof that the payment
// occurred — without revealing the full transaction details.
//
// This proof is then submitted on-chain to release crypto to the buyer.
// Neither party needs to trust the other: the proof mathematically verifies
// the fiat payment happened. Proofs are stored locally in the extension and
// can be viewed, verified, or deleted from this page.
// ---------------------------------------------------------------------------

// Demo proofs — will be replaced with real data from history reducer
const DEMO_PROOFS: ProofItem[] = [
  {
    id: 'p1',
    subject: 'Proof of Venmo payment',
    detail: 'Sent $50.00 to @alice',
    status: 'success',
    date: '2/25/2026',
    requestType: 'transfer',
  },
  {
    id: 'p2',
    subject: 'Proof of Zelle transfer',
    detail: 'Sent $100.00 to john@email.com',
    status: 'pending',
    date: '2/26/2026',
    requestType: 'transfer',
  },
  {
    id: 'p3',
    subject: 'Proof of CashApp payment',
    detail: 'Sent $25.00 to $bob',
    status: 'error',
    date: '2/24/2026',
    requestType: 'transfer',
  },
];

type ProofItem = {
  id: string;
  subject: string;
  detail: string;
  status: 'success' | 'pending' | 'error';
  date: string;
  requestType: string;
};

export default function XRampProofs(): ReactElement {
  const navigate = useNavigate();

  const statusIcon = (s: ProofItem['status']) => {
    switch (s) {
      case 'success': return (
        <StatusDot style={{ background: colors.successGreen }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </StatusDot>
      );
      case 'pending': return (
        <StatusDot style={{ background: colors.warningAmber }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </StatusDot>
      );
      case 'error': return (
        <StatusDot style={{ background: colors.warningRed }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </StatusDot>
      );
    }
  };

  const statusLabel = (s: ProofItem['status']) => {
    switch (s) {
      case 'success': return 'Verified';
      case 'pending': return 'Proving…';
      case 'error': return 'Failed';
    }
  };

  const statusColor = (s: ProofItem['status']) => {
    switch (s) {
      case 'success': return colors.successGreen;
      case 'pending': return colors.warningAmber;
      case 'error': return colors.warningRed;
    }
  };

  return (
    <PageWrapper>
      <PageTopBar>
        <BackButton onClick={() => navigate('/home')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </BackButton>
        <PageTitle>Proofs</PageTitle>
        <div style={{ width: 36 }} />
      </PageTopBar>

      <Divider />

      <ScrollContent>
        {/* Explainer Card */}
        <ExplainerCard>
          <ExplainerIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </ExplainerIcon>
          <ExplainerText>
            <ExplainerTitle>What are proofs?</ExplainerTitle>
            <ExplainerBody>
              When you make a fiat payment (Venmo, Zelle, etc.), XRamp generates a 
              <strong> zero-knowledge proof</strong> that the payment occurred using TLS notarization. 
              This proof is submitted on-chain to release crypto — no trust required between parties.
            </ExplainerBody>
          </ExplainerText>
        </ExplainerCard>

        {/* Proofs List */}
        <SectionLabel>STORED PROOFS</SectionLabel>

        {DEMO_PROOFS.length === 0 ? (
          <EmptyCard>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={colors.mutedForeground} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <EmptyText>No proofs stored</EmptyText>
            <EmptySubtext>Complete a buy or sell to generate your first proof</EmptySubtext>
          </EmptyCard>
        ) : (
          <ProofsList>
            {DEMO_PROOFS.map((proof, i) => (
              <ProofRow key={proof.id} style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
                <ProofLeft>
                  {statusIcon(proof.status)}
                  <ProofInfo>
                    <ProofSubject>{proof.subject}</ProofSubject>
                    <ProofDetail>{proof.detail}</ProofDetail>
                  </ProofInfo>
                </ProofLeft>
                <ProofRight>
                  <ProofStatusText style={{ color: statusColor(proof.status) }}>
                    {statusLabel(proof.status)}
                  </ProofStatusText>
                  <ProofDate>{proof.date}</ProofDate>
                </ProofRight>
              </ProofRow>
            ))}
          </ProofsList>
        )}

        {/* How it works */}
        <SectionLabel>HOW IT WORKS</SectionLabel>
        <StepsList>
          <StepItem $index={0}>
            <StepNumber>1</StepNumber>
            <StepText>
              <strong>Payment captured</strong> — Extension intercepts the HTTPS response from your payment app
            </StepText>
          </StepItem>
          <StepItem $index={1}>
            <StepNumber>2</StepNumber>
            <StepText>
              <strong>Notarization</strong> — Response is sent to a TLS notary server which co-signs the data
            </StepText>
          </StepItem>
          <StepItem $index={2}>
            <StepNumber>3</StepNumber>
            <StepText>
              <strong>ZK proof generated</strong> — A zero-knowledge proof is created that verifies the payment without revealing details
            </StepText>
          </StepItem>
          <StepItem $index={3}>
            <StepNumber>4</StepNumber>
            <StepText>
              <strong>On-chain settlement</strong> — Proof is submitted on-chain to release crypto to the buyer
            </StepText>
          </StepItem>
        </StepsList>
      </ScrollContent>
    </PageWrapper>
  );
}

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const ExplainerCard = styled.div`
  display: flex;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: ${colors.primaryMuted};
  border: 1px solid rgba(25,197,214,0.15);
  animation: ${fadeIn} 0.4s ease-out both;
`;

const ExplainerIcon = styled.div`
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
  flex-shrink: 0;
`;

const ExplainerText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ExplainerTitle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${colors.primary};
`;

const ExplainerBody = styled.span`
  font-size: 12px;
  line-height: 1.5;
  color: ${colors.subtitleColor};

  strong {
    color: ${colors.foreground};
    font-weight: 600;
  }
`;

const SectionLabel = styled.h3`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  color: ${colors.mutedForeground};
  margin: 0.5rem 0 0;
  animation: ${fadeIn} 0.4s ease-out 0.1s both;
`;

const EmptyCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  gap: 0.5rem;
  animation: ${fadeIn} 0.4s ease-out 0.15s both;
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
  text-align: center;
`;

const ProofsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const ProofRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.875rem;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  animation: ${fadeIn} 0.35s ease-out both;
  transition: background 0.15s ease;

  &:hover {
    background: ${colors.selectorHover};
    cursor: pointer;
  }
`;

const ProofLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
`;

const StatusDot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const ProofInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const ProofSubject = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.foreground};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProofDetail = styled.span`
  font-size: 11px;
  color: ${colors.mutedForeground};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProofRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  margin-left: 0.5rem;
`;

const ProofStatusText = styled.span`
  font-size: 11px;
  font-weight: 600;
`;

const ProofDate = styled.span`
  font-size: 10px;
  color: ${colors.mutedForeground};
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
`;

const StepItem = styled.div<{ $index: number }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.875rem;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  animation: ${fadeIn} 0.35s ease-out both;
  animation-delay: ${(p: { $index: number }) => 0.2 + p.$index * 0.06}s;
`;

const StepNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${colors.primaryMuted};
  color: ${colors.primary};
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepText = styled.span`
  font-size: 12px;
  line-height: 1.5;
  color: ${colors.subtitleColor};
  padding-top: 2px;

  strong {
    color: ${colors.foreground};
    font-weight: 600;
  }
`;
