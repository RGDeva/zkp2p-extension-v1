import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { colors } from '@theme/colors';

// ---------------------------------------------------------------------------
// Animations — ported from XRamp index.css
// ---------------------------------------------------------------------------

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
`;

export const successPop = keyframes`
  0%   { transform: scale(0.5); opacity: 0; }
  70%  { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
`;

export const shimmerSweep = keyframes`
  from { transform: translateX(-100%); }
  to   { transform: translateX(200%); }
`;

export const pulseCyan = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.6; }
`;

export const pulseScale = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.05); opacity: 0.85; }
`;

const gravityBounce = keyframes`
  0%   { transform: translateY(0);     animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1); }
  50%  { transform: translateY(-40px); animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0); }
  100% { transform: translateY(0); }
`;

const rubberMorph = keyframes`
  0%   { transform: scale(1.4, 0.6); }
  5%   { transform: scale(0.9, 1.1); }
  15%  { transform: scale(1, 1); }
  50%  { transform: scale(1, 1); }
  85%  { transform: scale(0.9, 1.1); }
  100% { transform: scale(1.4, 0.6); }
`;

const shadowBreathe = keyframes`
  0%   { transform: scale(1.4); opacity: 0.6; }
  50%  { transform: scale(0.5); opacity: 0.1; }
  100% { transform: scale(1.4); opacity: 0.6; }
`;

const rippleExpand = keyframes`
  0%   { transform: scale(0.5); opacity: 0;   border-width: 4px; }
  5%   { opacity: 0.8; }
  30%  { transform: scale(1.5); opacity: 0;   border-width: 0px; }
  100% { transform: scale(1.5); opacity: 0; }
`;

export const gradientText = keyframes`
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Stagger helper
export const stagger = (index: number, base = 0.08) => css`
  animation-delay: ${index * base}s;
`;

// ---------------------------------------------------------------------------
// Page-level TopBar (back arrow + title)
// ---------------------------------------------------------------------------

export const PageTopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  flex-shrink: 0;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 0.75rem;
  border: 1px solid ${colors.border};
  background: transparent;
  color: ${colors.subtitleColor};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.secondary};
    color: ${colors.foreground};
    border-color: ${colors.primary};
    box-shadow: 0 0 12px -3px rgba(25,197,214,0.25);
  }
`;

export const PageTitle = styled.span`
  font-size: 17px;
  font-weight: 700;
  color: ${colors.foreground};
  letter-spacing: -0.3px;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${colors.border};
  flex-shrink: 0;
`;

// ---------------------------------------------------------------------------
// Card / Form Elements — matches .xramp-card
// ---------------------------------------------------------------------------

export const Card = styled.div`
  position: relative;
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 1rem;
  padding: 1.25rem;
  animation: ${fadeIn} 0.5s ease-out both;
  transition: border-color 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 8px 32px -8px rgba(0,0,0,0.5);
  overflow: hidden;

  &:focus-within {
    border-color: rgba(25,197,214,0.4);
    box-shadow: 0 0 0 2px rgba(25,197,214,0.15), 0 8px 32px -8px rgba(0,0,0,0.5);
  }

  /* Shimmer sweep on hover */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(25,197,214,0.04) 50%,
      transparent 100%
    );
    transform: translateX(-100%);
    transition: none;
    pointer-events: none;
  }
  &:hover::after {
    animation: ${shimmerSweep} 1.5s ease-in-out;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.subtitleColor};
  margin-bottom: 0.5rem;
  letter-spacing: 0.3px;
  text-transform: uppercase;
`;

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const CurrencyPrefix = styled.span`
  font-size: 28px;
  font-weight: 600;
  color: ${colors.mutedForeground};
`;

export const AmountInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 30px;
  font-weight: 600;
  color: ${colors.foreground};
  font-family: inherit;
  letter-spacing: -0.5px;
  min-width: 0;
  font-variant-numeric: tabular-nums;

  &::placeholder {
    color: ${colors.mutedForeground};
  }
`;

export const TextInput = styled.input`
  width: 100%;
  background: ${colors.defaultInputColor};
  border: 1px solid ${colors.border};
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 14px;
  color: ${colors.foreground};
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);

  &::placeholder {
    color: ${colors.mutedForeground};
  }

  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(25,197,214,0.15), inset 0 2px 4px rgba(0,0,0,0.1);
  }
`;

// ---------------------------------------------------------------------------
// Selector Button (token / payment method)
// ---------------------------------------------------------------------------

export const SelectorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid ${colors.border};
  background: ${colors.selectorColor};
  color: ${colors.foreground};
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${colors.selectorHover};
    border-color: ${colors.selectorHoverBorder};
    box-shadow: 0 0 10px -3px rgba(25,197,214,0.15);
  }
`;

export const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ---------------------------------------------------------------------------
// Dropdown list for selectors
// ---------------------------------------------------------------------------

export const DropdownOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
`;

export const DropdownList = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: ${colors.container};
  border: 1px solid ${colors.border};
  border-radius: 0.875rem;
  padding: 0.375rem;
  max-height: 220px;
  overflow-y: auto;
  animation: ${scaleIn} 0.2s ease-out;
  box-shadow: 0 8px 32px -8px rgba(0,0,0,0.6);

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 4px; }
`;

export const DropdownItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 0.625rem;
  border: none;
  background: ${(p: { $active?: boolean }) => p.$active ? colors.primaryMuted : 'transparent'};
  color: ${(p: { $active?: boolean }) => p.$active ? colors.primary : colors.foreground};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: left;

  &:hover {
    background: ${colors.selectorHover};
  }
`;

// ---------------------------------------------------------------------------
// Info / Quote Row
// ---------------------------------------------------------------------------

