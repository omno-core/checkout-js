
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

export interface PayInResponse {
    paymentId: string;
    status: string;
    iframeUrls: {
        card: string;
        apm: string;
    };
    [key: string]: any;
}

export interface PaymentConfig {
    apiBaseUrl: string;
    apiKey?: string;
}

export class PaymentService {
    private config: PaymentConfig;

    constructor(config: PaymentConfig) {
        this.config = config;
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

    generateOrderId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

export default PaymentService;