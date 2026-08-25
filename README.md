# Cashier SDK

A modern, framework-agnostic JavaScript SDK for integrating payment processing with customizable iframe-based cashier
interfaces. Built with TypeScript for type safety and enhanced developer experience.

## Features

- 🚀 **Framework Agnostic** - Works with vanilla JavaScript and all modern frameworks
- 📱 **Responsive Design** - Automatic mobile/desktop detection and optimization
- 🎨 **Customizable UI** - Configurable styling and layout options
- 🔒 **Secure** - Built-in origin validation and sandbox security
- 📊 **Event-Driven** - Comprehensive event system for payment lifecycle tracking
- 🌐 **Cross-Platform** - Works across all modern browsers and devices
- 📝 **TypeScript Support** - Full type definitions included
- 🌍 **Dynamic Language** - Set the cashier language at runtime via a postMessage event

## Installation

```bash
npm install @omno-payment/checkout-js
```

```bash
yarn add @omno-payment/checkout-js
```

```bash
pnpm add @omno-payment/checkout-js
```

## Quick Start

```typescript
import CashierSDK from "@omno-payment/checkout-js";

const cashier = new CashierSDK();

// Handle payment success
cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data) => {
  console.log("✅ Payment success", data);
});

// Handle payment fails
cashier.on(CashierEmitEvent.PAYMENT_FAILED, (data) => {
  console.error("❌ Payment failed", data);
});

// Open payment interface
const sessionId = "cashier_session_id";
cashier.open({ sessionId });
```

## Configuration

### CashierConfig Interface

```typescript
interface CashierProperties {
  device?: DeviceType;
  styles?: CashierStyles;
  returnUrlAfterRedirection?: string;
  baseUrl: string;
}


enum DeviceType {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  AUTO = 'AUTO'
}

// styles
interface CashierStyles {
  modal?: ModalStyles;
  mobile?: MobileStyles;
}

interface ModalStyles {
  backgroundColor?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  zIndex?: number;
}

interface MobileStyles {
  backgroundColor?: string;
  zIndex?: number;
  // Bottom-sheet height. Default is content-height capped at 90vh.
  //  'full'  → full-screen sheet (100% of the viewport)
  //  a CSS length/percentage ('200px', '40%', '70vh') → caps the sheet at that height
  //  'auto' / omitted → default (90vh cap)
  height?: 'full' | 'auto' | string;
}
```

### Example/Default Configuration

```typescript
import {
  DeviceType,
  type ModalStyles,
  type MobileStyles,
  CashierEmitEvent,
  type CashierProperties
} from "@omno-payment/checkout-js";

const config = {
  device: DeviceType.AUTO,
  styles: {
    modal: {
      backgroundColor: "rgba(0,0,0,0.4)",
      width: "900px",
      height: "800px",
      borderRadius: "12px",
      zIndex: 9
    } as ModalStyles,
    mobile: {
      backgroundColor: "rgba(0,0,0,0.4)",
      zIndex: 10
    } as MobileStyles,
  },
  returnUrlAfterRedirection: "http://example",
  baseUrl: "http://example"
} as CashierProperties;

const cashier = new CashierSDK(config);
```

## Events

The SDK provides a comprehensive event system to handle the entire payment lifecycle:

### Payment Lifecycle Events

```typescript
cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data) => {
  console.log("✅ Payment success", data);
});

cashier.on(CashierEmitEvent.PAYMENT_FAILED, (data) => {
  console.error("❌ Payment failed", data);
});

cashier.on(CashierEmitEvent.PAYMENT_PENDING, (data) => {
  console.log("⏳ Payment pending", data);
});

cashier.on(CashierEmitEvent.PAYMENT_CANCELED, (data) => {
  console.warn("⚠️ Payment canceled", data);
});

cashier.on(CashierEmitEvent.KYC_REQUIRED_FIELD_ERRORS, (data) => {
  console.log("KYC Required Field Errors:", data);
});

cashier.on(CashierEmitEvent.KYC_REQUIRED_LEVEL_ERRORS, (data) => {
  console.log("KYC Required Level Errors:", data);
});
```

### Analytics & Tracking Events

The SDK includes a built-in tracking bridge that enables reliable payment analytics
without requiring any additional configuration. The bridge automatically deduplicates
events, ensuring each transaction is reported exactly once — even across page navigations
or multiple open tabs.
```typescript
cashier.on(CashierEmitEvent.ANALYTICS_EVENT, (data: PaymentEmitEventData) => {
  gtag('event', 'purchase', {
    transaction_id: data.transactionId,
    currency: data.currency,
  });
});
```

