/**
 * Revolut Payment Proof Runner
 *
 * Verifies a Revolut payment for a given XRamp intent by:
 * 1. Using chrome.scripting.executeScript on a Revolut tab to fetch transactions
 *    (inherits session cookies — never logs secret headers)
 * 2. Matching a transaction by recipient + amount + 30-min time window
 * 3. Computing proofHash = sha256(JSON.stringify(proofPayload))
 * 4. Returning a VerificationResult
 *
 * If any step fails, returns { verified: false, reason } — never crashes.
 */

export interface RevolutIntentContext {
  intentId: string;
  amount: string;
  recipientTag: string;
  memo?: string;
}

export interface RevolutVerificationResult {
  intentId: string;
  providerId: 'revolut';
  actionType: string;
  verified: boolean;
  extracted?: {
    amount?: string;
    currency?: string;
    date?: string;
    transactionId?: string;
    recipientName?: string;
  };
  proofHash?: string;
  proofPayload?: Record<string, unknown>;
  reason?: string;
}

// ---------------------------------------------------------------------------
// SHA-256 via Web Crypto (available in extension side-panel context)
// ---------------------------------------------------------------------------

async function sha256(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return 'hash-unavailable';
  }
}

// ---------------------------------------------------------------------------
// Get or open a Revolut tab so we can execute scripts with session cookies
// ---------------------------------------------------------------------------

async function getRevolutTabId(): Promise<number | null> {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://app.revolut.com/*' });
    if (tabs.length > 0 && tabs[0].id != null) {
      return tabs[0].id;
    }

    // Open the Revolut app and wait for it to load
    const tab = await chrome.tabs.create({ url: 'https://app.revolut.com/', active: false });
    if (!tab.id) return null;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Revolut tab load timeout')), 15000);
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    return tab.id;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetch Revolut transactions via chrome.scripting.executeScript
// ---------------------------------------------------------------------------

interface RevolutTransaction {
  id?: string;
  legId?: string;
  type?: string;
  state?: string;
  startedDate?: number; // epoch ms
  completedDate?: number;
  amount?: number;
  fee?: number;
  currency?: string;
  description?: string;
  recipient?: {
    id?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  merchant?: { name?: string };
  comment?: string;
}

async function fetchRevolutTransactions(tabId: number): Promise<RevolutTransaction[] | null> {
  try {
    // Revolut's internal API for recent transactions — we fetch the last 50
    const apiUrl = 'https://app.revolut.com/api/retail/user/current/transactions/last?count=50';

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: async (url: string) => {
        try {
          const resp = await fetch(url, { credentials: 'include' });
          if (!resp.ok) return null;
          return resp.json();
        } catch {
          return null;
        }
      },
      args: [apiUrl],
    });

    const raw = results?.[0]?.result;
    if (!raw || !Array.isArray(raw)) return null;
    return raw as RevolutTransaction[];
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Match a transaction in the list
// ---------------------------------------------------------------------------

function normalizeAmount(amount: number | undefined): number {
  if (amount == null) return 0;
  // Revolut amounts are in minor units (cents) for most currencies
  return Math.abs(amount) / 100;
}

function matchTransaction(
  transactions: RevolutTransaction[],
  recipientTag: string,
  expectedAmount: number,
  windowMs = 30 * 60 * 1000,
): RevolutTransaction | null {
  const now = Date.now();
  const tag = recipientTag.replace(/^@/, '').toLowerCase();

  for (const tx of transactions) {
    // Only outgoing transfers
    if (tx.type !== 'TRANSFER' || tx.state !== 'COMPLETED') continue;

    const txAmount = normalizeAmount(tx.amount);
    const txDate = tx.completedDate || tx.startedDate || 0;
    const recipientUsername = (tx.recipient?.username || '').toLowerCase();
    const recipientFullName = `${tx.recipient?.firstName || ''} ${tx.recipient?.lastName || ''}`.trim().toLowerCase();

    const amountMatch = Math.abs(txAmount - expectedAmount) < 0.02;
    const recipientMatch =
      recipientUsername === tag ||
      recipientUsername.includes(tag) ||
      tag.includes(recipientUsername) ||
      recipientFullName.includes(tag) ||
      tag.includes(recipientFullName);
    const timeMatch = now - txDate < windowMs;
    // Revolut outgoing transfers have negative amounts
    const isOutgoing = (tx.amount ?? 0) < 0;

    if (amountMatch && recipientMatch && timeMatch && isOutgoing) {
      return tx;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function verifyRevolutPayment(ctx: RevolutIntentContext): Promise<RevolutVerificationResult> {
  const base: RevolutVerificationResult = {
    intentId: ctx.intentId,
    providerId: 'revolut',
    actionType: 'transfer',
    verified: false,
  };

  try {
    const tabId = await getRevolutTabId();
    if (!tabId) {
      return { ...base, reason: 'Could not open Revolut tab. Please log in to Revolut and retry.' };
    }

    const transactions = await fetchRevolutTransactions(tabId);
    if (!transactions) {
      return { ...base, reason: 'Could not fetch Revolut transactions. Please ensure you are logged in to Revolut.' };
    }

    if (transactions.length === 0) {
      return { ...base, reason: 'No recent Revolut transactions found.' };
    }

    const expectedAmount = parseFloat(ctx.amount) || 0;
    const matched = matchTransaction(transactions, ctx.recipientTag, expectedAmount);

    if (!matched) {
      return {
        ...base,
        reason: `No matching Revolut payment found for $${ctx.amount} to ${ctx.recipientTag} in the last 30 minutes.`,
      };
    }

    const txAmount = normalizeAmount(matched.amount);
    const proofPayload: Record<string, unknown> = {
      intentId: ctx.intentId,
      providerId: 'revolut',
      actionType: 'transfer',
      amount: txAmount.toFixed(2),
      currency: matched.currency || 'USD',
      date: matched.completedDate ? new Date(matched.completedDate).toISOString() : undefined,
      transactionId: matched.id || matched.legId,
      recipientUsername: matched.recipient?.username,
      recipientName: `${matched.recipient?.firstName || ''} ${matched.recipient?.lastName || ''}`.trim(),
    };

    const proofHash = await sha256(JSON.stringify(proofPayload));

    return {
      ...base,
      verified: true,
      extracted: {
        amount: txAmount.toFixed(2),
        currency: matched.currency || 'USD',
        date: matched.completedDate ? new Date(matched.completedDate).toISOString() : undefined,
        transactionId: matched.id || matched.legId,
        recipientName: `${matched.recipient?.firstName || ''} ${matched.recipient?.lastName || ''}`.trim(),
      },
      proofHash,
      proofPayload,
    };
  } catch (e) {
    return {
      ...base,
      reason: e instanceof Error ? e.message : 'Unexpected error during Revolut verification.',
    };
  }
}
