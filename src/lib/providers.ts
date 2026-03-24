// ─── XRamp Provider Registry (Extension) ─────────────────────────────────────
// Single source of truth for all payment rails in the extension.
// Mirrors web app src/lib/providers.ts — duplicated intentionally
// (separate build environments; no shared package yet).

export type ProofEngine = 'venmo' | 'wise' | 'revolut' | 'manual';

export type RampProviderId =
  | 'venmo'
  | 'wise'
  | 'revolut'
  | 'cashapp'
  | 'paypal'
  | 'zelle'
  | 'chime';

export interface RampProvider {
  id: RampProviderId;
  label: string;
  lpHandle: string;
  handleMeta: {
    label: string;
    placeholder: string;
    prefix?: string;
  };
  proofEngine: ProofEngine;
  live: boolean;
}

export const PROVIDERS: Record<RampProviderId, RampProvider> = {
  venmo: {
    id: 'venmo',
    label: 'Venmo',
    lpHandle: '@primeaj',
    handleMeta: {
      label: 'Your Venmo username (for proof)',
      placeholder: 'yourname',
      prefix: '@',
    },
    proofEngine: 'venmo',
    live: true,
  },
  wise: {
    id: 'wise',
    label: 'Wise',
    lpHandle: 'primeaj@xramp.xyz',
    handleMeta: {
      label: 'Wise email',
      placeholder: 'you@email.com',
    },
    proofEngine: 'wise',
    live: true,
  },
  revolut: {
    id: 'revolut',
    label: 'Revolut',
    lpHandle: '@primeaj',
    handleMeta: {
      label: 'Your Revolut tag (for proof)',
      placeholder: 'yourrevtag',
      prefix: '@',
    },
    proofEngine: 'revolut',
    live: true,
  },
  cashapp: {
    id: 'cashapp',
    label: 'Cash App',
    lpHandle: '$primeaj',
    handleMeta: {
      label: 'Your Cash Tag (for proof)',
      placeholder: 'yourcashtag',
      prefix: '$',
    },
    proofEngine: 'manual',
    live: true,
  },
  paypal: {
    id: 'paypal',
    label: 'PayPal',
    lpHandle: 'primeaj@xramp.xyz',
    handleMeta: {
      label: 'Your PayPal email (for proof)',
      placeholder: 'you@email.com',
    },
    proofEngine: 'manual',
    live: true,
  },
  zelle: {
    id: 'zelle',
    label: 'Zelle',
    lpHandle: 'primeaj@xramp.xyz',
    handleMeta: {
      label: 'Your Zelle email/phone (for proof)',
      placeholder: 'email or phone',
    },
    proofEngine: 'manual',
    live: true,
  },
  chime: {
    id: 'chime',
    label: 'Chime',
    lpHandle: '@primeaj',
    handleMeta: {
      label: 'ChimeSign',
      placeholder: 'yourname',
      prefix: '@',
    },
    proofEngine: 'manual',
    live: true,
  },
};

/** Look up a provider by rail id. Falls back to venmo if unknown. */
export function getProvider(id: string): RampProvider {
  return PROVIDERS[id as RampProviderId] ?? PROVIDERS.venmo;
}
