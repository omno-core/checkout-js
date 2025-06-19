<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import CashierSDK, { type PayInTransactionData } from '../lib/CashierSDK';
    import { browser } from "$app/environment";

    let cashier: CashierSDK | null = null;
    let message: { type: 'success' | 'error' | 'info', text: string } | null = null;

    function showMessage(type: 'success' | 'error' | 'info', text: string) {
        message = { type, text };
        setTimeout(() => {
            message = null;
        }, 5000);
    }

    function closeMessage() {
        message = null;
    }

    onMount(() => {
        if (browser) {
            cashier = new CashierSDK({
                apiBaseUrl: 'http://api.omno.dev/public',
                apiKey: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJvVFJ6ak1rQkt5Z1lZNGlmZGNFaE42LWlKZUZUUGFVR0dqeE5yV1RpSWJzIn0.eyJleHAiOjE3NTAyNzIyNTcsImlhdCI6MTc1MDI3MTk1NywianRpIjoiMTc2NzNhNmMtMjEzNi00NmIzLTlmZDItZjcyYTk0MzhlYjQ0IiwiaXNzIjoiaHR0cHM6Ly9zc28uc3RhZ2luZ3NzZXUuY29tL3JlYWxtcy9zc2V1IiwiYXVkIjpbInJvdXRlci1zZXJ2aWNlIiwia3ljLXNlcnZpY2UiLCJhY2NvdW50aW5nLXNlcnZpY2UiLCJjdXN0b21lci1zZXJ2aWNlIiwibWVyY2hhbnQtc2VydmljZSIsInByb2R1Y3Qtc2VydmljZSIsInJlcG9ydGluZy1zZXJ2aWNlIiwidHJhbnNhY3Rpb24tc2VydmljZSIsInVzZXItc2VydmljZSIsImFjY291bnQiLCJub3RpZmljYXRpb24tc2VydmljZSJdLCJzdWIiOiJhNzc5Y2NiNC0yN2M1LTRjZmEtYTA3OS02MDdjODEzZjlkMjIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiI3MTMyMjMzY2MxNjM0NWRkOWIxOWNhNzk1M2RkNzY4NSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3M6IjpbInJvdXRlci1zZXJ2aWNlIjpbImNyZWF0ZS1yb3V0ZXIiLCJ2aWV3LXJvdXRlciIsInVwZGF0ZS1yb3V0ZXIiLCJkZWxldGUtcm91dGVyIiwicm91dGVyLWFkbWluaXN0cmF0b3IiXX0sImt5Yy1zZXJ2aWNlIjp7InJvbGVzIjpbImt5Y3NlcnZpY2VfYmFzaWMiXX0sImFjY291bnRpbmctc2VydmljZSI6eyJyb2xlcyI6WyJhY2NvdW50aW5nc2VydmljZV9iYXNpYyJdfSwiY3VzdG9tZXItc2VydmljZSI6eyJyb2xlcyI6WyJjdXN0b21lcnNlcnZpY2VfYmFzaWMiXX0sIm1lcmNoYW50LXNlcnZpY2UiOnsicm9sZXMiOlsibWVyY2hhbnRzZXJ2aWNlX2Jhc2ljIl19LCJwcm9kdWN0LXNlcnZpY2UiOnsicm9sZXMiOlsicHJvZHVjdHNlcnZpY2VfYmFzaWMiXX0sInJlcG9ydGluZy1zZXJ2aWNlIjp7InJvbGVzIjpbInJlcG9ydGluZ3NlcnZpY2VfYmFzaWMiXX0sInRyYW5zYWN0aW9uLXNlcnZpY2UiOnsicm9sZXMiOlsidHJhbnNhY3Rpb25zZXJ2aWNlX2Jhc2ljIl19LCJ1c2VyLXNlcnZpY2UiOnsicm9sZXMiOlsidXNlcnNlcnZpY2VfYmFzaWMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJ2aWV3LWFwcGxpY2F0aW9ucyIsInZpZXctY29uc2VudCIsInZpZXctZ3JvdXBzIiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJtYW5hZ2UtY29uc2VudCIsImRlbGV0ZS1hY2NvdW50Iiwidmlldy1wcm9maWxlIl19LCJub3RpZmljYXRpb24tc2VydmljZSI6eyJyb2xlcyI6WyJub3RpZmljYXRpb25zZXJ2aWNlX2Jhc2ljIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIG1lcmNoYW50IiwiY2xpZW50SG9zdCI6IjUuMTc4LjE0OS4yNDEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm1lcmNoYW50SWQiOiI1MGRiMTE1ZTcyMzQ0OWVmYmVlYjYxMjdiMGVjMTQwMiIsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC03MTMyMjMzY2MxNjM0NWRkOWIxOWNhNzk1M2RkNzY4NSIsImNsaWVudEFkZHJlc3MiOiI1LjE3OC4xNDkuMjQxIiwiY2xpZW50X2lkIjoiNzEzMjIzM2NjMTYzNDVkZDliMTljYTc5NTNkNzY4NSJ9.Tt9R9J10VGCNYPBbtnUDqkLdp5qya6fm2Q5en_VtBCf9LleSnXMBVZYHTkK3r5x8CjdqZC42N9SYlFxuVXVTUznTVcrExJeD8F7AKTJxIzbKQBJUn-4HrLhAhnJjTwreVhBxwPHs6r9tktqQDwzQqVkcWjl7xzlKx8mMqRWasW2DhUr5q9Tu2CggdkitacKZIBAuYkbKLP6KDuGIxntifQrINIn_SZIhW3CNyfC3oivtw3qleakbouAfvF7E2KlxRg5BtGjQwSDjcLmisnNun5uqlSxp1RTZ6avkm4Ka6ywxdrsmnm3roBWqdjjG-etoHx5qDbXMlh1mIE6QYnNs8w'
            });

            setupEventListeners();
        }
    });

    onDestroy(() => {
        if (cashier) {
            cashier.destroy();
        }
    });

    function setupEventListeners() {
        if (!cashier) return;

        cashier.on('paymentSuccess', (data) => {
            console.log('✅ Payment completed successfully!', data);
            showMessage('success', 'Payment completed successfully!');
            if (browser) {
                // In a real app, you might redirect after a short delay or user interaction
                // window.location.href = '/payment-success';
            }
        });

        cashier.on('paymentError', (error) => {
            console.error('❌ Payment failed:', error);
            showMessage('error', 'Payment failed: ' + (error.message || 'Unknown error.'));
        });

        cashier.on('paymentCanceled', (data) => {
            console.log('🚫 Payment was canceled by user', data);
            showMessage('info', 'Payment was canceled.');
        });

        cashier.on('userCanceled', (data) => {
            console.log('🔴 User closed the payment window:', data.reason);
            showMessage('info', `Payment window closed by user: ${data.reason.replace(/_/g, ' ')}.`);
        });

        cashier.on('iframeOpened', (data) => {
            console.log('🪟 Payment iframe opened', data.iframe);
        });

        cashier.on('iframeClosed', () => {
            console.log('🔒 Payment iframe closed');
        });

        cashier.on('cashierLoaded', (data) => {
            console.log('⚡ Cashier page loaded in iframe', data);
        });

        cashier.on('paymentProcessing', (data) => {
            console.log('⏳ Payment is being processed...', data);
            showMessage('info', 'Payment is being processed...');
        });

        cashier.on('paymentRedirect', (data) => {
            console.log('🔄 Payment requires redirect', data);
            showMessage('info', 'Payment requires redirection.');
        });

        cashier.on('customEvent', (event) => {
            console.log('📨 Custom event received:', event.type, event.data);
            showMessage('info', `Received custom event: ${event.type}`);
        });
    }

    async function startPaymentWithIframe() {
        if (!browser || !cashier) {
            console.error('Cannot start payment: not in browser environment or SDK not initialized.');
            showMessage('error', 'Cannot start payment: SDK not ready.');
            return;
        }

        try {
            const transactionData: PayInTransactionData = {
                customer: {
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
                },
                returnUrls: {
                    success: "IFRAME_POST_MESSAGE",
                    failure: "IFRAME_POST_MESSAGE"
                },
                kycVerified: true,
                previousTransactionCount: 100,
                webhook: {
                    url: "https://d2c86389-0379-4ecc-9279-21fa7a9372fd.mock.pstmn.io/cashier"
                },
                currency: "GEL",
                orderId: cashier.generateOrderId(),
                amount: 1000
            };

            showMessage('info', 'Creating pay-in transaction...');
            const response = await cashier.createPayInTransaction(transactionData);
            console.log('Transaction session created:', response);
            showMessage('success', 'Transaction session created. Opening payment window...');

            const paymentUrl = response.iframeUrls?.card;
            if (!paymentUrl) {
                throw new Error('No payment URL received from API');
            }

            cashier.openPaymentIframe(paymentUrl);

        } catch (error: any) {
            console.error('Failed to start payment:', error);
            showMessage('error', 'Failed to start payment: ' + (error.message || 'Please check console for details.'));
        }
    }

    function cancelPayment() {
        if (browser && cashier) {
            cashier.closePaymentIframe();
            showMessage('info', 'Payment process cancelled.');
        }
    }