> **Note:** `ANALYTICS_EVENT` is distinct from `PAYMENT_SUCCESS` — it is guaranteed
> to fire only once per `transactionId` regardless of retries, page navigation, or
> duplicate postMessage events. Use `PAYMENT_SUCCESS` for immediate UI reactions
> and `ANALYTICS_EVENT` for analytics/conversion tracking.

### Iframe Lifecycle Events

```typescript
cashier.on(CashierEmitEvent.IFRAME_OPEN_REQUESTED, () => {
  console.log("Cashier open requested");
});

cashier.on(CashierEmitEvent.IFRAME_OPENED, ({ sessionId }) => {
  console.log("Cashier opened with session:", sessionId);
});

cashier.on(CashierEmitEvent.CASHIER_LOADED, () => {
  console.log("Cashier finished loading");
});

cashier.on(CashierEmitEvent.IFRAME_CLOSE_REQUESTED, () => {
  console.log("Cashier iframe close requested");
});

cashier.on(CashierEmitEvent.IFRAME_CLOSED, () => {
  console.log("Cashier iframe closed");
});

cashier.on(CashierEmitEvent.IFRAME_DESTROYED, () => {
  console.log("Cashier destroyed");
});

```

### Additional Events

```typescript
cashier.on(CashierEmitEvent.LIVE_CHAT_CLICKED, () => {
  console.log("Live chat clicked");
});

cashier.on(CashierEmitEvent.OVERLAY_CLICKED, () => {
  console.log("Clicked outside of the cashier");
});
```

## Methods

### Core Methods

```typescript
// Open Cashier (modal by default)
cashier.open({ sessionId });

// Open Cashier in a specific container
cashier.open({ sessionId, containerId: "your-container-id" });

// Open Cashier with a specific payment action: Withdraw or Deposit
cashier.open({ sessionId, paymentAction: PaymentAction.WITHDRAW });

// Close cashier
cashier.close();

// Reload cashier
cashier.reload();

// Destroy the cashier instance completely
cashier.destroy();
```

### Utility Methods

```typescript
// Check if cashier is currently open
cashier.isOpen();

// Get current device type
cashier.getDeviceType();

// Get current session Id
cashier.getSessionId();
```

## Hosted Payment Fields

Hosted Payment Fields (HPF) let you build a **fully custom, fully branded checkout page** while Omno
hosts only the sensitive card inputs. Instead of embedding the whole Cashier, you embed four small
Omno-hosted iframe fields — **card number, expiry, CVV, and cardholder name** — into your own layout.

Raw card data is entered inside cross-origin Omno iframes, so **your page and server never touch the
PAN/CVV**. This keeps your PCI scope at **SAQ A / A-EP** instead of the full SAQ D you would take on by
handling raw card data yourself. The payment completes against the existing session — no redirect — and
your page receives an in-page success/decline/error event.

> Use HPF when you want your own checkout UI but do **not** want raw card data in your environment. If
> you're happy to embed Omno's full UI, use `cashier.open()` instead.

### What the merchant needs to do

**1. Create a card session (backend).** Same as the Cashier: create a session for the customer and get
back a `sessionId`. HPF uses a single-card-method session.

**2. Add four containers to your checkout page.** Each is a plain element you style however you like —
Omno mounts an iframe inside it.

```html
<label>Cardholder name</label>
<div id="om-cardholder"></div>

<label>Card number</label>
<div id="om-card-number"></div>

<label>Expiry</label>
<div id="om-expiry"></div>

<label>CVV</label>
<div id="om-cvv"></div>

<button id="pay" disabled>Pay</button>
```

> **Sizing:** each container must be tall enough for an input control (≈ 48–56px). The mounted iframe
> fills its container (`height: 100%`), so a container that is too short will clip the input.

**3. Initialise the SDK and mount the fields.**

```typescript
import CashierSDK, { CashierEmitEvent } from "@omno-payment/checkout-js";

const cashier = new CashierSDK({ baseUrl: "https://pay.your-omno-host.com" });

const fields = cashier.mountFields({
  sessionId,
  fields: {
    cardholder: { containerId: "om-cardholder" },
    cardNumber: { containerId: "om-card-number" },
    expiry:     { containerId: "om-expiry" },
    cvv:        { containerId: "om-cvv" },
  },
  // Optional, constrained per-field styling (see whitelist below)
  styles: {
    base: {
      color: "#1a1a2e",
      fontFamily: "-apple-system, system-ui, sans-serif",
      fontSize: "16px",
      "::placeholder": { color: "#98a2b3" },
    },
    invalid: { color: "#d92d20" },
  },
});
```

**4. React to per-field validity** to enable/disable your Pay button.

