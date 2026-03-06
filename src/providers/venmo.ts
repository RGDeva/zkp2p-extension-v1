// Deep-import the Venmo payment template from @zkp2p/providers.
// This template defines the API URL, response selectors, and proof metadata
// needed to verify a Venmo payment without revealing the full transaction.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const venmoTemplate = require('@zkp2p/providers/venmo/transfer_venmo.json') as VenmoTemplate;

export { venmoTemplate };

export const providerId = 'venmo' as const;

export interface VenmoTemplate {
  actionType: string;
  proofEngine: string;
  authLink: string;
  url: string;
  method: string;
  metadata: {
    platform: string;
    urlRegex: string;
    transactionsExtraction: {
      transactionJsonPathListSelector: string;
      transactionJsonPathSelectors: {
        recipient: string;
        amount: string;
        date: string;
        paymentId: string;
        currency: string;
      };
    };
    proofMetadataSelectors: Array<{ type: string; value: string }>;
  };
  paramNames: string[];
  secretHeaders: string[];
  responseMatches: Array<{ type: string; value: string }>;
  responseRedactions: Array<{ jsonPath: string; xPath: string }>;
}
