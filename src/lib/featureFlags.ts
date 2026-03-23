// Feature flags for XRamp extension — controlled via env vars at build time.
// Defaults to true; set XRAMP_ENABLE_VENMO_PROOF=false to disable.

export const VENMO_PROOF_ENABLED =
  process.env.XRAMP_ENABLE_VENMO_PROOF !== 'false';
