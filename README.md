# Cashier SDK Event Handling Guide

## All Supported Events

### 1. Payment Lifecycle Events

```typescript
// Payment completed successfully
cashier.on('paymentSuccess', (data) => {
  console.log('Payment successful:', data);
  // data might contain: transactionId, amount, currency, etc.
});

// Payment failed or error occurred
cashier.on('paymentError', (error) => {
  console.log('Payment error:', error);
  // error might contain: message, code, details
});

// User canceled payment from within the cashier
cashier.on('paymentCanceled', (data) => {
  console.log('Payment canceled:', data);
  // data might contain: reason, step, etc.
});

// Payment is being processed (loading state)
cashier.on('paymentProcessing', (data) => {
  console.log('Payment processing:', data);
  // Show loading spinner, disable buttons
});
```

### 2. User Interaction Events

```typescript
// User closed the iframe by clicking X, escape, or outside
cashier.on('userCanceled', (data) => {
  console.log('User canceled:', data.reason);
  // Possible reasons:
  // - 'close_button_clicked' - User clicked X button
  // - 'backdrop_clicked' - User clicked outside modal
  // - 'escape_key' - User pressed Escape key
});

// Cashier requested to close the iframe
cashier.on('iframeCloseRequested', (data) => {
  console.log('Cashier requested close:', data);
  // Cashier itself asked to be closed
});
```

### 3. Iframe Lifecycle Events

```typescript
// Iframe was opened
cashier.on('iframeOpened', (data) => {
  console.log('Iframe opened:', data.iframe);
  // Access to the iframe element
  // Maybe show loading indicator
});

// Iframe was closed
cashier.on('iframeClosed', () => {
  console.log('Iframe closed');
  // Clean up, hide loading indicators
});

// Cashier page loaded inside iframe
cashier.on('cashierLoaded', (data) => {
  console.log('Cashier loaded:', data);
  // Payment form is ready for user
});
```

### 4. Navigation Events

```typescript
// Payment requires redirect (3D Secure, bank redirect, etc.)
cashier.on('paymentRedirect', (data) => {
  console.log('Payment redirect:', data);
  // data might contain: redirectUrl, method, etc.
  // Handle redirect if needed
});
```

### 5. Custom Events

```typescript
// Any custom event from the cashier
cashier.on('customEvent', (event) => {
  console.log('Custom event:', event.type, event.data);
  // Handle any custom events your cashier might send
});
```

## Practical Examples

### Example 1: Complete Payment Flow

```typescript
const cashier = new CashierSDK({
  apiBaseUrl: 'https://api.example.com',
  apiKey: 'your-key'
});

// Show loading state
cashier.on('iframeOpened', () => {
  document.getElementById('loading').style.display = 'block';
});

// Hide loading when cashier loads
cashier.on('cashierLoaded', () => {
  document.getElementById('loading').style.display = 'none';
});

// Handle success
cashier.on('paymentSuccess', (data) => {
  alert('Payment successful!');
  window.location.href = '/success?id=' + data.transactionId;
});

// Handle all types of cancellation
cashier.on('paymentCanceled', () => {
  alert('Payment was canceled');
});

cashier.on('userCanceled', () => {
  alert('Payment was canceled');
});

// Handle errors
cashier.on('paymentError', (error) => {
  alert('Payment failed: ' + error.message);
});
```

### Example 2: Advanced Event Handling

```typescript
// Track user behavior
cashier.on('userCanceled', (data) => {
  // Analytics tracking
  gtag('event', 'payment_canceled', {
    'reason': data.reason,
    'step': 'payment_form'
  });
  
  // Different handling based on reason
  switch(data.reason) {
    case 'close_button_clicked':
      // Maybe show "Are you sure?" dialog
      if (confirm('Are you sure you want to cancel payment?')) {
        // Really cancel
        cashier.closePaymentIframe();
      } else {
        // Reopen payment
        // You'd need to store the payment URL
        cashier.openPaymentIframe(lastPaymentUrl);
      }
      break;
      
    case 'escape_key':
      // Maybe just hide but keep the session
      console.log('User pressed escape, payment session still active');
      break;
  }
});

// Handle processing states
cashier.on('paymentProcessing', (data) => {
  // Show progress indicator
  document.getElementById('progress').innerHTML = 
    `Processing payment... ${data.step || ''}`;
});
```

### Example 3: Mobile-Friendly Implementation

```typescript
// Detect mobile and adjust behavior
const isMobile = window.innerWidth <= 768;

if (isMobile) {
  // On mobile, maybe redirect instead of iframe
  cashier.on('paymentRedirect', (data) => {
    window.location.href = data.redirectUrl;
  });
} else {
  // On desktop, use iframe
  cashier.on('paymentSuccess', (data) => {
    // Show success message in modal
    showSuccessModal(data);
  });
}
```

## Message Format from Cashier

Your cashier page should send messages like this:

```javascript
// In your cashier page
window.parent.postMessage({
  type: 'PAYMENT_SUCCESS',
  data: {
    transactionId: '12345',
    amount: 1000,
    currency: 'GEL'
  }
}, '*');

// Other message types:
// PAYMENT_FAILED, PAYMENT_ERROR
// PAYMENT_CANCELED, PAYMENT_CANCELLED  
// IFRAME_CLOSE, CLOSE_IFRAME
// PAYMENT_REDIRECT
// PAYMENT_PROCESSING
// CASHIER_LOADED
```

## Security Notes

- The SDK automatically validates message origins
- Only messages from your API domain are accepted
- All event handlers are wrapped in try-catch for safety
- Iframe has appropriate sandbox attributes