export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0;
`;

export const InfoLabel = styled.span`
  font-size: 12px;
  color: ${colors.mutedForeground};
`;

export const InfoValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.subtitleColor};
  font-variant-numeric: tabular-nums;
`;

// ---------------------------------------------------------------------------
// Primary CTA Button — mirrors InteractiveHoverButton
// ---------------------------------------------------------------------------

export const PrimaryButton = styled.button<{ disabled?: boolean }>`
  position: relative;
  width: 100%;
  height: 48px;
  border-radius: 0.875rem;
  border: 1px solid ${(p: { disabled?: boolean }) => p.disabled ? colors.border : colors.primary + '66'};
  background: ${(p: { disabled?: boolean }) => p.disabled ? colors.card : 'transparent'};
  color: ${(p: { disabled?: boolean }) => p.disabled ? colors.mutedForeground : colors.foreground};
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: ${(p: { disabled?: boolean }) => p.disabled ? 'not-allowed' : 'pointer'};
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${(p: { disabled?: boolean }) => p.disabled ? 0.5 : 1};

  /* Hover fill effect — mimics InteractiveHoverButton dot expand */
  &::before {
    content: '';
    position: absolute;
    left: 20%;
    top: 40%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.primary};
    transform: scale(1);
    transition: all 0.3s ease;
    z-index: 0;
  }

  &:not(:disabled):hover::before {
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 0.875rem;
    transform: scale(1.8);
  }

  &:not(:disabled):hover {
    border-color: ${colors.primary};
    color: ${colors.primaryForeground};
  }

  &:not(:disabled):active {
    transform: scale(0.98);
  }

  /* Text sits above the expanding dot */
  span, & > * { position: relative; z-index: 1; }
`;

// Button text wrapper (so text stays above the expanding dot)
export const ButtonText = styled.span`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`;

// ---------------------------------------------------------------------------
// Scrollable Content
// ---------------------------------------------------------------------------

export const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 4px; }
`;

// ---------------------------------------------------------------------------
// Error Display
// ---------------------------------------------------------------------------

export const ErrorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 12px;
  color: ${colors.warningRed};
  animation: ${fadeIn} 0.2s ease;
`;

// ---------------------------------------------------------------------------
// KineticDotsLoader — faithful port of XRamp's bouncing dots
// ---------------------------------------------------------------------------

const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 0;
`;

const LoaderInner = styled.div`
  display: flex;
  gap: 1.25rem;
`;

const DotColumn = styled.div<{ $i: number }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 5rem;
  width: 1.5rem;
`;

const BouncingDot = styled.div<{ $i: number }>`
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  z-index: 10;
  animation: ${gravityBounce} 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  animation-delay: ${(p: { $i: number }) => p.$i * 0.15}s;
  will-change: transform;
`;

const DotSphere = styled.div<{ $i: number }>`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(to bottom, ${colors.cyanGradientStart}, ${colors.cyanGradientMid});
  box-shadow: 0 0 15px rgba(34,211,238,0.6);
  animation: ${rubberMorph} 1.4s linear infinite;
  animation-delay: ${(p: { $i: number }) => p.$i * 0.15}s;
  will-change: transform;
`;

const DotHighlight = styled.div`
  position: absolute;
  top: 4px;
  left: 4px;
  width: 6px;
  height: 6px;
  background: rgba(255,255,255,0.6);
  border-radius: 50%;
  filter: blur(0.5px);
`;

const FloorRipple = styled.div<{ $i: number }>`
  position: absolute;
  bottom: 0;
  width: 2.5rem;
  height: 0.75rem;
  border: 1px solid rgba(34,211,238,0.3);
  border-radius: 100%;
  opacity: 0;
  animation: ${rippleExpand} 1.4s linear infinite;
  animation-delay: ${(p: { $i: number }) => p.$i * 0.15}s;
`;

const DotShadow = styled.div<{ $i: number }>`
  position: absolute;
  bottom: -4px;
  width: 1.25rem;
  height: 0.375rem;
  border-radius: 100%;
  background: rgba(34,211,238,0.4);
  filter: blur(4px);
  animation: ${shadowBreathe} 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  animation-delay: ${(p: { $i: number }) => p.$i * 0.15}s;
`;

interface DotsLoaderProps {
  dots?: number;
  className?: string;
}

export const DotsLoader: React.FC<DotsLoaderProps> = ({ dots = 4, className }) => (
  <LoaderWrapper className={className}>
    <LoaderInner>
      {Array.from({ length: dots }).map((_, i) => (
        <DotColumn key={i} $i={i}>
          <BouncingDot $i={i}>
            <DotSphere $i={i} />
            <DotHighlight />
          </BouncingDot>
          <FloorRipple $i={i} />
          <DotShadow $i={i} />
        </DotColumn>
      ))}
    </LoaderInner>
  </LoaderWrapper>
);

// ---------------------------------------------------------------------------
// Cyan Gradient Text — matches .text-gradient-cyan
// ---------------------------------------------------------------------------

export const CyanGradientText = styled.span`
  background: linear-gradient(135deg, ${colors.cyanGradientStart}, ${colors.cyanGradientMid});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

// ---------------------------------------------------------------------------
// Animated Gradient Text
// ---------------------------------------------------------------------------

export const AnimatedGradientSpan = styled.span`
  background: linear-gradient(90deg, ${colors.cyanGradientStart}, ${colors.cyanGradientMid}, ${colors.cyanGradientEnd}, ${colors.cyanGradientStart});
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${gradientText} 4s linear infinite;
`;

// ---------------------------------------------------------------------------
// Page Wrapper
// ---------------------------------------------------------------------------

export const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;
