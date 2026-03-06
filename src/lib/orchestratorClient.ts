// Minimal orchestrator API client for the extension.
// Mirrors the web app's orchestratorApi but without React/Vite deps.

const ORCHESTRATOR_URL = 'https://xramp-orchestrator.xramp.workers.dev';

async function apiFetch<T>(
  path: string,
  opts: RequestInit = {},
  authToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${ORCHESTRATOR_URL}${path}`, {
    ...opts,
    headers: { ...headers, ...(opts.headers as Record<string, string> || {}) },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Orchestrator ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export interface OrchestratorIntent {
  id: string;
  type: string;
  state: string;
  amount: string;
  sourceAsset: string;
  targetAsset: string;
  rail?: string;
  paymentHandle?: string;
  proofHash?: string;
  depositTxHash?: string;
  releaseTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

export const orchestratorClient = {
  async createOnrampIntent(payload: {
    userId: string;
    amount: string;
    sourceAsset: string;
    targetAsset: string;
    rail?: string;
    paymentHandle?: string;
  }, authToken?: string): Promise<{ intent: OrchestratorIntent }> {
    return apiFetch('/intents', {
      method: 'POST',
      body: JSON.stringify({ ...payload, type: 'ONRAMP' }),
    }, authToken);
  },

  async submitProof(intentId: string, payload: {
    providerId?: string;
    proofHash?: string;
    payload?: Record<string, unknown>;
  }, authToken?: string): Promise<{ proof: { id: string; intentId: string; proofHash: string } }> {
    return apiFetch(`/intents/${intentId}/proof`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }, authToken);
  },

  async transitionIntent(intentId: string, toState: string, authToken?: string): Promise<{ intent: OrchestratorIntent }> {
    return apiFetch(`/intents/${intentId}/state`, {
      method: 'PATCH',
      body: JSON.stringify({ toState }),
    }, authToken);
  },
};
