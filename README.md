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
cashier.open(sessionId);
```

## Configuration

### CashierConfig Interface

```typescript
interface CashierProperties {
  environment?: Environment;
  device?: DeviceType;
  styles?: CashierStyles;
}

type Environment = "sandbox" | "production"

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
  environment: 'sandbox' as Environment,
  styles: {
    modal: {
      backgroundColor: "rgba(0,0,0,0.4)",
      width: "900px",
      height: "600px",
      borderRadius: "12px",
      zIndex: 12000
    } as ModalStyles,
    mobile: {
      backgroundColor: "rgba(0,0,0,0.4)",
      zIndex: 15000
    } as MobileStyles,
  }
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
```

### Iframe Lifecycle Events

```typescript
cashier.on(CashierEmitEvent.IFRAME_OPENED, ({ sessionId }) => {
  console.log("Cashier opened with session:", sessionId);
});

cashier.on(CashierEmitEvent.CASHIER_LOADED, () => {
  console.log("Cashier finished loading");
});

cashier.on(CashierEmitEvent.IFRAME_CLOSED, () => {
  console.log("Cashier iframe closed");
});

cashier.on(CashierEmitEvent.IFRAME_DESTROYED, () => {
  console.log("Cashier destroyed");
});
```

## Methods

### Core Methods

```typescript
// Open Cashier (modal by default)
cashier.open(sessionId);

// Open Cashier in a specific container
cashier.open(sessionId, "your_container_id");

// Close cashier
cashier.close();

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
const cashier = new CashierSDK({
  apiBaseUrl: 'https://api.example.com',
  device: 'mobile' // Force mobile layout
});
```

## Security

The SDK includes several security features:

## Cashier Integration

Your cashier page should send messages to the parent window using the following format:

```javascript
// Payment successful
window.parent.postMessage({
  type: 'PAYMENT_SUCCESS',
  data: {
    transactionId: '12345',
    amount: 1000,
    currency: 'USD',
    orderId: 'order-789'
  }
}, '*');

// Payment failed
window.parent.postMessage({
  type: 'PAYMENT_ERROR',
  data: {
    message: 'Card declined',
    code: 'CARD_DECLINED',
    details: { ... }
  }
}, '*');

// Payment processing
window.parent.postMessage({
  type: 'PAYMENT_PROCESSING',
  data: {
    step: 'Validating card...'
  }
}, '*');

// Cashier loaded
window.parent.postMessage({
  type: 'CASHIER_LOADED',
  data: {}
}, '*');
```

### Supported Message Types

- `PAYMENT_SUCCESS` - Payment completed successfully
- `PAYMENT_ERROR` / `PAYMENT_FAILED` - Payment failed
- `PAYMENT_CANCELED` / `PAYMENT_CANCELLED` - Payment canceled
- `PAYMENT_PROCESSING` - Payment is being processed
- `PAYMENT_REDIRECT` - Redirect required (3D Secure, etc.)
- `CASHIER_LOADED` - Cashier interface loaded
- `IFRAME_CLOSE` / `CLOSE_IFRAME` - Request to close iframe

- **Origin Validation**: Only accepts messages from your configured API domain
- **Sandbox Attributes**: Iframe is sandboxed with minimal required permissions
- **Error Handling**: All event handlers are wrapped in try-catch blocks
- **Input Validation**: Configuration parameters are validated

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile, etc.)

## TypeScript Support

The SDK is built with TypeScript and includes full type definitions:

```typescript
import CashierSDK, {
  DeviceType,
  CashierEmitEvent,
  type Environment,
  type CashierProperties,
  type PaymentEmitEventData
} from "@omno-payment/checkout-js";

const config: CashierProperties = {
  device: DeviceType.AUTO,
  environment: 'sandbox' as Environment,
};

const cashier = new CashierSDK(config);

cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data: PaymentEmitEventData) => {
  // Full type safety
  console.log("✅ Payment success", data);
});
```