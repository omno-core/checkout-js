import React, { useState, useEffect, useCallback } from 'react';

const CashierSDK = {
    constructor: function(config) {
        this.config = config;
        this.eventHandlers = {};
        return this;
    },
    on: function(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    },
    openPaymentIframe: function(url) {
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
    emit: function(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(callback => callback(data));
        }
    },
    destroy: function() {
        this.eventHandlers = {};
    }
};

const PaymentService = {
    constructor: function(config) {
        this.config = config;
        return this;
    },
    createPayInTransaction: async function(data) {
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
    generateOrderId: function() {
        return 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};

export default function PaymentIntegration() {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentData, setPaymentData] = useState(null);
    const [cashierSDK, setCashierSDK] = useState(null);
    const [paymentService, setPaymentService] = useState(null);

    const [formData, setFormData] = useState({
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
    });

    const handlePaymentSuccess = useCallback((data) => {
        setPaymentStatus('success');
        console.log('Payment successful:', data);
    }, []);

    const handlePaymentError = useCallback((data) => {
        setPaymentStatus('error');
        setErrorMessage(data.message || 'Payment failed');
        console.error('Payment error:', data);
    }, []);

    const handlePaymentCanceled = useCallback((data) => {
        setPaymentStatus('canceled');
        console.log('Payment canceled:', data);
    }, []);

    const handleIframeOpened = useCallback((data) => {
        console.log('Payment iframe opened:', data);
    }, []);

    const handleIframeClosed = useCallback((data) => {
        console.log('Payment iframe closed:', data);
        if (paymentStatus === '') {
            setPaymentStatus('closed');
        }
    }, [paymentStatus]);

    useEffect(() => {
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

        cashierSDKInstance.on('paymentSuccess', handlePaymentSuccess);
        cashierSDKInstance.on('paymentError', handlePaymentError);
        cashierSDKInstance.on('paymentCanceled', handlePaymentCanceled);
        cashierSDKInstance.on('iframeOpened', handleIframeOpened);
        cashierSDKInstance.on('iframeClosed', handleIframeClosed);

        setPaymentService(paymentServiceInstance);
        setCashierSDK(cashierSDKInstance);

        return () => {
            if (cashierSDKInstance) {
                cashierSDKInstance.destroy();
            }
        };
    }, [handlePaymentSuccess, handlePaymentError, handlePaymentCanceled, handleIframeOpened, handleIframeClosed]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const initiateCardPayment = async (e) => {
        e.preventDefault();
        if (!paymentService || !cashierSDK) return;

        setIsLoading(true);
        setPaymentStatus('');
        setErrorMessage('');

        try {
            const transactionData = {
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
            setPaymentData(response);

            // Open payment iframe
            cashierSDK.openPaymentIframe(response.iframeUrls.card);

        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Failed to create payment');
            setPaymentStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const initiateAPMPayment = () => {
        if (!paymentData || !cashierSDK) return;
        cashierSDK.openPaymentIframe(paymentData.iframeUrls.apm);
    };

    const resetPayment = () => {
        setPaymentStatus('');
        setErrorMessage('');
        setPaymentData(null);
    };

    const styles = {
        container: {
            maxWidth: '600px',
            margin: '0 auto',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif'
        },
        title: {
            textAlign: 'center',
            color: '#1f2937',
            marginBottom: '2rem'
        },
        form: {
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
        formGroup: {
            marginBottom: '1rem'
        },
        formRow: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '500',
            color: '#374151'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '1rem',
            boxSizing: 'border-box'
        },
        buttonGroup: {
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem'
        },
        button: {
            flex: 1,
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        primaryButton: {
            backgroundColor: '#3b82f6',
            color: 'white'
        },
        secondaryButton: {
            backgroundColor: '#6b7280',
            color: 'white'
        },
        disabledButton: {
            opacity: 0.5,
            cursor: 'not-allowed'
        },
        statusCard: {
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center'
        },
        successCard: {
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534'
        },
        errorCard: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626'
        },
        warningCard: {
            backgroundColor: '#fffbeb',
            border: '1px solid #fed7aa',
            color: '#d97706'
        }
    };

    if (paymentStatus === 'success') {
        return (
            <div style={styles.container}>
                <h1 style={styles.title}>React Payment Integration</h1>
                <div style={{...styles.statusCard, ...styles.successCard}}>
                    <h2>✅ Payment Successful!</h2>
                    <p>Your payment has been processed successfully.</p>
                    <button
                        onClick={resetPayment}
                        style={{...styles.button, ...styles.primaryButton, marginTop: '1rem'}}
                    >
                        Make Another Payment
                    </button>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'error') {
        return (
            <div style={styles.container}>
                <h1 style={styles.title}>React Payment Integration</h1>
                <div style={{...styles.statusCard, ...styles.errorCard}}>
                    <h2>❌ Payment Failed</h2>
                    <p>{errorMessage}</p>
                    <button
                        onClick={resetPayment}
                        style={{...styles.button, ...styles.primaryButton, marginTop: '1rem'}}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'canceled') {
        return (
            <div style={styles.container}>
                <h1 style={styles.title}>React Payment Integration</h1>
                <div style={{...styles.statusCard, ...styles.warningCard}}>
                    <h2>⚠️ Payment Canceled</h2>
                    <p>The payment was canceled by the user.</p>
                    <button
                        onClick={resetPayment}
                        style={{...styles.button, ...styles.primaryButton, marginTop: '1rem'}}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>React Payment Integration</h1>

            <div style={styles.form}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Amount</label>
                    <input
                        style={styles.input}
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        min="1"
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Currency</label>
                    <select
                        style={styles.input}
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>

                <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>First Name</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Last Name</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                        style={styles.input}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                        style={styles.input}
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Address</label>
                    <input
                        style={styles.input}
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>City</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>State</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Postal Code</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div style={styles.buttonGroup}>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            ...styles.button,
                            ...styles.primaryButton,
                            ...(isLoading ? styles.disabledButton : {})
                        }}
                    >
                        {isLoading ? 'Processing...' : 'Pay with Card'}
                    </button>

                    {paymentData && (
                        <button
                            type="button"
                            onClick={initiateAPMPayment}
                            style={{...styles.button, ...styles.secondaryButton}}
                        >
                            Alternative Payment Methods
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}