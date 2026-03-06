<img src="src/assets/img/icon-48.png" width="64"/>

# XRamp Chrome Extension (MV3)

> P2P crypto on/off-ramp with Venmo payment proof verification.  
> Forked from zkp2p/zkp2p-extension-v1. Uses `@zkp2p/providers` for Venmo templates.

---

## Quick Start

```bash
npm install --legacy-peer-deps
npm run dev          # watch build (loads at chrome://extensions → build/)
```

### Production build (Venmo proof enabled)

```bash
XRAMP_ENABLE_VENMO_PROOF=true NODE_ENV=production npm run build
# → build/ is ready to load unpacked
```

### Production build (Venmo proof disabled / default)

```bash
NODE_ENV=production npm run build
```

---

## Feature Flag: Venmo Proof (Beta)

| Flag | Default | Effect |
|---|---|---|
| `XRAMP_ENABLE_VENMO_PROOF=true` | `false` | Shows **Verify with Venmo** button on payment pending screen |

Set at **build time** via env var. The flag gates only the UI button — all other buy/sell flows work normally with either value.

---

## How to Demo Venmo Payment Proof

### Prerequisites
- XRamp web app open at https://xramp-app.vercel.app (or localhost:5173)
- Extension loaded with `XRAMP_ENABLE_VENMO_PROOF=true` build
- Logged in to Venmo at account.venmo.com in a Chrome tab
- Logged in to XRamp with `rishig@umich.edu` (admin) for escrow release

### Step-by-step demo

**1. Create intent in extension**
```
Open extension → Buy Crypto
Enter: $1.00 · Venmo · @xramp_receiver
Click Continue → intent created via orchestrator → "Awaiting Payment" screen
```

**2. Make the real Venmo payment**
```
Open Venmo app / website
Send $1.00 to @xramp_receiver
Memo: XRAMP-<intentId shown in extension>
```

**3. Verify with Venmo (extension)**
```
Click "Verify with Venmo (Beta)"
Extension fetches account.venmo.com/api/stories (using your session cookies)
Matches transaction by amount + receiver + 30-min window
Computes SHA-256 proofHash
→ Submits to orchestrator: POST /intents/:id/proof
→ Relays XRAMP_PROOF_RESULT to XRamp web app tab
```

**4. Observe in web app**
```
Web app receives postMessage → calls POST /intents/:id/proof (idempotent)
Toast: "Payment proof submitted — Awaiting admin release"
Open Activity tab → select intent → see Proof Hash + "Pending admin review"
```

**5. Admin releases escrow (as rishig@umich.edu)**
```
Activity → select intent → click "Verify + Release Escrow"
Worker calls XRampEscrow.release() on Fuji
Toast: "Proof verified — escrow released!"
Activity → Release Tx → snowtrace link appears
```

### Expected proof hash display
```
Extension:  ← proofHash shown as  abcd1234…ef56789
Activity:   Proof Hash  abcd1234…ef56789  ✓ Verified
            Release Tx  0x1a2b…3c4d  ↗ (Snowtrace)
```

---

## Architecture

```
Extension side panel
  └─ XRampBuy (form → pending → verifying → verified/failed)
       ├─ orchestratorClient.ts  → POST /intents (create)
       ├─ venmoProofRunner.ts    → chrome.scripting.executeScript on Venmo tab
       │                            fetch stories API with session cookies
       │                            match tx → sha256 proofHash
       ├─ orchestratorClient.ts  → POST /intents/:id/proof (submit)
       └─ chrome.runtime.sendMessage('xramp_proof_to_tab')
            └─ Background → chrome.tabs.sendMessage → Content script
                                └─ window.postMessage(XRAMP_PROOF_RESULT)
                                        └─ Web app AppLayout listener
                                             ├─ POST /intents/:id/proof
                                             └─ POST /intents/:id/verify (admin)
```

---

## Contracts (Fuji Testnet)

| Contract | Address |
|---|---|
| MockUSDC | `0xb2F4Ca689C54bCe4effcf8A12Cb02089C933C5c6` |
| XRampEscrow | `0xe1189d9644Ba8546FB421c02fd28bf64CF74F821` |
| Explorer | https://testnet.snowtrace.io |

Orchestrator: https://xramp-orchestrator.xramp.workers.dev

---

## Original ZKP2P docs

### ⚠️ Notice

- When running the extension against a local [notary server](https://github.com/tlsnotary/tlsn/releases), please ensure that the server's version is the same as the version of this extension

## Installing and Running

### Procedures:

1. Check if your [Node.js](https://nodejs.org/) version is >= **18**.
2. Clone this repository.
3. Run `yarn` to install the dependencies.
4. Run `yarn dev`
5. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.
6. Happy hacking.

## Building Websockify Docker Image

```
$ git clone https://github.com/novnc/websockify && cd websockify
$ ./docker/build.sh
$ docker run -it --rm -p 55688:80 novnc/websockify 80 wise.com:443
```

## Running Websockify Docker Image

```
$ cd zk-p2p-extension
$ docker run -it --rm -p 55688:80 novnc/websockify 80 wise.com:443
```

## Packing

After the development of your extension run the command

```
$ NODE_ENV=production yarn build
```

Now, the content of `build` folder will be the extension ready to be submitted to the Chrome Web Store. Just take a look at the [official guide](https://developer.chrome.com/webstore/publish) to more infos about publishing.

## Resources:

- [Webpack documentation](https://webpack.js.org/concepts/)
- [Chrome Extension documentation](https://developer.chrome.com/extensions/getstarted)
