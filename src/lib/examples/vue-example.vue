<template>
  <div class="container">
    <h1 class="title">Vue Payment Integration</h1>

    <div v-if="paymentStatus === 'success'" class="status-card success-card">
      <h2>✅ Payment Successful!</h2>
      <p>Your payment has been processed successfully.</p>
      <button @click="resetPayment" class="button primary-button reset-button">
        Make Another Payment
      </button>
    </div>

    <div v-else-if="paymentStatus === 'error'" class="status-card error-card">
      <h2>❌ Payment Failed</h2>
      <p>{{ errorMessage }}</p>
      <button @click="resetPayment" class="button primary-button reset-button">
        Try Again
      </button>
    </div>

    <div v-else-if="paymentStatus === 'canceled'" class="status-card warning-card">
      <h2>⚠️ Payment Canceled</h2>
      <p>The payment was canceled by the user.</p>
      <button @click="resetPayment" class="button primary-button reset-button">
        Try Again
      </button>
    </div>

    <div v-else class="form">
      <form @submit="initiateCardPayment">
        <div class="form-group">
          <label class="label">Amount</label>
          <input
              v-model.number="formData.amount"
              type="number"
              name="amount"
              class="input"
              min="1"
              required
          />
        </div>

        <div class="form-group">
          <label class="label">Currency</label>
          <select v-model="formData.currency" name="currency" class="input" required>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="label">First Name</label>
            <input
                v-model="formData.firstName"
                type="text"
                name="firstName"
                class="input"
                required
            />
          </div>
          <div class="form-group">
            <label class="label">Last Name</label>
            <input
                v-model="formData.lastName"
                type="text"
                name="lastName"
                class="input"
                required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="label">Email</label>
          <input
              v-model="formData.email"
              type="email"
              name="email"
              class="input"
              required
          />
        </div>

        <div class="form-group">
          <label class="label">Phone Number</label>
          <input
              v-model="formData.phoneNumber"
              type="tel"
              name="phoneNumber"
              class="input"
              required
          />
        </div>

        <div class="form-group">
          <label class="label">Address</label>
          <input
              v-model="formData.address"
              type="text"
              name="address"
              class="input"
              required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="label">City</label>
            <input
                v-model="formData.city"
                type="text"
                name="city"
                class="input"
                required
            />
          </div>
          <div class="form-group">
            <label class="label">State</label>
            <input
                v-model="formData.state"
                type="text"
                name="state"
                class="input"
                required
            />
          </div>
          <div class="form-group">
            <label class="label">Postal Code</label>
            <input
                v-model="formData.postalCode"
                type="text"
                name="postalCode"
                class="input"
                required
            />
          </div>
        </div>

        <div class="button-group">
          <button
              type="submit"
              :disabled="isLoading"
              :class="['button', 'primary-button', { 'disabled-button': isLoading }]"
          >
            {{ isLoading ? 'Processing...' : 'Pay with Card' }}
          </button>

          <button
              v-if="paymentData"
              type="button"
              @click="initiateAPMPayment"
              class="button secondary-button"
          >
            Alternative Payment Methods
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const CashierSDK = {
  constructor(config) {
    this.config = config;
    this.eventHandlers = {};
    return this;
  },
  on(event, callback) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
  },
  openPaymentIframe(url) {
    setTimeout(() => {
      this.emit('iframeOpened', { url });
      setTimeout(() => {
        const outcomes = ['paymentSuccess', 'paymentError', 'paymentCanceled'];
        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        this.emit(outcome, {
          paymentId: 'test_' + Date.now(),
          amount: 100,
          status: outcome === 'paymentSuccess' ? 'completed' : 'failed'
        });
      }, 3000);
    }, 500);
  },
  emit(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => callback(data));
    }
  },
  destroy() {
    this.eventHandlers = {};
  }
};

const PaymentService = {
  constructor(config) {
    this.config = config;
    return this;
  },
  async createPayInTransaction(data) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      paymentId: 'pay_' + Date.now(),
      status: 'pending',
      iframeUrls: {
        card: 'https://mock-payment-url.com/card',
        apm: 'https://mock-payment-url.com/apm'
      }
    };
  },
  generateOrderId() {
    return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
};

