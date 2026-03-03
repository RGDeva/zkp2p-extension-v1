import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    email?: string;
    walletAddress?: string;
    embeddedWalletAddress?: string;
  } | null;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const authState = useMemo<AuthState>(() => {
    const email = user?.email?.address;
    const embeddedWallet = user?.wallet;
    const externalWallet = wallets.find(w => w.walletClientType !== 'privy');

    return {
      isAuthenticated: authenticated,
      isLoading: !ready,
      user: authenticated && user ? {
        email,
        walletAddress: externalWallet?.address,
        embeddedWalletAddress: embeddedWallet?.address,
      } : null,
      login,
      logout,
    };
  }, [ready, authenticated, user, wallets, login, logout]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
