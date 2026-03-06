/**
 * Venmo Payment Proof Runner
 *
 * Verifies a Venmo payment for a given XRamp intent by:
 * 1. Using chrome.scripting.executeScript on a Venmo tab to fetch the stories API
 *    (inherits session cookies — never logs secret headers)
 * 2. Matching a transaction by receiver + amount + 30-min time window
 * 3. Computing proofHash = sha256(JSON.stringify(proofPayload))
 * 4. Returning a VerificationResult
 *
 * If any step fails, returns { verified: false, reason } — never crashes.
 */

import { venmoTemplate, providerId } from '../providers/venmo';

export interface IntentContext {
  intentId: string;
  amount: string;
  receiverUsernameOrId: string;
  note?: string;
}

export interface VerificationResult {
  intentId: string;
  providerId: typeof providerId;
  actionType: string;
  verified: boolean;
  extracted?: {
    amount?: string;
    date?: string;
    paymentId?: string;
    receiverId?: string;
    receiverUsername?: string;
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
// Get or open a Venmo tab so we can execute scripts with session cookies
// ---------------------------------------------------------------------------

async function getVenmoTabId(): Promise<number | null> {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://account.venmo.com/*' });
    if (tabs.length > 0 && tabs[0].id != null) {
      return tabs[0].id;
    }

    // Open the Venmo auth link and wait for it to load
    const tab = await chrome.tabs.create({ url: venmoTemplate.authLink, active: false });
    if (!tab.id) return null;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Venmo tab load timeout')), 15000);
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
// Fetch Venmo stories via chrome.scripting.executeScript (inherits cookies)
// ---------------------------------------------------------------------------

async function fetchVenmoStories(tabId: number, senderId?: string): Promise<unknown[] | null> {
  try {
    const url = senderId
      ? `https://account.venmo.com/api/stories?feedType=me&externalId=${senderId}`
      : 'https://account.venmo.com/api/stories?feedType=me';

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: async (apiUrl: string) => {
        try {
          const resp = await fetch(apiUrl, { credentials: 'include' });
          if (!resp.ok) return null;
          return resp.json();
        } catch {
          return null;
        }
      },
      args: [url],
    });

    const raw = results?.[0]?.result as { stories?: unknown[] } | null;
    if (!raw || !Array.isArray(raw.stories)) return null;
    return raw.stories;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Match a transaction in the stories array
// ---------------------------------------------------------------------------

interface VenmoStory {
  amount?: string;
  date?: string;
  paymentId?: string;
  currency?: string;
  title?: {
    receiver?: { username?: string; id?: string };
    sender?: { id?: string };
  };
}

function normalizeAmount(raw: string): number {
  // Venmo amounts come as "- $50.00" or "+ $50.00" or just "50.00"
  return parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;
}

function matchTransaction(
  stories: unknown[],
  receiverUsernameOrId: string,
  expectedAmount: number,
  windowMs = 30 * 60 * 1000,
): VenmoStory | null {
  const now = Date.now();
  const receiver = receiverUsernameOrId.replace(/^@/, '').toLowerCase();

  for (const raw of stories) {
    const story = raw as VenmoStory;
    if (!story.amount || !story.date) continue;

    const storyAmount = normalizeAmount(story.amount);
    const storyDate = new Date(story.date).getTime();
    const storyReceiver = (story.title?.receiver?.username || '').toLowerCase();
    const storyReceiverId = (story.title?.receiver?.id || '').toLowerCase();

    const amountMatch = Math.abs(storyAmount - expectedAmount) < 0.02;
    const receiverMatch =
      storyReceiver === receiver ||
      storyReceiverId === receiver ||
      storyReceiver.includes(receiver) ||
      receiver.includes(storyReceiver);
    const timeMatch = now - storyDate < windowMs;

    if (amountMatch && receiverMatch && timeMatch) {
      return story;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function verifyVenmoPayment(ctx: IntentContext): Promise<VerificationResult> {
  const base: VerificationResult = {
    intentId: ctx.intentId,
    providerId,
    actionType: venmoTemplate.actionType,
    verified: false,
  };

  try {
    const tabId = await getVenmoTabId();
    if (!tabId) {
      return { ...base, reason: 'Could not open Venmo tab. Please log in to Venmo and retry.' };
    }

    const stories = await fetchVenmoStories(tabId);
    if (!stories) {
      return { ...base, reason: 'Could not fetch Venmo transactions. Please ensure you are logged in to Venmo.' };
    }

    if (stories.length === 0) {
      return { ...base, reason: 'No recent Venmo transactions found.' };
    }

    const expectedAmount = parseFloat(ctx.amount) || 0;
    const matched = matchTransaction(stories, ctx.receiverUsernameOrId, expectedAmount);

    if (!matched) {
      return {
        ...base,
        reason: `No matching Venmo payment found for $${ctx.amount} to ${ctx.receiverUsernameOrId} in the last 30 minutes.`,
      };
    }

    // Build proof payload — apply responseRedactions (omit secretHeaders per spec)
    const proofPayload: Record<string, unknown> = {
      intentId: ctx.intentId,
      providerId,
      actionType: venmoTemplate.actionType,
      amount: matched.amount,
      date: matched.date,
      paymentId: matched.paymentId,
      receiverUsername: matched.title?.receiver?.username,
      receiverId: matched.title?.receiver?.id,
      currency: matched.currency || 'USD',
    };

    const proofHash = await sha256(JSON.stringify(proofPayload));

    return {
      ...base,
      verified: true,
      extracted: {
        amount: matched.amount,
        date: matched.date,
        paymentId: matched.paymentId,
        receiverId: matched.title?.receiver?.id,
        receiverUsername: matched.title?.receiver?.username,
      },
      proofHash,
      proofPayload,
    };
  } catch (e) {
    return {
      ...base,
      reason: e instanceof Error ? e.message : 'Unexpected error during Venmo verification.',
    };
  }
}
