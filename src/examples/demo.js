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
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: ${backgroundColor}; z-index: ${zIndex - 1};
  `;
    const modal = document.createElement("div");
    modal.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: ${width}; height: ${height};
    background: transparent; border-radius: ${borderRadius};
    overflow: hidden; z-index: ${zIndex};
  `;
    const iframe = document.createElement("iframe");
    iframe.allow = "clipboard-read; clipboard-write";
    iframe.src = url;
    iframe.style.cssText = "width: 100%; height: 100%; border: none;";
    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    return overlay;
  }

  // src/ui/mobile.ts
  function mountMobile(url, styles = {}) {
    const {
      backgroundColor = DEFAULT_MOBILE_STYLES.backgroundColor,
      zIndex = DEFAULT_MOBILE_STYLES.zIndex
    } = styles;
    const wrapper = document.createElement("div");
    wrapper.classList.add("cashier-mobile-overlay");
    wrapper.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: ${backgroundColor}; z-index: ${zIndex};
  `;
    const iframe = document.createElement("iframe");
    iframe.allow = "clipboard-read; clipboard-write";
    iframe.src = url;
    iframe.style.cssText = `
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; border: none; background: transparent;
  `;
    wrapper.appendChild(iframe);
    document.body.appendChild(wrapper);
    return wrapper;
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

  // src/env.ts
  var ENV_CONFIG = {
    sandbox: {
      checkoutBase: "http://localhost:5173/payments-v2/cashier"
    },
    production: {
      checkoutBase: "https://checkout.omno.com/payments-v2/cashier"
    }
  };

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

  // src/sdk/types.ts
  var CashierMessageType = /* @__PURE__ */ ((CashierMessageType2) => {
    CashierMessageType2["CLOSE_IFRAME"] = "CLOSE_IFRAME";
    CashierMessageType2["CASHIER_LOADED"] = "CASHIER_LOADED";
    CashierMessageType2["LIVE_CHAT_CLICK"] = "LIVE_CHAT_CLICK";
    CashierMessageType2["PAYMENT_SUCCESS"] = "PAYMENT_SUCCESS";
    CashierMessageType2["PAYMENT_FAILED"] = "PAYMENT_FAILED";
    CashierMessageType2["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    CashierMessageType2["PAYMENT_CANCELED"] = "PAYMENT_CANCELED";
    CashierMessageType2["MOBILE_OVERLAY_CLICKED"] = "MOBILE_OVERLAY_CLICKED";
    return CashierMessageType2;
  })(CashierMessageType || {});

  // src/sdk/cashier.ts
  var CashierSDK = class extends EventEmitter {
    constructor(options) {
      super();
      this.parentUrl = "";
      this.currentPaymentAction = "DEPOSIT" /* DEPOSIT */;
      this.cashierProperties = {
        environment: options.environment ?? "production",
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
      this.boundMessageHandler = this.setupMessageListener.bind(this);
      window.addEventListener("message", this.boundMessageHandler);
      window.addEventListener("load", () => {
        this.parentUrl = window.location.href;
        const sessionId2 = new URLSearchParams(window.location.search).get("omCashierSessionIdNo");
        if (sessionId2) this.open({ sessionId: sessionId2 });
      });
    }
    setupMessageListener(event) {
      if (!this.iframe?.contentWindow) return;
      const { type, data } = event.data ?? {};
      if (!Object.values(CashierMessageType).includes(type)) return;
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
          this.iframe.contentWindow.postMessage(
            {
              type: "SET_PARENT_URL" /* SET_PARENT_URL */,
              data: { parentUrl: this.parentUrl }
            },
            "*"
          );
          this.emit("cashierLoaded" /* CASHIER_LOADED */, data);
          break;
        case "LIVE_CHAT_CLICK" /* LIVE_CHAT_CLICK */:
          this.emit("liveChatClicked" /* LIVE_CHAT_CLICKED */, data);
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
          break;
        default:
          this.emit("unknown" /* UNKNOWN */, { type, data });
          break;
      }
    }
    isValidOrigin(origin) {
      try {
        const { checkoutBase } = ENV_CONFIG[this.cashierProperties.environment];
        return new URL(checkoutBase).origin === origin;
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
    buildUrl(sessionId2, paymentAction) {
      const { checkoutBase } = ENV_CONFIG[this.cashierProperties.environment];
      const suffix = paymentAction ? paymentAction.toLowerCase() : void 0;
      return suffix ? `${checkoutBase}/${sessionId2}/${suffix}` : `${checkoutBase}/${sessionId2}`;
    }
    open({ sessionId: sessionId2, containerId, paymentAction }) {
      this.emit("iframeOpenRequested" /* IFRAME_OPEN_REQUESTED */, void 0);
      if (this.isOpen() && this.currentSessionId === sessionId2) return;
      if (this.isOpen()) this.close();
      if (paymentAction) this.currentPaymentAction = paymentAction;
      const url = this.buildUrl(sessionId2, paymentAction);
      if (containerId) this.isOpenedIn = "Container";
      else this.isOpenedIn = "Modal";
      try {
        if (containerId) {
          this.iframe = mountInContainerWithId(url, containerId);
          this.container = document.getElementById(containerId) ?? void 0;
        } else if (this.cashierProperties.device === "MOBILE" /* MOBILE */) {
          this.container = mountMobile(url, this.cashierProperties.styles?.mobile);
          this.iframe = this.container.querySelector("iframe") ?? void 0;
        } else {
          this.container = mountModal(url, this.cashierProperties.styles?.modal);
          this.iframe = this.container.querySelector("iframe") ?? void 0;
        }
        if (this.container?.classList.contains("cashier-modal-overlay")) {
          this.container.addEventListener("click", () => {
            this.emit("overlayClicked" /* OVERLAY_CLICKED */, void 0);
          });
        }
        this.currentSessionId = sessionId2;
        this.emit("iframeOpened" /* IFRAME_OPENED */, { sessionId: sessionId2 });
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
        paymentAction: this.currentPaymentAction
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

  // src/examples/demo.ts
  var sessionId = "82d89595-4b8b-4102-8657-10bb310d1e9e";
  var cashier = new CashierSDK({
    device: "AUTO" /* AUTO */,
    environment: "sandbox",
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
    }
  });
  cashier.on("iframeOpenRequested" /* IFRAME_OPEN_REQUESTED */, () => {
    console.log("Cashier open requested");
  });
  cashier.on("iframeOpened" /* IFRAME_OPENED */, ({ sessionId: sessionId2 }) => {
    console.log("Cashier opened with session:", sessionId2);
  });
  cashier.on("cashierLoaded" /* CASHIER_LOADED */, () => {
    console.log("Cashier finished loading");
  });
  cashier.on("paymentSuccess" /* PAYMENT_SUCCESS */, (data) => {
    console.log("\u2705 Payment success", data);
  });
  cashier.on("paymentFailed" /* PAYMENT_FAILED */, (data) => {
    console.error("\u274C Payment failed", data);
  });
  cashier.on("paymentPending" /* PAYMENT_PENDING */, (data) => {
    console.log("\u23F3 Payment pending", data);
  });
  cashier.on("paymentCanceled" /* PAYMENT_CANCELED */, (data) => {
    console.warn("\u26A0\uFE0F Payment canceled", data);
  });
  cashier.on("iframeCloseRequested" /* IFRAME_CLOSE_REQUESTED */, () => {
    console.log("Cashier iframe close requested");
  });
  cashier.on("iframeClosed" /* IFRAME_CLOSED */, () => {
    console.log("Cashier iframe closed");
  });
  cashier.on("iframeDestroyed" /* IFRAME_DESTROYED */, () => {
    console.log("Cashier destroyed");
  });
  cashier.on("liveChatClicked" /* LIVE_CHAT_CLICKED */, () => {
    console.log("Live chat clicked");
  });
  cashier.on("overlayClicked" /* OVERLAY_CLICKED */, () => {
    console.log("Clicked outside of the cashier");
  });
  document.getElementById("btn-open")?.addEventListener("click", () => {
    cashier.open({ sessionId });
  });
  document.getElementById("btn-container")?.addEventListener("click", () => {
    cashier.open({ sessionId, containerId: "your-container-id" });
  });
  document.getElementById("btn-container")?.addEventListener("click", () => {
    cashier.open({ sessionId, paymentAction: "WITHDRAW" /* WITHDRAW */ });
  });
  document.getElementById("btn-close")?.addEventListener("click", () => {
    cashier.close();
  });
  document.getElementById("btn-reload")?.addEventListener("click", () => {
    cashier.reload();
  });
  document.getElementById("btn-destroy")?.addEventListener("click", () => {
    cashier.destroy();
  });
})();
