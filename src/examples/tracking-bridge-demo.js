"use strict";
(() => {
  // src/ui/data.ts
  var DEFAULT_MODAL_STYLES = {
    backgroundColor: "rgba(0,0,0,0.4)",
    width: "900px",
    height: "800px",
    borderRadius: "12px",
    zIndex: 9
  };
  var DEFAULT_MOBILE_STYLES = {
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10
  };

  // src/ui/modal-loader.html
  var modal_loader_default = '<div class="cashier-loading-container">\n  <div class="cashier-loading-header">\n    <skeleton-line bg="rgba(255, 255, 255, 0.10)" w="120px" h="28px" r="9999px" o="0.64"></skeleton-line>\n    <svg data-cashier-close xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">\n      <path d="M15 5L5 15M5 5L15 15" stroke="rgba(255, 255, 255, 0.75)" stroke-opacity="0.75" stroke-width="1.5"\n            stroke-linecap="round"\n            stroke-linejoin="round"/>\n    </svg>\n  </div>\n\n  <div class="cashier-loading-main">\n    <div class="cashier-loading-navigation">\n      <div class="cashier-loading-navigation-filters">\n        <skeleton-line w="36px" h="36px"></skeleton-line>\n        <skeleton-line w="64px" h="36px"></skeleton-line>\n        <skeleton-line w="64px" h="36px"></skeleton-line>\n        <skeleton-line w="64px" h="36px"></skeleton-line>\n        <skeleton-line w="64px" h="36px"></skeleton-line>\n      </div>\n      <div class="cashier-loading-navigation-data">\n        <skeleton-card></skeleton-card>\n        <skeleton-card></skeleton-card>\n        <skeleton-card></skeleton-card>\n\n        <skeleton-card></skeleton-card>\n        <skeleton-card></skeleton-card>\n        <skeleton-card></skeleton-card>\n\n        <skeleton-card></skeleton-card>\n        <skeleton-card></skeleton-card>\n        <skeleton-card></skeleton-card>\n\n        <skeleton-card></skeleton-card>\n        <skeleton-card></skeleton-card>\n        <skeleton-card></skeleton-card>\n\n        <skeleton-card></skeleton-card>\n        <skeleton-card></skeleton-card>\n        <skeleton-card></skeleton-card>\n      </div>\n    </div>\n\n    <div class="cashier-loading-content">\n      <skeleton-card w="100px" h="48px"></skeleton-card>\n      <skeleton-line w="180px" h="6px" r="9999px" o="0.64"></skeleton-line>\n    </div>\n  </div>\n</div>\n';

  // src/ui/modal-loader.css
  var modal_loader_default2 = ".cashier-loading-container {\n  user-select: none;\n  width: 100%;\n  height: 100%;\n  background-color: #171717;\n  border: 1px solid rgba(255, 255, 255, 0.1);\n\n  animation: cashierFadeIn 0.2s ease-in-out forwards;\n}\n\n.cashier-loading-header {\n  display: flex;\n  justify-content: space-between;\n  height: 60px;\n  align-items: center;\n  padding: 0 20px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n}\n\n.cashier-loading-main {\n  display: flex;\n  width: 100%;\n  height: calc(100% - 60px);\n}\n\n.cashier-loading-navigation {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  min-width: 324px;\n  width: 324px;\n  padding: 20px;\n  background-color: rgba(255, 255, 255, 0.05);\n  border-right: 1px solid rgba(255, 255, 255, 0.1);\n}\n\n.cashier-loading-navigation-filters {\n  display: flex;\n  gap: 8px;\n}\n\n.cashier-loading-navigation-data {\n  width: 100%;\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n}\n\n.cashier-loading-content {\n  overflow: hidden;\n  width: 100%;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  gap: 12px;\n  padding: 20px;\n}\n\nsvg {\n  cursor: pointer;\n}\n\nsvg:hover {\n  cursor: pointer;\n\n  path {\n    stroke: rgba(255, 255, 255, 0.9);\n  }\n}\n\n@keyframes cashierFadeIn {\n  from {\n    opacity: 0;\n    transform: scale(0.8) translateY(20px);\n  }\n  to {\n    opacity: 1;\n    transform: scale(1) translateY(0);\n  }\n}\n";

  // src/ui/skeletons/skeleton-line.js
  var SkeletonLine = class extends HTMLElement {
    static get observedAttributes() {
      return ["w", "h", "r", "bg", "o"];
    }
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: var(--w, 100%);
        }
        .line {
          width: var(--w, 100%);
          height: var(--h, 12px);
          border-radius: var(--r, 8px);
          background: var(--bg, rgba(255,255,255,0.05));
          opacity: var(--o, 1);
          position: relative;
          overflow: hidden;
        }
        .line::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.12),
            transparent
          );
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer {
          to { transform: translateX(100%); }
        }
      </style>
      <div class="line"></div>
    `;
      this._sync();
    }
    attributeChangedCallback() {
      this._sync();
    }
    _sync() {
      this.style.setProperty("--w", this.getAttribute("w") || "100%");
      this.style.setProperty("--h", this.getAttribute("h") || "12px");
      this.style.setProperty("--r", this.getAttribute("r") || "8px");
      this.style.setProperty("--bg", this.getAttribute("bg") || "rgba(255,255,255,0.05)");
      this.style.setProperty("--o", this.getAttribute("o") || "1");
    }
  };
  customElements.define("skeleton-line", SkeletonLine);

  // src/ui/skeletons/skeleton-card.js
  var SkeletonCard = class extends HTMLElement {
    static get observedAttributes() {
      return ["w", "h", "r", "bg"];
    }
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .card {
          width: var(--w, 100%);
          height: var(--h, 56px);
          background: var(--bg, rgba(255,255,255,0.05));
          border-radius: var(--r, 12px);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          padding: 8px;
          box-sizing: border-box;
        }
      </style>

      <div class="card">
        <skeleton-line w="16px" h="16px" r="50%"></skeleton-line>
        <skeleton-line w="36px" h="6px"></skeleton-line>
      </div>
    `;
      this._sync();
    }
    attributeChangedCallback() {
      this._sync();
    }
    _sync() {
      this.style.setProperty("--w", this.getAttribute("w") || "100%");
      this.style.setProperty("--h", this.getAttribute("h") || "56px");
      this.style.setProperty("--r", this.getAttribute("r") || "12px");
      this.style.setProperty("--bg", this.getAttribute("bg") || "rgba(255,255,255,0.05)");
    }
  };
  customElements.define("skeleton-card", SkeletonCard);

  // src/ui/modal.ts
  function mountModal(url, styles = {}) {
    const {
      backgroundColor = DEFAULT_MODAL_STYLES.backgroundColor,
      width = DEFAULT_MODAL_STYLES.width,
      height = DEFAULT_MODAL_STYLES.height,
      borderRadius = DEFAULT_MODAL_STYLES.borderRadius,
      zIndex = DEFAULT_MODAL_STYLES.zIndex
    } = styles;
    const overlay = document.createElement("div");
    overlay.classList.add("cashier-modal-overlay");
    overlay.style.cssText = `
    position: fixed; inset: 0;
    background: ${backgroundColor};
    z-index: ${zIndex};
  `;
    const modal = document.createElement("div");
    modal.style.cssText = `
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: ${width};
    height: ${height};
    background: transparent;
    border-radius: ${borderRadius};
    overflow: hidden;
    z-index: ${zIndex + 1};
  `;
    const loader = document.createElement("div");
    loader.style.cssText = "width: 100%; height: 100%; position: absolute; inset: 0";
    const shadow = loader.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${modal_loader_default2}</style>${modal_loader_default}`;
    const closeBtn = shadow.querySelector("[data-cashier-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.postMessage({ type: "CLOSE_IFRAME" /* CLOSE_IFRAME */ }, "*");
      });
    }
    const iframe = document.createElement("iframe");
    iframe.allow = "clipboard-read; clipboard-write";
    iframe.src = url;
    iframe.style.cssText = "width: 100%; height: 100%; border: none;";
    modal.appendChild(loader);
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    return { overlay, loader, iframe };
  }

  // src/ui/mobile-loader.html
  var mobile_loader_default = '<div class="cashier-mobile-loading-container">\n  <div class="cashier-mobile-loading-header">\n    <skeleton-line bg="rgba(255, 255, 255, 0.10)" w="120px" h="28px" r="9999px" o="0.64"></skeleton-line>\n    <svg data-cashier-close xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">\n      <path d="M15 5L5 15M5 5L15 15" stroke="rgba(255, 255, 255, 0.75)" stroke-opacity="0.75" stroke-width="1.5" stroke-linecap="round"\n            stroke-linejoin="round"/>\n    </svg>\n  </div>\n\n  <div class="cashier-mobile-loading-main">\n    <div class="cashier-mobile-loading-main-filters">\n      <skeleton-line w="36px" h="36px"></skeleton-line>\n      <skeleton-line h="36px"></skeleton-line>\n      <skeleton-line h="36px"></skeleton-line>\n      <skeleton-line h="36px"></skeleton-line>\n      <skeleton-line h="36px"></skeleton-line>\n    </div>\n    <div class="cashier-mobile-loading-main-data">\n      <skeleton-card></skeleton-card>\n      <skeleton-card></skeleton-card>\n      <skeleton-card></skeleton-card>\n\n      <skeleton-card></skeleton-card>\n      <skeleton-card></skeleton-card>\n      <skeleton-card></skeleton-card>\n\n      <skeleton-card></skeleton-card>\n      <skeleton-card></skeleton-card>\n      <skeleton-card></skeleton-card>\n\n      <skeleton-card></skeleton-card>\n      <skeleton-card></skeleton-card>\n      <skeleton-card></skeleton-card>\n\n      <skeleton-card></skeleton-card>\n      <skeleton-card></skeleton-card>\n      <skeleton-card></skeleton-card>\n    </div>\n  </div>\n</div>\n';

  // src/ui/mobile-loader.css
  var mobile_loader_default2 = ".cashier-mobile-loading-container {\n  background: #171717;\n  transform: translateY(100%);\n  animation: slideUp 0.25s ease-out forwards;\n}\n\n.cashier-mobile-loading-header {\n  display: flex;\n  justify-content: space-between;\n  height: 59px;\n  align-items: center;\n  padding: 0 16px;\n  border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n}\n\n.cashier-mobile-loading-main {\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n  padding: 16px;\n}\n\n.cashier-mobile-loading-main-filters {\n  display: flex;\n  gap: 8px;\n}\n\n.cashier-mobile-loading-main-data {\n  width: 100%;\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 12px;\n}\n\nsvg {\n  cursor: pointer;\n}\n\nsvg:hover {\n  cursor: pointer;\n\n  path {\n    stroke: rgba(255, 255, 255, 0.9);\n  }\n}\n\n@keyframes slideUp {\n  to {\n    transform: translateY(0);\n  }\n}\n";

  // src/ui/mobile.ts
  function mountMobile(url, styles = {}) {
    const {
      backgroundColor = DEFAULT_MOBILE_STYLES.backgroundColor,
      zIndex = DEFAULT_MOBILE_STYLES.zIndex
    } = styles;
    const overlay = document.createElement("div");
    overlay.classList.add("cashier-mobile-overlay");
    overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: ${backgroundColor};
    z-index: ${zIndex};
  `;
    const loader = document.createElement("div");
    loader.style.cssText = `position: absolute; width: 100%; bottom: 0; z-index: ${zIndex + 1};`;
    const shadow = loader.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${mobile_loader_default2}</style>${mobile_loader_default}`;
    const closeBtn = shadow.querySelector("[data-cashier-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        window.postMessage({ type: "CLOSE_IFRAME" /* CLOSE_IFRAME */ }, "*");
      });
    }
    const iframe = document.createElement("iframe");
    iframe.allow = "clipboard-read; clipboard-write";
    iframe.src = url;
    iframe.style.cssText = `
    position: absolute; inset: 0; opacity: 0;
    width: 100%; height: 100%; border: none; background: transparent;
  `;
    overlay.appendChild(loader);
    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
    return { overlay, loader, iframe };
  }

  // src/util/cashier-error.ts
  var CashierError = class extends Error {
    constructor(code, message, details) {
      super(message);
      this.name = "CashierError";
      this.code = code;
      this.details = details;
    }
  };

  // src/ui/container.ts
  function mountInContainerWithId(url, containerId) {
    const target = document.getElementById(containerId);
    if (!target) {
      throw new CashierError(
        "CONTAINER_NOT_FOUND" /* CONTAINER_NOT_FOUND */,
        `Container with id="${containerId}" not found`
      );
    }
    target.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.allow = "clipboard-read; clipboard-write";
    iframe.src = url;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    target.appendChild(iframe);
    return iframe;
  }

  // src/util/event-emitter.ts
  var EventEmitter = class {
    constructor() {
      this.listeners = {};
    }
    on(event, handler) {
      (this.listeners[event] ??= []).push(handler);
    }
    off(event, handler) {
      const arr = this.listeners[event];
      if (arr) {
        this.listeners[event] = arr.filter((h) => h !== handler);
      }
    }
    once(event, handler) {
      const wrapper = (payload) => {
        this.off(event, wrapper);
        handler(payload);
      };
      this.on(event, wrapper);
    }
    emit(event, payload) {
      this.listeners[event]?.forEach((h) => {
        try {
          h(payload);
        } catch (err) {
          console.error(`Error in handler for event "${String(event)}":`, err);
        }
      });
    }
  };

  // src/sdk/url.ts
  function buildCashierUrl(baseUrl, sessionId, paymentAction, layout) {
    const suffix = paymentAction ? paymentAction.toLowerCase() : void 0;
    const path = suffix ? `${baseUrl}/${sessionId}/${suffix}` : `${baseUrl}/${sessionId}`;
    return layout === "single" ? `${path}?layout=single` : path;
  }

  // src/sdk/cashier.ts
  var CashierSDK = class extends EventEmitter {
    // private trackingBridge?: HTMLIFrameElement; // TRACKING_BRIDGE: disabled
    // private readonly bridgeUrl: string; // TRACKING_BRIDGE: disabled
    constructor(options) {
      super();
      this.parentUrl = void 0;
      this.currentPaymentAction = "DEPOSIT" /* DEPOSIT */;
      this.cashierProperties = {
        device: options.device ?? this.detectDevice(),
        styles: {
          modal: { ...DEFAULT_MODAL_STYLES, ...options.styles?.modal },
          mobile: { ...DEFAULT_MOBILE_STYLES, ...options.styles?.mobile }
        }
      };
      if (options.device && options.device !== "AUTO" /* AUTO */) {
        this.cashierProperties.device = options.device;
      } else {
        this.cashierProperties.device = this.detectDevice();
      }
      this.parentUrl = options.returnUrlAfterRedirection;
      this.baseUrl = `${options.baseUrl?.replace(/\/+$/, "")}/payments-v2/cashier`;
      this.boundMessageHandler = this.setupMessageListener.bind(this);
      window.addEventListener("message", this.boundMessageHandler);
      window.addEventListener("load", () => {
        const sessionId = new URLSearchParams(window.location.search).get("omCashierSessionIdNo");
        if (sessionId) this.open({ sessionId });
      });
      window.addEventListener("pageshow", (event) => {
        if (!event.persisted || !this.isOpen() || !this.iframe) return;
        this.softRefreshIframe();
      });
    }
    softRefreshIframe() {
      if (!this.iframe) return;
      if (this.loader) {
        this.iframe.parentElement?.appendChild(this.loader);
        this.iframe.style.opacity = "0";
      }
      this.iframe.src = this.iframe.src;
    }
    // TRACKING_BRIDGE: disabled — uncomment to re-enable
    // private injectTrackingBridge(): void {
    //   if (document.getElementById(TRACKING_BRIDGE_ID)) {
    //     this.trackingBridge = document.getElementById(TRACKING_BRIDGE_ID) as HTMLIFrameElement;
    //     return;
    //   }
    //   const iframe = document.createElement("iframe");
    //   iframe.id = TRACKING_BRIDGE_ID;
    //   iframe.style.cssText =
    //       "display:none;width:0;height:0;border:none;position:absolute;pointer-events:none;";
    //   iframe.setAttribute("aria-hidden", "true");
    //   iframe.setAttribute("tabindex", "-1");
    //   document.body.appendChild(iframe);
    //   this.trackingBridge = iframe;
    // }
    // private updateTrackingBridgeSession(): void {
    //   if (!this.trackingBridge || !this.currentSessionId) return;
    //   const bridgeUrlWithSession = `${this.bridgeUrl}?sessionId=${encodeURIComponent(this.currentSessionId)}`;
    //   if (this.trackingBridge.src !== bridgeUrlWithSession) {
    //     this.trackingBridge.src = bridgeUrlWithSession;
    //   }
    // }
    // private forwardToTrackingBridge(type: string, data: PaymentEmitEventData): void {
    //   if (!this.trackingBridge?.contentWindow) return;
    //   this.trackingBridge.contentWindow.postMessage({ type, data }, "*");
    // }
    setupMessageListener(event) {
      const { type, data } = event.data ?? {};
      if (type === "SET_LANGUAGE" /* SET_LANGUAGE */) {
        this.currentLanguage = data?.language;
        if (this.iframe?.contentWindow && this.currentLanguage) {
          this.iframe.contentWindow.postMessage(
            { type: "SET_LANGUAGE" /* SET_LANGUAGE */, data: { language: this.currentLanguage } },
            "*"
          );
        }
        return;
      }
      if (!this.iframe?.contentWindow) return;
      if (!this.isValidOrigin(event.origin)) {
        throw new CashierError(
          "INVALID_ORIGIN" /* INVALID_ORIGIN */,
          "Message from untrusted origin",
          { origin: event.origin }
        );
      }
      switch (type) {
        case "CLOSE_IFRAME" /* CLOSE_IFRAME */:
          this.emit("iframeCloseRequested" /* IFRAME_CLOSE_REQUESTED */, data);
          this.close();
          break;
        case "CASHIER_LOADED" /* CASHIER_LOADED */:
          if (!this.iframe?.contentWindow) {
            return;
          }
          this.iframe.contentWindow.postMessage(
            {
              type: "SET_DEVICE" /* SET_DEVICE */,
              data: { device: this.cashierProperties.device }
            },
            "*"
          );
          this.iframe.contentWindow.postMessage(
            {
              type: "SET_OPENED_IN" /* SET_OPENED_IN */,
              data: { openedIn: this.isOpenedIn }
            },
            "*"
          );
          if (this.parentUrl) {
            this.iframe.contentWindow.postMessage(
              {
                type: "SET_PARENT_URL" /* SET_PARENT_URL */,
                data: { parentUrl: this.parentUrl }
              },
              "*"
            );
          }
          if (this.currentLanguage) {
            this.iframe.contentWindow.postMessage(
              {
                type: "SET_LANGUAGE" /* SET_LANGUAGE */,
                data: { language: this.currentLanguage }
              },
              "*"
            );
          }
          setTimeout(() => {
            if (this.iframe) {
              this.loader?.remove();
              this.iframe.style.opacity = "1";
            }
          }, 10);
          this.emit("cashierLoaded" /* CASHIER_LOADED */, data);
          break;
        case "LIVE_CHAT_CLICK" /* LIVE_CHAT_CLICK */:
          this.emit("liveChatClicked" /* LIVE_CHAT_CLICKED */, data);
          break;
        case "KYC_REQUIRED_FIELD_ERRORS" /* KYC_REQUIRED_FIELD_ERRORS */:
          this.emit("kycRequiredFieldErrors" /* KYC_REQUIRED_FIELD_ERRORS */, data);
          break;
        case "KYC_REQUIRED_LEVEL_ERRORS" /* KYC_REQUIRED_LEVEL_ERRORS */:
          this.emit("kycRequiredLevelErrors" /* KYC_REQUIRED_LEVEL_ERRORS */, data);
          break;
        case "PAYMENT_SUCCESS" /* PAYMENT_SUCCESS */:
          this.emit("paymentSuccess" /* PAYMENT_SUCCESS */, data);
          break;
        case "PAYMENT_FAILED" /* PAYMENT_FAILED */:
          this.emit("paymentFailed" /* PAYMENT_FAILED */, data);
          break;
        case "PAYMENT_PENDING" /* PAYMENT_PENDING */:
          this.emit("paymentPending" /* PAYMENT_PENDING */, data);
          break;
        case "PAYMENT_CANCELED" /* PAYMENT_CANCELED */:
          this.emit("paymentCanceled" /* PAYMENT_CANCELED */, data);
          break;
        case "MOBILE_OVERLAY_CLICKED" /* MOBILE_OVERLAY_CLICKED */:
          this.emit("overlayClicked" /* OVERLAY_CLICKED */, void 0);
          this.close();
          break;
        default:
          this.emit("unknown" /* UNKNOWN */, { type, data });
          break;
      }
    }
    // TRACKING_BRIDGE: disabled — uncomment to re-enable
    // private handleBridgeMessage(type: string, data: unknown): void {
    //   switch (type) {
    //     case "OMNO_BRIDGE_READY":
    //       break;
    //     case "OMNO_TRACKING_EVENT":
    //       this.emit(CashierEmitEvent.ANALYTICS_EVENT, data as PaymentEmitEventData);
    //       break;
    //   }
    // }
    isValidOrigin(origin) {
      try {
        return true ? true : new URL(this.baseUrl).origin === origin;
      } catch {
        return false;
      }
    }
    detectDevice() {
      if (typeof window === "undefined") return "DESKTOP" /* DESKTOP */;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;
      return isMobile ? "MOBILE" /* MOBILE */ : "DESKTOP" /* DESKTOP */;
    }
    buildUrl(sessionId, paymentAction, layout) {
      return buildCashierUrl(this.baseUrl, sessionId, paymentAction, layout);
    }
    open({ sessionId, containerId, paymentAction, layout }) {
      this.emit("iframeOpenRequested" /* IFRAME_OPEN_REQUESTED */, void 0);
      if (this.isOpen() && this.currentSessionId === sessionId) return;
      if (this.isOpen()) this.close();
      if (paymentAction) this.currentPaymentAction = paymentAction;
      this.currentLayout = layout;
      const url = this.buildUrl(sessionId, paymentAction, layout);
      if (containerId) this.isOpenedIn = "Container";
      else this.isOpenedIn = "Modal";
      try {
        if (containerId) {
          this.iframe = mountInContainerWithId(url, containerId);
          this.container = document.getElementById(containerId) ?? void 0;
        } else if (this.cashierProperties.device === "MOBILE" /* MOBILE */) {
          const { overlay, loader, iframe } = mountMobile(url, this.cashierProperties.styles?.mobile);
          this.container = overlay;
          this.iframe = iframe;
          this.loader = loader;
        } else {
          const { overlay, loader, iframe } = mountModal(url, this.cashierProperties.styles?.modal);
          this.container = overlay;
          this.iframe = iframe;
          this.loader = loader;
        }
        if (this.container?.classList.contains("cashier-modal-overlay") || this.container?.classList.contains("cashier-mobile-overlay")) {
          this.container.addEventListener("click", (e) => {
            if (e.target === this.container) {
              this.emit("overlayClicked" /* OVERLAY_CLICKED */, void 0);
              this.close();
            }
          });
        }
        this.currentSessionId = sessionId;
        this.emit("iframeOpened" /* IFRAME_OPENED */, { sessionId });
      } catch (err) {
        throw err instanceof CashierError ? err : new CashierError("UNKNOWN" /* UNKNOWN */, "Failed to open cashier", err);
      }
    }
    close() {
      if (this.container) {
        if (this.container.classList.contains("cashier-modal-overlay") || this.container.classList.contains("cashier-mobile-overlay")) {
          this.container.remove();
        } else if (this.container === document.body && this.iframe) {
          this.iframe.remove();
        } else {
          this.container.innerHTML = "";
        }
      }
      this.iframe = void 0;
      this.container = void 0;
      this.currentSessionId = void 0;
      this.emit("iframeClosed" /* IFRAME_CLOSED */, void 0);
    }
    reload() {
      if (!this.currentSessionId) {
        throw new CashierError(
          "UNKNOWN" /* UNKNOWN */,
          "Cannot reload cashier: no active session"
        );
      }
      const params = {
        sessionId: this.currentSessionId,
        containerId: this.container?.id,
        paymentAction: this.currentPaymentAction,
        layout: this.currentLayout
      };
      this.close();
      this.open(params);
    }
    destroy() {
      window.removeEventListener("message", this.boundMessageHandler);
      this.close();
      this.emit("iframeDestroyed" /* IFRAME_DESTROYED */, void 0);
    }
    isOpen() {
      return !!this.iframe;
    }
    getSessionId() {
      return this.currentSessionId;
    }
    getDeviceType() {
      return this.cashierProperties.device;
    }
  };

  // src/examples/tracking-bridge-demo.ts
  var SESSION_ID = "165f0983-8258-479f-a18b-7ba5568d2c88";
  var cashier = new CashierSDK({
    device: "AUTO" /* AUTO */,
    styles: {
      modal: {
        backgroundColor: "rgba(0,0,0,0.4)",
        width: "900px",
        height: "800px",
        borderRadius: "12px",
        zIndex: 9
      },
      mobile: {
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 10
      }
    },
    returnUrlAfterRedirection: "http://example",
    baseUrl: "http://localhost:5173/"
  });
  cashier.on("paymentSuccess" /* PAYMENT_SUCCESS */, (data) => {
    console.log("\u2705 PAYMENT_SUCCESS", data);
  });
  cashier.on("paymentFailed" /* PAYMENT_FAILED */, (data) => {
    console.error("\u274C PAYMENT_FAILED", data);
  });
  cashier.on("paymentPending" /* PAYMENT_PENDING */, (data) => {
    console.log("\u23F3 PAYMENT_PENDING", data);
  });
  cashier.on("paymentCanceled" /* PAYMENT_CANCELED */, (data) => {
    console.warn("\u26A0\uFE0F PAYMENT_CANCELED", data);
  });
  document.getElementById("btn-open")?.addEventListener("click", () => {
    cashier.open({ sessionId: SESSION_ID });
  });
  document.getElementById("btn-close")?.addEventListener("click", () => {
    cashier.close();
  });
  document.getElementById("btn-destroy")?.addEventListener("click", () => {
    cashier.destroy();
  });
})();