```typescript
const validity = { cardNumber: false, expiry: false, cvv: false, cardholder: false };

cashier.on(CashierEmitEvent.FIELD_VALIDITY_CHANGE, ({ field, valid }) => {
  validity[field] = valid;
  payButton.disabled = !Object.values(validity).every(Boolean);
});

// Optional focus/blur hooks for styling your container
cashier.on(CashierEmitEvent.FIELD_FOCUS, ({ field }) => {/* ... */});
cashier.on(CashierEmitEvent.FIELD_BLUR,  ({ field }) => {/* ... */});
```

**5. Submit from your own button and handle the result.** `submit()` orchestrates everything on the
Omno origin; the card values never reach your code.

```typescript
payButton.addEventListener("click", () => {
  fields.submit({ saveCard: false /*, amount: 49.99 */ });
});

cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data) => {/* show success */});
cashier.on(CashierEmitEvent.PAYMENT_FAILED,  (data) => {/* show decline  */});
cashier.on(CashierEmitEvent.PAYMENT_PENDING, (data) => {/* show spinner  */});
```

Reconcile the final outcome server-side via your existing Omno webhook, exactly as you do today.

### `mountFields` API

```typescript
cashier.mountFields({
  sessionId: string,
  fields: {
    cardNumber?: { containerId: string },
    expiry?:     { containerId: string },
    cvv?:        { containerId: string },
    cardholder?: { containerId: string },
  },
  styles?: HpfStyles,
}): { submit(options?): void; destroy(): void }
```

`submit(options?)` — `options.saveCard?: boolean` (default `false`); `options.amount?: number | string`
(required only for dynamic-amount sessions; ignored when the session has a fixed amount).

`destroy()` — removes all field iframes and the internal coordinator. You can also call
`cashier.submit(...)` / `cashier.destroyFields()` directly.

### Styling whitelist

Only these properties are forwarded to the field iframes (`styles.base`): `color`, `fontFamily`,
`fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `textAlign`, and `::placeholder: { color }`.
Invalid state color is set via `styles.invalid.color`.

### Events

| Event | Fires when |
|-------|------------|
| `FIELD_VALIDITY_CHANGE` | A field's validity changes — `{ field, valid, error? }` |
| `FIELD_FOCUS` / `FIELD_BLUR` | A field gains/loses focus — `{ field }` |
| `PAYMENT_SUCCESS` / `PAYMENT_FAILED` / `PAYMENT_PENDING` | The payment resolves (same payloads as the full Cashier) |

### Notes & current limitations

- **Cardholder name is a hosted field** (`cardholder`) alongside card number, expiry, and CVV.
- **3DS:** if the transaction requires a 3DS challenge it is currently reported as `PAYMENT_PENDING`;
  in-page challenge handling is not yet available in this release.
- **Domain allowlisting:** field routes are served with a `frame-ancestors` policy — your checkout
  domain must be registered with Omno, or the browser will block the iframes.

## Dynamic Language

The cashier language can be set at runtime by posting a `SET_LANGUAGE` message from the merchant page. The SDK picks up this event and forwards it to the cashier iframe.

This works whether the message is posted **before** or **after** calling `cashier.open()`:
- If posted before opening, the language is stored and sent to the iframe once the cashier finishes loading.
- If posted after opening, the language is forwarded to the iframe immediately.

```typescript
// Set the cashier language to Turkish
window.postMessage({ type: "SET_LANGUAGE", data: { language: "tr" } }, "*");
```

```typescript
// Any BCP 47 language tag is supported
window.postMessage({ type: "SET_LANGUAGE", data: { language: "en" } }, "*");
window.postMessage({ type: "SET_LANGUAGE", data: { language: "tr" } }, "*");
window.postMessage({ type: "SET_LANGUAGE", data: { language: "de" } }, "*");
```

> **Note:** The language value must be supported by the cashier backend. Check with your integration team for the list of supported language codes.

## Mobile Optimization

The SDK automatically detects mobile devices and adjusts the interface accordingly:

- **Desktop**: Modal overlay with backdrop and close button
- **Mobile**: A bottom sheet optimized for touch interaction

You can override device detection:

```typescript
import { DeviceType } from "@omno-payment/checkout-js";