export default {
  name: 'PaymentIntegration',
  data() {
    return {
      isLoading: false,
      paymentStatus: '',
      errorMessage: '',
      paymentData: null,
      cashierSDK: null,
      paymentService: null,
      formData: {
        amount: 100,
        currency: 'USD',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+1234567890',
        country: 'US',
        dateOfBirth: '1990-01-01',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001'
      }
    };
  },
  mounted() {
    this.initializeServices();
  },
  beforeUnmount() {
    if (this.cashierSDK) {
      this.cashierSDK.destroy();
    }
  },
  methods: {
    initializeServices() {
      const paymentServiceInstance = Object.create(PaymentService);
      PaymentService.constructor.call(paymentServiceInstance, {
        apiBaseUrl: 'https://your-api-endpoint.com',
        apiKey: 'your-api-key'
      });

      const cashierSDKInstance = Object.create(CashierSDK);
      CashierSDK.constructor.call(cashierSDKInstance, {
        apiBaseUrl: 'https://your-api-endpoint.com',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        device: 'auto'
      });

      cashierSDKInstance.on('paymentSuccess', this.handlePaymentSuccess);
      cashierSDKInstance.on('paymentError', this.handlePaymentError);
      cashierSDKInstance.on('paymentCanceled', this.handlePaymentCanceled);
      cashierSDKInstance.on('iframeOpened', this.handleIframeOpened);
      cashierSDKInstance.on('iframeClosed', this.handleIframeClosed);

      this.paymentService = paymentServiceInstance;
      this.cashierSDK = cashierSDKInstance;
    },
    handlePaymentSuccess(data) {
      this.paymentStatus = 'success';
      console.log('Payment successful:', data);
    },
    handlePaymentError(data) {
      this.paymentStatus = 'error';
      this.errorMessage = data.message || 'Payment failed';
      console.error('Payment error:', data);
    },
    handlePaymentCanceled(data) {
      this.paymentStatus = 'canceled';
      console.log('Payment canceled:', data);
    },
    handleIframeOpened(data) {
      console.log('Payment iframe opened:', data);
    },
    handleIframeClosed(data) {
      console.log('Payment iframe closed:', data);
      if (this.paymentStatus === '') {
        this.paymentStatus = 'closed';
      }
    },
    async initiateCardPayment(e) {
      e.preventDefault();
      if (!this.paymentService || !this.cashierSDK) return;

      this.isLoading = true;
      this.paymentStatus = '';
      this.errorMessage = '';

      try {
        const transactionData = {
          customer: {
            firstName: this.formData.firstName,
            lastName: this.formData.lastName,
            externalUserId: `user_${Date.now()}`,
            email: this.formData.email,
            phoneNumber: this.formData.phoneNumber,
            country: this.formData.country,
            dateOfBirth: this.formData.dateOfBirth,
            billing: {
              address: this.formData.address,
              city: this.formData.city,
              state: this.formData.state,
              countryCode: this.formData.country,
              postalCode: this.formData.postalCode
            }
          },
          returnUrls: {
            success: `${window.location.origin}/payment-success`,
            failure: `${window.location.origin}/payment-failure`
          },
          kycVerified: false,
          previousTransactionCount: 0,
          webhook: {
            url: 'https://your-webhook-endpoint.com/webhook'
          },
          currency: this.formData.currency,
          orderId: this.paymentService.generateOrderId(),
          amount: this.formData.amount
        };

        const response = await this.paymentService.createPayInTransaction(transactionData);
        this.paymentData = response;

        this.cashierSDK.openPaymentIframe(response.iframeUrls.card);
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to create payment';
        this.paymentStatus = 'error';
      } finally {
        this.isLoading = false;
      }
    },
    initiateAPMPayment() {
      if (!this.paymentData || !this.cashierSDK) return;
      this.cashierSDK.openPaymentIframe(this.paymentData.iframeUrls.apm);
    },
    resetPayment() {
      this.paymentStatus = '';
      this.errorMessage = '';
      this.paymentData = null;
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Inter, sans-serif;
}

.title {
  text-align: center;
  color: #1f2937;
  margin-bottom: 2rem;
}

.form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button {
  background-color: #3b82f6;
  color: white;
}

.primary-button:hover:not(.disabled-button) {
  background-color: #2563eb;
}

.secondary-button {
  background-color: #6b7280;
  color: white;
}

.secondary-button:hover {
  background-color: #4b5563;
}

.disabled-button {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-card {
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.success-card {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.error-card {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.warning-card {
  background-color: #fffbeb;
  border: 1px solid #fed7aa;
  color: #d97706;
}

.reset-button {
  margin-top: 1rem;
}
</style>