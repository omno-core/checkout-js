export declare enum DeviceType {
    DESKTOP = "DESKTOP",
    MOBILE = "MOBILE",
    AUTO = "AUTO"
}
export type CashierConfig = {
    apiBaseUrl: string;
    borderRadius?: string;
    backgroundColor?: string;
    device?: DeviceType;
};
export type PaymentEventData = {
    paymentId?: string;
    status?: string;
    amount?: number;
    currency?: string;
    orderId?: string;
    error?: string;
    message?: string;
    [key: string]: any;
};
export declare class CashierSDK {
    private readonly config;
    private iframe;
    private eventHandlers;
    private readonly messageListener;
    private device;
    constructor(config: CashierConfig);
    private detectDevice;
    destroy(): void;
    openPaymentIframe(paymentUrl: string, containerId?: string): HTMLIFrameElement;
    closePaymentIframe(): void;
    private createModal;
    private setupMessageListener;
    private isValidOrigin;
    on(event: string, callback: Function): void;
    off(event: string, callback?: Function): void;
    private emit;
    getDevice(): DeviceType;
    updateDevice(): void;
}
export default CashierSDK;
//# sourceMappingURL=CashierSDK.d.ts.map