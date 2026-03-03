import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '@theme/colors';

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  40%           { transform: translateY(-14px) scale(1.15); opacity: 1; }
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
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid ${colors.defaultBorderColor};
  background: transparent;
  color: ${colors.subtitleColor};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${colors.card};
    color: ${colors.titleColor};
    border-color: ${colors.primary};
  }
`;

export const PageTitle = styled.span`
  font-size: 17px;
  font-weight: 700;
  color: ${colors.titleColor};
  letter-spacing: -0.3px;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${colors.defaultBorderColor};
  flex-shrink: 0;
`;

// ---------------------------------------------------------------------------
// Card / Form Elements
// ---------------------------------------------------------------------------

export const Card = styled.div`
  background: ${colors.card};
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 16px;
  padding: 1.25rem;
  animation: ${fadeIn} 0.3s ease both;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: ${colors.selectorHoverBorder};
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.subtitleColor};
  margin-bottom: 0.5rem;
  letter-spacing: 0.3px;
`;

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const CurrencyPrefix = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.mutedForeground};
`;

export const AmountInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 28px;
  font-weight: 700;
  color: ${colors.titleColor};
  font-family: inherit;
  letter-spacing: -0.5px;
  min-width: 0;

  &::placeholder {
    color: ${colors.mutedForeground};
  }
`;

export const TextInput = styled.input`
  width: 100%;
  background: ${colors.defaultInputColor};
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 12px;
  padding: 0.75rem 1rem;
  font-size: 14px;
  color: ${colors.titleColor};
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${colors.mutedForeground};
  }

  &:focus {
    border-color: ${colors.primary};
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
  border-radius: 12px;
  border: 1px solid ${colors.defaultBorderColor};
  background: ${colors.selectorColor};
  color: ${colors.titleColor};
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: ${colors.selectorHover};
    border-color: ${colors.selectorHoverBorder};
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
  border: 1px solid ${colors.defaultBorderColor};
  border-radius: 14px;
  padding: 0.375rem;
  max-height: 200px;
  overflow-y: auto;
  animation: ${fadeIn} 0.15s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${colors.defaultBorderColor};
    border-radius: 4px;
  }
`;

export const DropdownItem = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border-radius: 10px;
  border: none;
  background: ${(p: { $active?: boolean }) => p.$active ? colors.primaryMuted : 'transparent'};
  color: ${(p: { $active?: boolean }) => p.$active ? colors.primary : colors.titleColor};
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.1s ease;
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
  padding: 0.5rem 0;
`;

export const InfoLabel = styled.span`
  font-size: 12px;
  color: ${colors.mutedForeground};
`;

export const InfoValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.subtitleColor};
`;

// ---------------------------------------------------------------------------
// Primary CTA Button (matches InteractiveHoverButton style)
// ---------------------------------------------------------------------------

export const PrimaryButton = styled.button<{ disabled?: boolean }>`
  position: relative;
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: 1px solid ${(p: { disabled?: boolean }) => p.disabled ? colors.defaultBorderColor : colors.primary + '66'};
  background: ${(p: { disabled?: boolean }) => p.disabled ? colors.card : 'transparent'};
  color: ${(p: { disabled?: boolean }) => p.disabled ? colors.mutedForeground : colors.titleColor};
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: ${(p: { disabled?: boolean }) => p.disabled ? 'not-allowed' : 'pointer'};
  overflow: hidden;
  transition: all 0.2s ease;
  opacity: ${(p: { disabled?: boolean }) => p.disabled ? 0.5 : 1};

  &:not(:disabled):hover {
    border-color: ${colors.primary};
    background: ${colors.primaryMuted};
    color: ${colors.primary};
  }

  &:not(:disabled):active {
    transform: scale(0.98);
  }
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
  &::-webkit-scrollbar-thumb { background: ${colors.defaultBorderColor}; border-radius: 4px; }
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
// KineticDotsLoader — simplified for extension
// ---------------------------------------------------------------------------

const DotsWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  padding: 1.5rem 0;
`;

const Dot = styled.div<{ $delay: number }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.primary}, #06b6d4);
  animation: ${dotBounce} 1s ease-in-out infinite;
  animation-delay: ${(p: { $delay: number }) => p.$delay}ms;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
`;

interface DotsLoaderProps {
  dots?: number;
  className?: string;
}

export const DotsLoader: React.FC<DotsLoaderProps> = ({ dots = 3, className }) => (
  <DotsWrapper className={className}>
    {Array.from({ length: dots }).map((_, i) => (
      <Dot key={i} $delay={i * 150} />
    ))}
  </DotsWrapper>
);

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
