// Feature flags for XRamp extension — controlled via env vars at build time.
// Set XRAMP_ENABLE_VENMO_PROOF=true when building to enable the Venmo proof beta.

export const VENMO_PROOF_ENABLED =
  process.env.XRAMP_ENABLE_VENMO_PROOF === 'true';
