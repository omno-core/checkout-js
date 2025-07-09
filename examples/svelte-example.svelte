<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { CashierSDK } from '../lib/CashierSDK';
    import { PaymentService } from '../PaymentService';
    import type { PayInTransactionData, PayInResponse } from '../PaymentService';

    let isLoading = false;
    let paymentStatus = '';
    let errorMessage = '';
    let paymentData: PayInResponse | null = null;

    let cashierSDK: CashierSDK | null = null;
    let paymentService: PaymentService | null = null;

    let formData = {
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

    onMount(() => {
        paymentService = new PaymentService({
            apiBaseUrl: 'https://your-api-endpoint.com',
            apiKey: 'your-api-key'
        });

        cashierSDK = new CashierSDK({
            apiBaseUrl: 'https://your-api-endpoint.com',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            device: 'auto'
        });

        cashierSDK.on('paymentSuccess', handlePaymentSuccess);
        cashierSDK.on('paymentError', handlePaymentError);
        cashierSDK.on('paymentCanceled', handlePaymentCanceled);
        cashierSDK.on('iframeOpened', handleIframeOpened);
        cashierSDK.on('iframeClosed', handleIframeClosed);
    });

    onDestroy(() => {
        if (cashierSDK) {
            cashierSDK.destroy();
        }
    });

    function handlePaymentSuccess(data: any) {
        paymentStatus = 'success';
        console.log('Payment successful:', data);
    }

    function handlePaymentError(data: any) {
        paymentStatus = 'error';
        errorMessage = data.message || 'Payment failed';
        console.error('Payment error:', data);
    }

    function handlePaymentCanceled(data: any) {
        paymentStatus = 'canceled';
        console.log('Payment canceled:', data);
    }

    function handleIframeOpened(data: any) {
        console.log('Payment iframe opened:', data);
    }

    function handleIframeClosed(data: any) {
        console.log('Payment iframe closed:', data);
        if (paymentStatus === '') {
            paymentStatus = 'closed';
        }
    }

    async function initiateCardPayment() {
        if (!paymentService || !cashierSDK) return;

        isLoading = true;
        paymentStatus = '';
        errorMessage = '';

        try {
            const transactionData: PayInTransactionData = {
                customer: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    externalUserId: `user_${Date.now()}`,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    country: formData.country,
                    dateOfBirth: formData.dateOfBirth,
                    billing: {
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        countryCode: formData.country,
                        postalCode: formData.postalCode
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
                currency: formData.currency,
                orderId: paymentService.generateOrderId(),
                amount: formData.amount
            };

            const response = await paymentService.createPayInTransaction(transactionData);
            paymentData = response;

            cashierSDK.openPaymentIframe(response.iframeUrls.card);

        } catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Failed to create payment';
            paymentStatus = 'error';
        } finally {
            isLoading = false;
        }
    }

    async function initiateAPMPayment() {
        if (!paymentData || !cashierSDK) return;
        cashierSDK.openPaymentIframe(paymentData.iframeUrls.apm);
    }

    function resetPayment() {
        paymentStatus = '';
        errorMessage = '';
        paymentData = null;
    }
</script>

<div class="payment-container">
    <h1>Svelte Payment Integration</h1>

    {#if paymentStatus === 'success'}
        <div class="status-card success">
            <h2>✅ Payment Successful!</h2>
            <p>Your payment has been processed successfully.</p>
            <button on:click={resetPayment}>Make Another Payment</button>
        </div>
    {:else if paymentStatus === 'error'}
        <div class="status-card error">
            <h2>❌ Payment Failed</h2>
            <p>{errorMessage}</p>
            <button on:click={resetPayment}>Try Again</button>
        </div>
    {:else if paymentStatus === 'canceled'}
        <div class="status-card warning">
            <h2>⚠️ Payment Canceled</h2>
            <p>The payment was canceled by the user.</p>
            <button on:click={resetPayment}>Try Again</button>
        </div>
    {:else}
        <form class="payment-form" on:submit|preventDefault={initiateCardPayment}>
            <div class="form-group">
                <label for="amount">Amount</label>
                <input
                        id="amount"
                        type="number"
                        bind:value={formData.amount}
                        min="1"
                        required
                />
            </div>

            <div class="form-group">
                <label for="currency">Currency</label>
                <select id="currency" bind:value={formData.currency} required>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                </select>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="firstName">First Name</label>
                    <input
                            id="firstName"
                            type="text"
                            bind:value={formData.firstName}
                            required
                    />
                </div>
                <div class="form-group">
                    <label for="lastName">Last Name</label>
                    <input
                            id="lastName"
                            type="text"
                            bind:value={formData.lastName}
                            required
                    />
                </div>
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input
                        id="email"
                        type="email"
                        bind:value={formData.email}
                        required
                />
            </div>

            <div class="form-group">
                <label for="phone">Phone Number</label>
                <input
                        id="phone"
                        type="tel"
                        bind:value={formData.phoneNumber}
                        required
                />
            </div>

            <div class="form-group">
                <label for="address">Address</label>
                <input
                        id="address"
                        type="text"
                        bind:value={formData.address}
                        required
                />
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="city">City</label>
                    <input
                            id="city"
                            type="text"
                            bind:value={formData.city}
                            required
                    />
                </div>
                <div class="form-group">
                    <label for="state">State</label>
                    <input
                            id="state"
                            type="text"
                            bind:value={formData.state}
                            required
                    />
                </div>
                <div class="form-group">
                    <label for="postalCode">Postal Code</label>
                    <input
                            id="postalCode"
                            type="text"
                            bind:value={formData.postalCode}
                            required
                    />
                </div>
            </div>

            <div class="payment-buttons">
                <button
                        type="submit"
                        disabled={isLoading}
                        class="btn btn-primary"
                >
                    {isLoading ? 'Processing...' : 'Pay with Card'}
                </button>

                {#if paymentData}
                    <button
                            type="button"
                            on:click={initiateAPMPayment}
                            class="btn btn-secondary"
                    >
                        Alternative Payment Methods
                    </button>
                {/if}
            </div>
        </form>
    {/if}
</div>

<style>
    .payment-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
        font-family: 'Inter', sans-serif;
    }

    h1 {
        text-align: center;
        color: #1f2937;
        margin-bottom: 2rem;
    }

    .payment-form {
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

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
    }

    input, select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 1rem;
    }

    input:focus, select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .payment-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }

    .btn {
        flex: 1;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-primary {
        background-color: #3b82f6;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background-color: #2563eb;
    }

    .btn-secondary {
        background-color: #6b7280;
        color: white;
    }

    .btn-secondary:hover:not(:disabled) {
        background-color: #4b5563;
    }

    .status-card {
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
    }

    .status-card.success {
        background-color: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;
    }

    .status-card.error {
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
    }

    .status-card.warning {
        background-color: #fffbeb;
        border: 1px solid #fed7aa;
        color: #d97706;
    }

    .status-card h2 {
        margin: 0 0 1rem 0;
    }

    .status-card button {
        margin-top: 1rem;
        padding: 0.75rem 1.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    }
</style>
