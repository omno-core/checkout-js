import { Component, OnInit, OnDestroy } from '@angular/core';

class CashierSDK {
    private config: any;
    private eventHandlers: { [key: string]: Function[] } = {};

    constructor(config: any) {
        this.config = config;
    }

    on(event: string, callback: Function): void {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }

    openPaymentIframe(url: string): void {
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
    }

    private emit(event: string, data: any): void {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(callback => callback(data));
        }
    }

    destroy(): void {
        this.eventHandlers = {};
    }
}

class PaymentService {
    private config: any;

    constructor(config: any) {
        this.config = config;
    }

    async createPayInTransaction(data: any): Promise<any> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            paymentId: 'pay_' + Date.now(),
            status: 'pending',
            iframeUrls: {
                card: 'https://mock-payment-url.com/card',
                apm: 'https://mock-payment-url.com/apm'
            }
        };
    }

    generateOrderId(): string {
        return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

interface FormData {
    amount: number;
    currency: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    country: string;
    dateOfBirth: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
}

@Component({
    selector: 'app-payment-integration',
    template: `
    <div class="container">
      <h1 class="title">Angular Payment Integration</h1>

      <div *ngIf="paymentStatus === 'success'" class="status-card success-card">
        <h2>✅ Payment Successful!</h2>
        <p>Your payment has been processed successfully.</p>
        <button (click)="resetPayment()" class="button primary-button reset-button">
          Make Another Payment
        </button>
      </div>

      <div *ngIf="paymentStatus === 'error'" class="status-card error-card">
        <h2>❌ Payment Failed</h2>
        <p>{{ errorMessage }}</p>
        <button (click)="resetPayment()" class="button primary-button reset-button">
          Try Again
        </button>
      </div>

      <div *ngIf="paymentStatus === 'canceled'" class="status-card warning-card">
        <h2>⚠️ Payment Canceled</h2>
        <p>The payment was canceled by the user.</p>
        <button (click)="resetPayment()" class="button primary-button reset-button">
          Try Again
        </button>
      </div>

      <div *ngIf="!paymentStatus" class="form">
        <form (ngSubmit)="initiateCardPayment($event)">
          <div class="form-group">
            <label class="label">Amount</label>
            <input
              [(ngModel)]="formData.amount"
              type="number"
              name="amount"
              class="input"
              min="1"
              required
            />
          </div>

          <div class="form-group">
            <label class="label">Currency</label>
            <select [(ngModel)]="formData.currency" name="currency" class="input" required>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="label">First Name</label>
              <input
                [(ngModel)]="formData.firstName"
                type="text"
                name="firstName"
                class="input"
                required
              />
            </div>
            <div class="form-group">
              <label class="label">Last Name</label>
              <input
                [(ngModel)]="formData.lastName"
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
              [(ngModel)]="formData.email"
              type="email"
              name="email"
              class="input"
              required
            />
          </div>

          <div class="form-group">
            <label class="label">Phone Number</label>
            <input
              [(ngModel)]="formData.phoneNumber"
              type="tel"
              name="phoneNumber"
              class="input"
              required
            />
          </div>

          <div class="form-group">
            <label class="label">Address</label>
            <input
              [(ngModel)]="formData.address"
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
                [(ngModel)]="formData.city"
                type="text"
                name="city"
                class="input"
                required
              />
            </div>
            <div class="form-group">
              <label class="label">State</label>
              <input
                [(ngModel)]="formData.state"
                type="text"
                name="state"
                class="input"
                required
              />
            </div>
            <div class="form-group">
              <label class="label">Postal Code</label>
              <input
                [(ngModel)]="formData.postalCode"
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
              [disabled]="isLoading"
              [class]="'button primary-button' + (isLoading ? ' disabled-button' : '')"
            >
              {{ isLoading ? 'Processing...' : 'Pay with Card' }}
            </button>

            <button
              *ngIf="paymentData"
              type="button"
              (click)="initiateAPMPayment()"
              class="button secondary-button"
            >
              Alternative Payment Methods
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
    styles: [`
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
  `]
})
export class PaymentIntegrationComponent implements OnInit, OnDestroy {
    isLoading = false;
    paymentStatus = '';
    errorMessage = '';
    paymentData: any = null;
    cashierSDK: CashierSDK | null = null;
    paymentService: PaymentService | null = null;

    formData: FormData = {
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
    };

    ngOnInit(): void {
        this.initializeServices();
    }

    ngOnDestroy(): void {
        if (this.cashierSDK) {
            this.cashierSDK.destroy();
        }
    }

    private initializeServices(): void {
        // Initialize PaymentService
        this.paymentService = new PaymentService({
            apiBaseUrl: 'https://your-api-endpoint.com',
            apiKey: 'your-api-key'
        });

        // Initialize CashierSDK
        this.cashierSDK = new CashierSDK({
            apiBaseUrl: 'https://your-api-endpoint.com',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            device: 'auto'
        });

        // Setup event listeners
        this.cashierSDK.on('paymentSuccess', (data: any) => this.handlePaymentSuccess(data));
        this.cashierSDK.on('paymentError', (data: any) => this.handlePaymentError(data));
        this.cashierSDK.on('paymentCanceled', (data: any) => this.handlePaymentCanceled(data));
        this.cashierSDK.on('iframeOpened', (data: any) => this.handleIframeOpened(data));
        this.cashierSDK.on('iframeClosed', (data: any) => this.handleIframeClosed(data));
    }

    private handlePaymentSuccess(data: any): void {
        this.paymentStatus = 'success';
        console.log('Payment successful:', data);
    }

    private handlePaymentError(data: any): void {
        this.paymentStatus = 'error';
        this.errorMessage = data.message || 'Payment failed';
        console.error('Payment error:', data);
    }

    private handlePaymentCanceled(data: any): void {
        this.paymentStatus = 'canceled';
        console.log('Payment canceled:', data);
    }

    private handleIframeOpened(data: any): void {
        console.log('Payment iframe opened:', data);
    }

    private handleIframeClosed(data: any): void {
        console.log('Payment iframe closed:', data);
        if (this.paymentStatus === '') {
            this.paymentStatus = 'closed';
        }
    }

    async initiateCardPayment(event: Event): Promise<void> {
        event.preventDefault();
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
    }

    initiateAPMPayment(): void {
        if (!this.paymentData || !this.cashierSDK) return;
        this.cashierSDK.openPaymentIframe(this.paymentData.iframeUrls.apm);
    }

    resetPayment(): void {
        this.paymentStatus = '';
        this.errorMessage = '';
        this.paymentData = null;
    }
}

// app.module.ts (Required imports)
/*
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { PaymentIntegrationComponent } from './payment-integration.component';

@NgModule({
  declarations: [
    AppComponent,
    PaymentIntegrationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
*/