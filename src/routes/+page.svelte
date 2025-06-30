<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import CashierSDK from '../lib/CashierSDK';
    import {type PayInTransactionData, PaymentService} from '../lib/PaymentService';
    import {browser} from '$app/environment';

    let cashier: CashierSDK | null = null;
    let paymentService: PaymentService | null = null;
    let message: { type: 'success' | 'error' | 'info', text: string } | null = null;
    let currentPaymentId: string | null = null;

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
            paymentService = new PaymentService({
                apiBaseUrl: 'http://api.omno.dev/public',
                apiKey: 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJvVFJ6ak1rQkt5Z1lZNGlmZGNFaE42LWlKZUZUUGFVR0dqeE5yV1RpSWJzIn0.eyJleHAiOjE3NTAyNzIyNTcsImlhdCI6MTc1MDI3MTk1NywianRpIjoiMTc2NzNhNmMtMjEzNi00NmIzLTlmZDItZjcyYTk0MzhlYjQ0IiwiaXNzIjoiaHR0cHM6Ly9zc28uc3RhZ2luZ3NzZXUuY29tL3JlYWxtcy9zc2V1IiwiYXVkIjpbInJvdXRlci1zZXJ2aWNlIiwia3ljLXNlcnZpY2UiLCJhY2NvdW50aW5nLXNlcnZpY2UiLCJjdXN0b21lci1zZXJ2aWNlIiwibWVyY2hhbnQtc2VydmljZSIsInByb2R1Y3Qtc2VydmljZSIsInJlcG9ydGluZy1zZXJ2aWNlIiwidHJhbnNhY3Rpb24tc2VydmljZSIsInVzZXItc2VydmljZSIsImFjY291bnQiLCJub3RpZmljYXRpb24tc2VydmljZSJdLCJzdWIiOiJhNzc5Y2NiNC0yN2M1LTRjZmEtYTA3OS02MDdjODEzZjlkMjIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiI3MTMyMjMzY2MxNjM0NWRkOWIxOWNhNzk1M2RkNzY4NSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3M6IjpbInJvdXRlci1zZXJ2aWNlIjpbImNyZWF0ZS1yb3V0ZXIiLCJ2aWV3LXJvdXRlciIsInVwZGF0ZS1yb3V0ZXIiLCJkZWxldGUtcm91dGVyIiwicm91dGVyLWFkbWluaXN0cmF0b3IiXX0sImt5Yy1zZXJ2aWNlIjp7InJvbGVzIjpbImt5Y3NlcnZpY2VfYmFzaWMiXX0sImFjY291bnRpbmctc2VydmljZSI6eyJyb2xlcyI6WyJhY2NvdW50aW5nc2VydmljZV9iYXNpYyJdfSwiY3VzdG9tZXItc2VydmljZSI6eyJyb2xlcyI6WyJjdXN0b21lcnNlcnZpY2VfYmFzaWMiXX0sIm1lcmNoYW50LXNlcnZpY2UiOnsicm9sZXMiOlsibWVyY2hhbnRzZXJ2aWNlX2Jhc2ljIl19LCJwcm9kdWN0LXNlcnZpY2UiOnsicm9sZXMiOlsicHJvZHVjdHNlcnZpY2VfYmFzaWMiXX0sInJlcG9ydGluZy1zZXJ2aWNlIjp7InJvbGVzIjpbInJlcG9ydGluZ3NlcnZpY2VfYmFzaWMiXX0sInRyYW5zYWN0aW9uLXNlcnZpY2UiOnsicm9sZXMiOlsidHJhbnNhY3Rpb25zZXJ2aWNlX2Jhc2ljIl19LCJ1c2VyLXNlcnZpY2UiOnsicm9sZXMiOlsidXNlcnNlcnZpY2VfYmFzaWMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJ2aWV3LWFwcGxpY2F0aW9ucyIsInZpZXctY29uc2VudCIsInZpZXctZ3JvdXBzIiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJtYW5hZ2UtY29uc2VudCIsImRlbGV0ZS1hY2NvdW50Iiwidmlldy1wcm9maWxlIl19LCJub3RpZmljYXRpb24tc2VydmljZSI6eyJyb2xlcyI6WyJub3RpZmljYXRpb25zZXJ2aWNlX2Jhc2ljIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIG1lcmNoYW50IiwiY2xpZW50SG9zdCI6IjUuMTc4LjE0OS4yNDEiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm1lcmNoYW50SWQiOiI1MGRiMTE1ZTcyMzQ0OWVmYmVlYjYxMjdiMGVjMTQwMiIsInByZWZlcnJlZF91c2VybmFtZSI6InNlcnZpY2UtYWNjb3VudC03MTMyMjMzY2MxNjM0NWRkOWIxOWNhNzk1M2RkNzY4NSIsImNsaWVudEFkZHJlc3MiOiI1LjE3OC4xNDkuMjQxIiwiY2xpZW50X2lkIjoiNzEzMjIzM2NjMTYzNDVkZDliMTljYTc5NTNkZDc2ODUifQ.Tt9R9J10VGCNYPBbtnUDqkLdp5qya6fm2Q5en_VtBCf9LleSnXMBVZYHTkK3r5x8CjdqZC42N9SYlFxuVXVTUznTVcrExJeD8F7AKTJxIzbKQBJUn-4HrLhAhnJjTwreVhBxwPHs6r9tktqQDwzQqVkcWjl7xzlKx8mMqRWasW2DhUr5q9Tu2CggdkitacKZIBAuYkbKLP6KDuGIxntifQrINIn_SZIhW3CNyfC3oivtw3qleakbouAfvF7E2KlxRg5BtGjQwSDjcLmisnNun5uqlSxp1RTZ6avkm4Ka6ywxdrsmnm3roBWqdjjG-etoHx5qDbXMlh1mIE6QYnNs8w'
            });

            // Initialize Cashier SDK with custom styling
            cashier = new CashierSDK({
                apiBaseUrl: 'http://api.omno.dev/public',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                device: 'auto' // Let it auto-detect desktop/mobile
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
            console.log('Payment ID:', currentPaymentId);
            showMessage('success', `Payment ${currentPaymentId} completed successfully!`);
            currentPaymentId = null;
        });

        cashier.on('paymentError', (error) => {
            console.error('Payment failed:', error);
            console.log('Failed Payment ID:', currentPaymentId);
            showMessage('error', `Payment ${currentPaymentId} failed: ` + (error.message || 'Unknown error.'));
            currentPaymentId = null;
        });

        cashier.on('paymentCanceled', (data) => {
            console.log('Payment was canceled by user', data);
            showMessage('info', 'Payment was canceled.');
        });

        cashier.on('userCanceled', (data) => {
            console.log('User closed the payment window:', data.reason);
            showMessage('info', `Payment window closed by user: ${data.reason.replace(/_/g, ' ')}.`);
        });

        cashier.on('iframeOpened', (data) => {
            console.log('Payment iframe opened', data.iframe);
            console.log('Device detected:', data.device);
        });

        cashier.on('iframeClosed', () => {
            console.log('Payment iframe closed');
        });

        cashier.on('cashierLoaded', (data) => {
            console.log('Cashier page loaded in iframe', data);
        });

        cashier.on('paymentProcessing', (data) => {
            console.log('Payment is being processed...', data);
            showMessage('info', 'Payment is being processed...');
        });

        cashier.on('paymentRedirect', (data) => {
            console.log('Payment requires redirect', data);
            showMessage('info', 'Payment requires redirection.');
        });

        cashier.on('customEvent', (event) => {
            console.log('Custom event received:', event.type, event.data);
            showMessage('info', `Received custom event: ${event.type}`);
        });
    }

    async function startPaymentWithIframe() {
        if (!browser || !cashier || !paymentService) {
            console.error('Cannot start payment: not in browser environment or services not initialized.');
            showMessage('error', 'Cannot start payment: Services not ready.');
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
                orderId: paymentService.generateOrderId(),
                amount: 1000
            };

            showMessage('info', 'Creating pay-in transaction...');

            // Use PaymentService to create transaction
            const response = await paymentService.createPayInTransaction(transactionData);

            currentPaymentId = response.paymentId;

            console.log('Transaction session created:', response);
            console.log('Payment ID:', currentPaymentId);
            console.log('Device type:', cashier.getDevice());

            showMessage('success', `Transaction created with ID: ${currentPaymentId}`);

            const paymentUrl = response.iframeUrls?.card;
            if (!paymentUrl) {
                throw new Error('No payment URL received from API');
            }

            // Use CashierSDK to open iframe
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

    .container {
        min-height: 100vh;
        background-color: #f3f4f6;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        font-family: 'Inter', sans-serif;
    }

    .card {
        background-color: #ffffff;
        border-radius: 0.5rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        padding: 2rem;
        max-width: 28rem;
        width: 100%;
        text-align: center;
    }

    .card h1 {
        font-size: 1.875rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 1.5rem;
    }

    .button-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .card button {
        width: 100%;
        font-weight: 600;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        cursor: pointer;
        color: #ffffff;
        transform: scale(1);
    }

    .card button:hover {
        transform: scale(1.05);
    }

    .card button:active {
        transform: scale(0.95);
    }

    .card button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: scale(1);
    }

    .card button.primary {
        background-color: #2563eb;
    }

    .card button.primary:hover:not(:disabled) {
        background-color: #1d4ed8;
    }

    .card button.danger {
        background-color: #dc2626;
    }

    .card button.danger:hover:not(:disabled) {
        background-color: #b91c1c;
    }

    .message {
        position: fixed;
        top: 1.5rem;
        right: 1.5rem;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transition: all 300ms ease-in-out;
        color: #ffffff;
        z-index: 1000;
    }

    .message.success {
        background-color: #22c55e;
    }

    .message.error {
        background-color: #ef4444;
    }

    .message.info {
        background-color: #3b82f6;
    }

    .message .icon {
        flex-shrink: 0;
    }

    .message .icon svg {
        height: 1.5rem;
        width: 1.5rem;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
    }

    .message .text {
        font-size: 0.875rem;
        font-weight: 500;
        flex-grow: 1;
    }

    .message .close-button {
        margin-left: auto;
        margin-right: -0.375rem;
        padding: 0.25rem;
        border-radius: 50%;
        background: transparent;
        border: none;
        cursor: pointer;
        color: currentColor;
        transition: background-color 150ms ease-in-out;
    }

    .message .close-button:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .message .close-button svg {
        height: 1rem;
        width: 1rem;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
    }
</style>

<div class="container">
    <div class="card">
        <h1>Cashier Integration Demo</h1>

        <div class="button-group">
            <button
                    class="primary"
                    on:click={startPaymentWithIframe}
                    disabled={!browser || !cashier || !paymentService}
            >
                Start Payment
            </button>

            <button
                    class="danger"
                    on:click={cancelPayment}
                    disabled={!browser || !cashier}
            >
                Cancel Payment
            </button>
        </div>
    </div>

    {#if message}
        <div class="message {message.type}" role="alert">
            <div class="icon">
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
            <div class="text">
                {message.text}
            </div>
            <button class="close-button" on:click={closeMessage}>
                <svg viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    {/if}
</div>