const cashier = new CashierSDK({
  device: DeviceType.MOBILE // Force mobile layout
});
```

### Mobile sheet height

By default the mobile bottom sheet sizes to its content, capped at `90vh`. Set
`styles.mobile.height` to change this:

```typescript
const cashier = new CashierSDK({
  baseUrl: "https://pay.your-omno-host.com",
  styles: {
    mobile: {
      height: "full" // full-screen sheet (100% of the viewport)
      // height: "200px" | "40%" | "70vh"  → cap the sheet at a specific height
      // height: "auto"                    → default (content height, 90vh cap)
    }
  }
});
```

- The option applies **only** on the mobile mount (`device` resolving to `MOBILE`); it is ignored for the desktop modal and container mounts.
- Accepted values: `'full'`, `'auto'`, or a CSS length/percentage (`px`, `%`, `vh`, `dvh`, `svh`, `rem`, `em`). Any other value falls back to the default.
- Requires a cashier host that supports the `mobileHeight` parameter (Cashier UI ≥ the release that ships it); older hosts safely ignore it and render the default sheet.

## TypeScript Support

The SDK is built with TypeScript and includes full type definitions:

```typescript
import CashierSDK, {
  DeviceType,
  CashierEmitEvent,
  type CashierProperties,
  type PaymentEmitEventData
} from "@omno-payment/checkout-js";

const config: CashierProperties = {
  device: DeviceType.AUTO,
};

const cashier = new CashierSDK(config);

cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data: PaymentEmitEventData) => {
  // Full type safety
  console.log("✅ Payment success", data);
});
```

### Svelte Example

```sveltehtml

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import CashierSDK, { CashierEmitEvent, DeviceType } from "@omno-payment/checkout-js";

  const sessionId = "your-session-id-here";
  let cashier: CashierSDK;

  onMount(() => {
    // 1. Initialize SDK
    cashier = new CashierSDK({
      device: DeviceType.AUTO,
      styles: {
        modal: {
          backgroundColor: "rgba(0,0,0,0.4)",
          width: "900px",
          height: "800px",
          borderRadius: "12px",
          zIndex: 9
        },
        mobile: {
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 10
        }
      },
      returnUrlAfterRedirection: "http://example",
      baseUrl: "http://example"
    });

    // 2. Register event listeners
    cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data) => {
      console.log("✅ Payment success", data);
    });

    cashier.on(CashierEmitEvent.PAYMENT_FAILED, (data) => {
      console.error("❌ Payment failed", data);
    });

    cashier.on(CashierEmitEvent.IFRAME_CLOSED, () => {
      console.log("Cashier closed");
    });
  });

  onDestroy(() => {
    cashier?.destroy();
  });

  // 3. Actions
  const openModal = () => {
    cashier.open({ sessionId });
  }

  const openInContainer = () => {
    cashier.open({ sessionId, containerId: "cashier-slot" });
  }

</script>

<h2>Cashier SDK Demo</h2>

<div class="actions">
  <button onclick={openModal}>Open (Modal)</button>
  <button onclick={openInContainer}>Open in Container</button>
</div>

<!-- Container example -->
<div id="cashier-slot" class="cashier-slot"></div>

<style lang="scss">
  .actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .cashier-slot {
    border: 2px dashed #aaa;
    height: 500px;
    width: 100%;
    position: relative;
  }
</style>
```

### Events

| **Event**                | **Payload Type**               | **Description**                                                                          |
|--------------------------|--------------------------------|------------------------------------------------------------------------------------------|
| `iframeOpened`           | `{ sessionId: string }`        | Fired when the cashier iframe has been successfully opened with a given session.         |
| `iframeClosed`           | `void`                         | Fired when the iframe has been closed.                                                   |
| `iframeDestroyed`        | `void`                         | Fired when the iframe has been completely removed from the DOM.                          |
| `iframeOpenRequested`    | `void`                         | Fired when an iframe open request is initiated.                                          |
| `iframeCloseRequested`   | `void`                         | Fired when an iframe close request is initiated.                                         |
| `cashierLoaded`          | `void`                         | Fired once the cashier UI has finished loading.                                          |
| `liveChatClicked`        | `void`                         | Fired when the “Live Chat” button is clicked inside the cashier.                         |
| `overlayClicked`         | `void`                         | Fired when the overlay/outside cashier is clicked.                                       |
| `paymentSuccess`         | `PaymentEmitEventData`         | Fired when a payment succeeds.                                                           |
| `paymentFailed`          | `PaymentEmitEventData`         | Fired when a payment fails.                                                              |
| `paymentPending`         | `PaymentEmitEventData`         | Fired when a payment is pending.                                                         |
| `paymentCanceled`        | `PaymentEmitEventData`         | Fired when a payment is canceled by the user.                                            |
| `kycRequiredFieldErrors` | `KYCRequiredFieldErrorsData[]` | Fired when required KYC fields are missing or invalid and must be completed by the user. |
| `kycRequiredLevelErrors` | `KYCRequiredLevelErrorsData[]` | Fired when required KYC Level(s) are incompatible and must be completed by the user.     |
| `ANALYTICS_EVENT`        | `PaymentEmitEventData`         | Fired once per unique transaction after deduplication. Use this for analytics and conversion tracking instead of `paymentSuccess`. |