</script>

<style>
    :global(body) {
        margin: 0;
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .min-h-screen {
        min-height: 100vh;
    }

    .bg-gray-100 {
        background-color: #f3f4f6;
    }

    .flex {
        display: flex;
    }

    .flex-col {
        flex-direction: column;
    }

    .items-center {
        align-items: center;
    }

    .justify-center {
        justify-content: center;
    }

    .p-4 {
        padding: 1rem;
    }

    .font-inter {
        font-family: 'Inter', sans-serif;
    }

    .bg-white {
        background-color: #ffffff;
    }

    .rounded-lg {
        border-radius: 0.5rem;
    }

    .shadow-xl {
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .p-8 {
        padding: 2rem;
    }

    .max-w-md {
        max-width: 28rem;
    }

    .w-full {
        width: 100%;
    }

    .text-center {
        text-align: center;
    }

    .text-3xl {
        font-size: 1.875rem; /* 30px */
        line-height: 2.25rem; /* 36px */
    }

    .font-bold {
        font-weight: 700;
    }

    .text-gray-800 {
        color: #1f2937;
    }

    .mb-6 {
        margin-bottom: 1.5rem;
    }

    .space-y-4 > *:not([hidden]) ~ *:not([hidden]) {
        margin-top: 1rem;
    }

    .w-full {
        width: 100%;
    }

    .bg-blue-600 {
        background-color: #2563eb;
    }

    .hover\:bg-blue-700:hover {
        background-color: #1d4ed8;
    }

    .bg-red-600 {
        background-color: #dc2626;
    }

    .hover\:bg-red-700:hover {
        background-color: #b91c1c;
    }

    .text-white {
        color: #ffffff;
    }

    .font-semibold {
        font-weight: 600;
    }

    .py-3 {
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;
    }

    .px-6 {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }

    .shadow-md {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .transition-all {
        transition-property: all;
        transition-duration: 300ms;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    .duration-300 {
        transition-duration: 300ms;
    }

    .ease-in-out {
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    .transform {
        transform: translate(0, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1);
    }

    .hover\:scale-105:hover {
        transform: scale(1.05);
    }

    .active\:scale-95:active {
        transform: scale(0.95);
    }

    .disabled\:opacity-50:disabled {
        opacity: 0.5;
    }

    .disabled\:cursor-not-allowed:disabled {
        cursor: not-allowed;
    }

    /* Message Display */
    .message-container {
        position: fixed;
        top: 1.5rem; /* 24px */
        right: 1.5rem; /* 24px */
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        gap: 0.75rem; /* 12px */
        transition: all 300ms ease-in-out;
        transform: translateY(0);
    }

    .message-container.success {
        background-color: #22c55e; /* green-500 */
        color: #ffffff;
    }

    .message-container.error {
        background-color: #ef4444; /* red-500 */
        color: #ffffff;
    }

    .message-container.info {
        background-color: #3b82f6; /* blue-500 */
        color: #ffffff;
    }

    .message-icon {
        flex-shrink: 0;
    }

    .message-icon svg {
        height: 1.5rem; /* 24px */
        width: 1.5rem; /* 24px */
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
    }

    .message-text {
        font-size: 0.875rem; /* 14px */
        font-weight: 500;
        flex-grow: 1;
    }

    .message-close-button {
        margin-left: auto;
        margin-right: -0.375rem; /* -6px */
        padding: 0.25rem;
        border-radius: 9999px; /* full */
        transition: background-color 150ms ease-in-out;
    }

    .message-close-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .message-close-button svg {
        height: 1rem; /* 16px */
        width: 1rem; /* 16px */
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
    }
</style>

<div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter">
    <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Cashier Integration Demo</h1>

        <div class="space-y-4">
            <button
                    on:click={startPaymentWithIframe}
                    disabled={!browser || !cashier}
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out
                       disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
                Start Payment
            </button>
            <button
                    on:click={cancelPayment}
                    disabled={!browser || !cashier}
                    class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out
                       disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
                Cancel Payment
            </button>
        </div>

        {#if message}
            <div
                    class="message-container {message.type}"
                    role="alert"
            >
                <div class="message-icon">
                    {#if message.type === 'success'}
                        <svg viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    {:else if message.type === 'error'}
                        <svg viewBox="0 0 24 24">
                            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    {:else}
                        <svg viewBox="0 0 24 24">
                            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    {/if}
                </div>
                <div class="message-text">
                    {message.text}
                </div>
                <button on:click={closeMessage} class="message-close-button">
                    <svg viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        {/if}
    </div>
</div>