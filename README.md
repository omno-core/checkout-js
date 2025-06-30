# Cashier SDK

A modern, framework-agnostic JavaScript SDK for integrating payment processing with customizable iframe-based cashier interfaces. Built with TypeScript for type safety and enhanced developer experience.

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
npm install cashier-sdk
```

```bash
yarn add cashier-sdk
```

```bash
pnpm add cashier-sdk
```

## Quick Start

```typescript
import { CashierSDK } from 'cashier-sdk';

const cashier = new CashierSDK({
  apiBaseUrl: 'https://api.yourpaymentprovider.com',
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  device: 'auto'
});

// Handle payment success
cashier.on('paymentSuccess', (data) => {
  console.log('Payment completed!', data);
  // Redirect to success page
  window.location.href = '/success';
});

// Handle payment errors
cashier.on('paymentError', (error) => {
  console.error('Payment failed:', error);
  alert('Payment failed. Please try again.');
});

// Open payment interface
const paymentUrl = 'https://api.yourpaymentprovider.com/checkout/session-123';
cashier.openPaymentIframe(paymentUrl);
```

## Configuration

### CashierConfig Interface

```typescript
interface CashierConfig {
  apiBaseUrl: string;           // Required: Your payment API base URL
  borderRadius?: string;        // Optional: CSS border radius (default: '8px')
  backgroundColor?: string;     // Optional: Background color (default: '#ffffff')
  device?: 'desktop' | 'mobile' | 'auto'; // Optional: Device targeting (default: 'auto')
}
```

### Example Configuration

```typescript
const config = {
  apiBaseUrl: 'https://payments.example.com',
  borderRadius: '16px',
  backgroundColor: '#f8fafc',
  device: 'auto'
};

const cashier = new CashierSDK(config);
```

## Events

The SDK provides a comprehensive event system to handle the entire payment lifecycle:

### Payment Lifecycle Events

```typescript
// Payment completed successfully
cashier.on('paymentSuccess', (data) => {
  console.log('Payment successful:', data);
  // data contains: transactionId, amount, currency, orderId, etc.
});

// Payment failed or error occurred
cashier.on('paymentError', (error) => {
  console.log('Payment error:', error);
  // error contains: message, code, details
});

// User canceled payment from within the cashier
cashier.on('paymentCanceled', (data) => {
  console.log('Payment canceled:', data);
});

// Payment is being processed (loading state)
cashier.on('paymentProcessing', (data) => {
  console.log('Payment processing:', data);
  // Show loading spinner, disable buttons
});
```

### User Interaction Events

```typescript
// User closed the iframe (X button, backdrop, or escape key)
cashier.on('userCanceled', (data) => {
  console.log('User canceled:', data.reason);
  // Possible reasons:
  // - 'close_button_clicked' - User clicked X button
  // - 'backdrop_clicked' - User clicked outside modal (desktop only)
  // - 'escape_key' - User pressed Escape key
});

// Cashier requested to close the iframe
cashier.on('iframeCloseRequested', (data) => {
  console.log('Cashier requested close:', data);
});
```

### Iframe Lifecycle Events

```typescript
// Iframe was opened
cashier.on('iframeOpened', (data) => {
  console.log('Iframe opened:', data.iframe, data.device);
  // Show loading indicator
});

// Iframe was closed
cashier.on('iframeClosed', () => {
  console.log('Iframe closed');
  // Clean up, hide loading indicators
});

// Cashier page loaded inside iframe
cashier.on('cashierLoaded', (data) => {
  console.log('Cashier loaded:', data);
  // Payment form is ready for user interaction
});
```

### Navigation Events

```typescript
// Payment requires redirect (3D Secure, bank redirect, etc.)
cashier.on('paymentRedirect', (data) => {
  console.log('Payment redirect:', data);
  // Handle redirect if needed
  if (data.redirectUrl) {
    window.location.href = data.redirectUrl;
  }
});

// Custom events from your cashier implementation
cashier.on('customEvent', (event) => {
  console.log('Custom event:', event.type, event.data);
});
```

## Methods

### Core Methods

```typescript
// Open payment iframe
const iframe = cashier.openPaymentIframe(paymentUrl, containerId?);

// Close payment iframe
cashier.closePaymentIframe();

// Clean up resources
cashier.destroy();
```

### Event Management

```typescript
// Add event listener
cashier.on('eventName', callback);

// Remove event listener
cashier.off('eventName', callback?);
```

### Utility Methods

```typescript
// Generate unique order ID
const orderId = cashier.generateOrderId();

// Get current device type
const device = cashier.getDevice(); // 'desktop' | 'mobile'

