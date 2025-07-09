var DeviceType;
(function (DeviceType) {
    DeviceType["DESKTOP"] = "DESKTOP";
    DeviceType["MOBILE"] = "MOBILE";
    DeviceType["AUTO"] = "AUTO";
})(DeviceType || (DeviceType = {}));
class CashierSDK {
    constructor(config) {
        this.iframe = null;
        this.eventHandlers = {};
        this.config = {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            device: DeviceType.AUTO,
            ...config
        };
        this.device = this.detectDevice();
        this.messageListener = this.setupMessageListener.bind(this);
        window.addEventListener('message', this.messageListener);
    }
    detectDevice() {
        if (this.config.device && this.config.device !== DeviceType.AUTO) {
            return this.config.device;
        }
        if (typeof window === 'undefined') {
            return DeviceType.DESKTOP;
        }
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.innerWidth <= 768;
        return isMobile ? DeviceType.MOBILE : DeviceType.DESKTOP;
    }
    destroy() {
        this.closePaymentIframe();
        window.removeEventListener('message', this.messageListener);
        this.eventHandlers = {};
    }
    openPaymentIframe(paymentUrl, containerId) {
        this.iframe = document.createElement('iframe');
        this.iframe.src = paymentUrl;
        this.iframe.style.border = 'none';
        this.iframe.style.borderRadius = this.config.borderRadius;
        this.iframe.setAttribute('allow', 'payment');
        this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
        if (this.device === DeviceType.MOBILE) {
            this.iframe.style.width = '100%';
            this.iframe.style.height = '100vh';
        }
        else {
            this.iframe.style.width = '400px';
            this.iframe.style.height = '600px';
        }
        const container = containerId
            ? document.getElementById(containerId)
            : this.createModal();
        if (!container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }
        container.appendChild(this.iframe);
        this.emit('iframeOpened', { iframe: this.iframe, device: this.device });
        return this.iframe;
    }
    closePaymentIframe() {
        if (this.iframe) {
            const container = this.iframe.parentElement;
            if (container?.classList.contains('cashier-modal')) {
                const handleEscape = (e) => {
                    if (e.key === 'Escape') {
                        this.emit('userCanceled', { reason: 'escape_key' });
                        this.closePaymentIframe();
                        document.removeEventListener('keydown', handleEscape);
                    }
                };
                document.removeEventListener('keydown', handleEscape);
                container.remove();
            }
            else {
                this.iframe.remove();
            }
            this.iframe = null;
            this.emit('iframeClosed', {});
        }
    }
    createModal() {
        const modal = document.createElement('div');
        if (this.device === DeviceType.MOBILE) {
            modal.className = 'cashier-modal fixed inset-0 z-[10000] font-inter';
            modal.style.backgroundColor = this.config.backgroundColor;
        }
        else {
            modal.className = 'cashier-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4 font-inter';
        }
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('role', 'dialog');
        const modalContent = document.createElement('div');
        if (this.device === DeviceType.MOBILE) {
            modalContent.className = 'cashier-modal-content w-full h-full relative';
            modalContent.style.backgroundColor = this.config.backgroundColor;
        }
        else {
            modalContent.className = 'cashier-modal-content shadow-2xl relative';
            modalContent.style.backgroundColor = this.config.backgroundColor;
            modalContent.style.borderRadius = this.config.borderRadius;
            modalContent.style.padding = '24px';
            modalContent.style.width = '448px'; // 400px + padding
            modalContent.style.maxHeight = '90vh';
            modalContent.style.overflow = 'auto';
        }
        if (this.device === DeviceType.DESKTOP) {
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
            modalContent.appendChild(closeButton);
        }
        if (this.device === DeviceType.MOBILE) {
            const handleBackdropClick = (e) => {
                if (e.target === modal) {
                    this.emit('userCanceled', { reason: 'backdrop_clicked' });
                    this.closePaymentIframe();
                }
            };
            modal.addEventListener('click', handleBackdropClick);
        }
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.emit('userCanceled', { reason: 'escape_key' });
                this.closePaymentIframe();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        return modalContent;
    }
    setupMessageListener(event) {
        if (!this.isValidOrigin(event.origin)) {
            return;
        }
        const data = event.data;
        console.log({ data });
    }
    isValidOrigin(origin) {
        try {
            const apiOrigin = new URL(this.config.apiBaseUrl).origin;
            return origin === apiOrigin;
        }
        catch (e) {
            console.error("Invalid API Base URL provided for origin validation:", e);
            return false;
        }
    }
    on(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }
    off(event, callback) {
        if (!this.eventHandlers[event])
            return;
        if (callback) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(cb => cb !== callback);
        }
        else {
            delete this.eventHandlers[event];
        }
    }
    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`Error in event handler for '${event}':`, error);
                }
            });
        }
    }
    getDevice() {
        return this.device;
    }
    updateDevice() {
        this.device = this.detectDevice();
    }
}

export { DeviceType, CashierSDK as default };
//# sourceMappingURL=index.esm.js.map
