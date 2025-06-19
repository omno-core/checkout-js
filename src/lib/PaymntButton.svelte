<!-- PaymentButton.svelte -->
<script lang="ts">
    import CashierSDK, { type PayInTransactionData } from '../lib/CashierSDK';

    // Props
    export let apiBaseUrl: string;
    export let apiKey: string = '';
    export let amount: number;
    export let currency: string = 'GEL';

    export let customerData = {
        firstName: "Mikheil",
        lastName: "Maisuradze",
        externalUserId: "hacks1ash",
        email: "mikheil@omno.com",
        phoneNumber: "995 593444300",
        country: "GE",
        dateOfBirth: "2000-12-26",
        billing: {
            address: "2 Tskneti Highway",
            city: "Tbilisi",
            state: "Tbilisi",
            countryCode: "GE",
            postalCode: "0162"
        }
    };

    export let webhookUrl: string = "https://d2c86389-0379-4ecc-9279-21fa7a9372fd.mock.pstmn.io/cashier";

    let isLoading = false;
    let error: string | null = null;
    let success: boolean = false;

    const cashier = new CashierSDK({
        apiBaseUrl,
        apiKey: apiKey || undefined
    });

    async function handlePayment() {
        isLoading = true;
        error = null;
        success = false;

        try {
            const transactionData: PayInTransactionData = {
                customer: customerData,
                returnUrls: {
                    success: "IFRAME_POST_MESSAGE",
                    failure: "IFRAME_POST_MESSAGE"
                },
                kycVerified: true,
                previousTransactionCount: 100,
                webhook: {
                    url: webhookUrl
                },
                currency,
                orderId: cashier.generateOrderId(),
                amount
            };

            const response = await cashier.createPayInTransaction(transactionData);
            console.log('Transaction created:', response);

            success = true;

            const event = new CustomEvent('paymentCreated', {
                detail: response
            });
            document.dispatchEvent(event);

        } catch (err) {
            error = err instanceof Error ? err.message : 'Unknown error occurred';
            console.error('Payment failed:', err);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="payment-component">
    <button
            on:click={handlePayment}
            disabled={isLoading}
            class="payment-button"
            class:loading={isLoading}
            class:success={success}
            class:error={error}
    >
        {#if isLoading}
            Creating Payment...
        {:else if success}
            Payment Created Successfully!
        {:else}
            Pay {amount} {currency}
        {/if}
    </button>

    {#if error}
        <div class="error-message">
            Error: {error}
        </div>
    {/if}

    {#if success}
        <div class="success-message">
            Transaction created successfully! Check console for details.
        </div>
    {/if}
</div>

<style>
    .payment-component {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 300px;
    }

    .payment-button {
        padding: 12px 24px;
        font-size: 16px;
        font-weight: bold;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        background-color: #007bff;
        color: white;
    }

    .payment-button:hover:not(:disabled) {
        background-color: #0056b3;
    }

    .payment-button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    .payment-button.loading {
        background-color: #6c757d;
    }

    .payment-button.success {
        background-color: #28a745;
    }

    .payment-button.error {
        background-color: #dc3545;
    }

    .error-message {
        color: #dc3545;
        font-size: 14px;
        padding: 8px;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
    }

    .success-message {
        color: #155724;
        font-size: 14px;
        padding: 8px;
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
    }
</style>