// Update device detection (useful for responsive design)
cashier.updateDevice();
```

## Framework Examples

The SDK works seamlessly with all modern JavaScript frameworks. Check out the `/examples` directory for complete implementations:

### React Example

```typescript
import React, { useEffect, useState } from 'react';
import { CashierSDK } from 'cashier-sdk';

const PaymentComponent = () => {
  const [cashier, setCashier] = useState<CashierSDK | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const sdk = new CashierSDK({
      apiBaseUrl: 'https://api.example.com'
    });

    sdk.on('paymentSuccess', (data) => {
      console.log('Payment successful!', data);
      setIsProcessing(false);
    });

    sdk.on('paymentError', (error) => {
      console.error('Payment failed:', error);
      setIsProcessing(false);
    });

    sdk.on('paymentProcessing', () => {
      setIsProcessing(true);
    });

    setCashier(sdk);

    return () => sdk.destroy();
  }, []);

  const handlePayment = () => {
    if (cashier) {
      const paymentUrl = 'https://api.example.com/checkout/session-123';
      cashier.openPaymentIframe(paymentUrl);
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

export default PaymentComponent;
```

### Vue 3 Example

```vue
<template>
  <div>
    <button @click="handlePayment" :disabled="isProcessing">
      {{ isProcessing ? 'Processing...' : 'Pay Now' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { CashierSDK } from 'cashier-sdk';

const cashier = ref(null);
const isProcessing = ref(false);

onMounted(() => {
  const sdk = new CashierSDK({
    apiBaseUrl: 'https://api.example.com'
  });

  sdk.on('paymentSuccess', (data) => {
    console.log('Payment successful!', data);
    isProcessing.value = false;
  });

  sdk.on('paymentError', (error) => {
    console.error('Payment failed:', error);
    isProcessing.value = false;
  });

  sdk.on('paymentProcessing', () => {
    isProcessing.value = true;
  });

  cashier.value = sdk;
});

onUnmounted(() => {
  if (cashier.value) {
    cashier.value.destroy();
  }
});

const handlePayment = () => {
  if (cashier.value) {
    const paymentUrl = 'https://api.example.com/checkout/session-123';
    cashier.value.openPaymentIframe(paymentUrl);
  }
};
</script>
```

### Angular Example

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CashierSDK } from 'cashier-sdk';

@Component({
  selector: 'app-payment',
  template: `
    <button (click)="handlePayment()" [disabled]="isProcessing">
      {{ isProcessing ? 'Processing...' : 'Pay Now' }}
    </button>
  `
})
export class PaymentComponent implements OnInit, OnDestroy {
  private cashier: CashierSDK | null = null;
  isProcessing = false;

  ngOnInit() {
    this.cashier = new CashierSDK({
      apiBaseUrl: 'https://api.example.com'
    });

    this.cashier.on('paymentSuccess', (data) => {
      console.log('Payment successful!', data);
      this.isProcessing = false;
    });

    this.cashier.on('paymentError', (error) => {
      console.error('Payment failed:', error);
      this.isProcessing = false;
    });

    this.cashier.on('paymentProcessing', () => {
      this.isProcessing = true;
    });
  }

  ngOnDestroy() {
    if (this.cashier) {
      this.cashier.destroy();
    }
  }

  handlePayment() {
    if (this.cashier) {
      const paymentUrl = 'https://api.example.com/checkout/session-123';
      this.cashier.openPaymentIframe(paymentUrl);
    }
  }
}
```

### Svelte Example

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { CashierSDK } from 'cashier-sdk';

  let cashier = null;
  let isProcessing = false;

  onMount(() => {
    cashier = new CashierSDK({
      apiBaseUrl: 'https://api.example.com'
    });

    cashier.on('paymentSuccess', (data) => {
      console.log('Payment successful!', data);
      isProcessing = false;
    });

    cashier.on('paymentError', (error) => {
      console.error('Payment failed:', error);
      isProcessing = false;
    });

    cashier.on('paymentProcessing', () => {
      isProcessing = true;
    });
  });

  onDestroy(() => {
    if (cashier) {
      cashier.destroy();
    }
  });

  const handlePayment = () => {
    if (cashier) {
      const paymentUrl = 'https://api.example.com/checkout/session-123';
      cashier.openPaymentIframe(paymentUrl);
    }
  };
</script>

<button on:click={handlePayment} disabled={isProcessing}>
  {isProcessing ? 'Processing...' : 'Pay Now'}
</button>
```

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
import { CashierSDK, CashierConfig, PaymentEventData } from 'cashier-sdk';

const config: CashierConfig = {
  apiBaseUrl: 'https://api.example.com'
};

const cashier = new CashierSDK(config);

cashier.on('paymentSuccess', (data: PaymentEventData) => {
  // Full type safety
  console.log(data.transactionId);
});
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
