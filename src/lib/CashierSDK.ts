export interface CustomerBilling {
    address: string;
    city: string;
    state: string;
    countryCode: string;
    postalCode: string;
}

export interface Customer {
    firstName: string;
    lastName: string;
    externalUserId: string;
    email: string;
    phoneNumber: string;
    country: string;
    dateOfBirth: string;
    billing: CustomerBilling;
}

export interface ReturnUrls {
    success: string;
    failure: string;
}

export interface Webhook {
    url: string;
}

export interface PayInTransactionData {
    customer: Customer;
    returnUrls: ReturnUrls;
    kycVerified: boolean;
    previousTransactionCount: number;
    webhook: Webhook;
    currency: string;
    orderId: string;
    amount: number;
}

export interface CashierConfig {
    apiBaseUrl: string;
    apiKey?: string;
}

export interface PayInResponse {
    paymentId: string;
    status: string;
    iframeUrls: {
        card: string;
        apm: string;
    };
    [key: string]: any;
}

export class CashierSDK {
    private config: CashierConfig;
    private iframe: HTMLIFrameElement | null = null;
    private eventHandlers: { [key: string]: Function[] } = {};
    private messageListener: (event: MessageEvent) => void;

    constructor(config: CashierConfig) {
        this.config = config;
        this.messageListener = this.setupMessageListener.bind(this);
        window.addEventListener('message', this.messageListener);
    }

    destroy(): void {
        this.closePaymentIframe();
        window.removeEventListener('message', this.messageListener);
        this.eventHandlers = {};
    }

    async createPayInTransaction(transactionData: PayInTransactionData): Promise<PayInResponse> {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }

            const response = await fetch(`${this.config.apiBaseUrl}/payin`, {
                method: 'POST',
                headers,
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`API Error: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('Failed to create pay in transaction:', error);
            throw error;
        }
    }

    openPaymentIframe(paymentUrl: string, containerId?: string): HTMLIFrameElement {
        this.iframe = document.createElement('iframe');
        this.iframe.src = paymentUrl;
        this.iframe.style.width = '100%';
        this.iframe.style.height = '600px';
        this.iframe.style.border = 'none';
        this.iframe.style.borderRadius = '8px';
        this.iframe.setAttribute('allow', 'payment');
        this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');

        const container = containerId
            ? document.getElementById(containerId)
            : this.createModal();

        if (!container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }

        container.appendChild(this.iframe);

        this.emit('iframeOpened', { iframe: this.iframe });

        return this.iframe;
    }

    closePaymentIframe(): void {
        if (this.iframe) {
            const container = this.iframe.parentElement;

            if (container && container.classList.contains('cashier-modal')) {
                const handleEscape = (e: KeyboardEvent) => {
                    if (e.key === 'Escape') {
                        this.emit('userCanceled', { reason: 'escape_key' });
                        this.closePaymentIframe();
                        document.removeEventListener('keydown', handleEscape);
                    }
                };
                document.removeEventListener('keydown', handleEscape); // Remove specific listener

                container.remove();
            } else {
                this.iframe.remove();
            }

            this.iframe = null;
            this.emit('iframeClosed', {});
        }
    }

    private createModal(): HTMLElement {
        const modal = document.createElement('div');
        modal.className = 'cashier-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4 font-inter';
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');

        const modalContent = document.createElement('div');
        modalContent.className = 'cashier-modal-content bg-white rounded-xl p-6 shadow-2xl relative w-full max-w-2xl max-h-[90vh] overflow-auto';

        const closeButton = document.createElement('button');
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600 hover:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>`;
        closeButton.className = 'absolute top-3 right-3 bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors';
        closeButton.setAttribute('aria-label', 'Close payment modal');

        closeButton.addEventListener('click', () => {
            this.emit('userCanceled', { reason: 'close_button_clicked' });
            this.closePaymentIframe();
        });

        const handleBackdropClick = (e: MouseEvent) => {
            if (e.target === modal) {
                this.emit('userCanceled', { reason: 'backdrop_clicked' });
                this.closePaymentIframe();
            }
        };
        modal.addEventListener('click', handleBackdropClick);

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                this.emit('userCanceled', { reason: 'escape_key' });
                this.closePaymentIframe();
                document.removeEventListener('keydown', handleEscape); 
            }
        };
        document.addEventListener('keydown', handleEscape);

        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        return modalContent;
    }

    private setupMessageListener(event: MessageEvent): void {
        if (!this.isValidOrigin(event.origin)) {
            return;
        }

        const { type, data } = event.data;

        switch (type) {
            case 'PAYMENT_SUCCESS':
                this.emit('paymentSuccess', data);
                this.closePaymentIframe();
                break;

            case 'PAYMENT_FAILED':
            case 'PAYMENT_ERROR':
                this.emit('paymentError', data);
                this.closePaymentIframe();
                break;

            case 'PAYMENT_CANCELED':
            case 'PAYMENT_CANCELLED':
                this.emit('paymentCanceled', data);
                this.closePaymentIframe();
                break;

            case 'IFRAME_CLOSE':
            case 'CLOSE_IFRAME':
                this.emit('iframeCloseRequested', data);
                this.closePaymentIframe();
                break;

            case 'PAYMENT_REDIRECT':
                this.emit('paymentRedirect', data);
                break;

            case 'PAYMENT_PROCESSING':
                this.emit('paymentProcessing', data);
                break;

            case 'CASHIER_LOADED':
                this.emit('cashierLoaded', data);
                break;

            default:
                this.emit('customEvent', { type, data });
                break;
        }
    }

    private isValidOrigin(origin: string): boolean {
        try {
            const apiOrigin = new URL(this.config.apiBaseUrl).origin;
            return origin === apiOrigin;
        } catch (e) {
            console.error("Invalid API Base URL provided for origin validation:", e);
            return false;
        }
    }

    on(event: string, callback: Function): void {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }

    off(event: string, callback?: Function): void {
        if (!this.eventHandlers[event]) return;

        if (callback) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(cb => cb !== callback);
        } else {
            delete this.eventHandlers[event];
        }
    }

    private emit(event: string, data: any): void {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event handler for '${event}':`, error);
                }
            });
        }
    }

    generateOrderId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

export default CashierSDK;
