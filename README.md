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
```

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
// Generate unique order ID
cashier.isOpen();

// Get current device type
cashier.getDeviceType();

// Get current session Id
cashier.getSessionId();
```

## Mobile Optimization

The SDK automatically detects mobile devices and adjusts the interface accordingly:

- **Desktop**: Modal overlay with backdrop and close button
- **Mobile**: Full-screen interface optimized for touch interaction

You can override device detection:

```typescript
import { DeviceType } from "@omno-payment/checkout-js";

const cashier = new CashierSDK({
  device: DeviceType.MOBILE // Force mobile layout
});
```

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
