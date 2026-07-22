import {mountModal} from "../ui/modal";
import {mountMobile} from "../ui/mobile";
import {mountInContainerWithId} from "../ui/container";
import {EventEmitter} from "../util/event-emitter";
import {
  CashierEmitEvent,
  type CashierEventMap,
  CashierMessageType,
  CashierParentMessageType,
  MerchantMessageType,
  type CashierProperties,
  DeviceType,
  KYCRequiredFieldErrorsData, KYCRequiredLevelErrorsData,
  type openCashierParameters,
  PaymentAction,
  type PaymentEmitEventData,
  type ResolvedCashierProperties
} from "./types";
import {CashierError, CashierErrorCode} from "../util/cashier-error";
import {DEFAULT_MOBILE_STYLES, DEFAULT_MODAL_STYLES} from "../ui/data";
import {buildCashierUrl} from "./url";

// const TRACKING_BRIDGE_ID = "omno-tracking-bridge"; // TRACKING_BRIDGE: disabled

export class CashierSDK extends EventEmitter<CashierEventMap> {
  private iframe?: HTMLIFrameElement;
  private container?: HTMLElement;
  private loader?: HTMLElement;
  private isOpenedIn?: "Container" | "Modal";
  private currentPaymentAction?: PaymentAction;
  private currentLayout?: "single";
  private currentSessionId?: string;
  private currentLanguage?: string;
  private cashierProperties: ResolvedCashierProperties;
  private readonly boundMessageHandler: (event: MessageEvent) => void;
  private readonly parentUrl: string | undefined = undefined;
  private readonly baseUrl: string;
  // private trackingBridge?: HTMLIFrameElement; // TRACKING_BRIDGE: disabled
  // private readonly bridgeUrl: string; // TRACKING_BRIDGE: disabled

  constructor(options: CashierProperties) {
    super();
    this.currentPaymentAction = PaymentAction.DEPOSIT;
    this.cashierProperties = {
      device: options.device ?? this.detectDevice(),
      styles: {
        modal: { ...DEFAULT_MODAL_STYLES, ...options.styles?.modal },
        mobile: { ...DEFAULT_MOBILE_STYLES, ...options.styles?.mobile },
      },
    };

    if (options.device && options.device !== DeviceType.AUTO) {
      this.cashierProperties.device = options.device;
    } else {
      this.cashierProperties.device = this.detectDevice();
    }
    this.parentUrl = options.returnUrlAfterRedirection;
    this.baseUrl = `${options.baseUrl?.replace(/\/+$/, '')}/payments-v2/cashier`;

    // this.bridgeUrl = `${options.baseUrl?.replace(/\/+$/, '')}/tracking-bridge`; // TRACKING_BRIDGE: disabled

    this.boundMessageHandler = this.setupMessageListener.bind(this);
    window.addEventListener("message", this.boundMessageHandler);
    // this.injectTrackingBridge(); // TRACKING_BRIDGE: disabled
    window.addEventListener("load", () => {
      const sessionId = new URLSearchParams(window.location.search).get("omCashierSessionIdNo");
      if (sessionId) this.open({ sessionId: sessionId });
    });
    window.addEventListener("pageshow", (event: PageTransitionEvent) => {
      if (!event.persisted || !this.isOpen() || !this.iframe) return;
      this.softRefreshIframe();
    });
  }

  private softRefreshIframe(): void {
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


  private setupMessageListener(event: MessageEvent): void {
    const { type, data } = event.data ?? {};

    // TRACKING_BRIDGE: disabled
    // if (type === "OMNO_BRIDGE_READY" || type === "OMNO_TRACKING_EVENT") {
    //   this.handleBridgeMessage(type, data);
    //   return;
    // }

    if (type === MerchantMessageType.SET_LANGUAGE) {
      this.currentLanguage = data?.language;
      if (this.iframe?.contentWindow && this.currentLanguage) {
        this.iframe.contentWindow.postMessage(
            { type: CashierParentMessageType.SET_LANGUAGE, data: { language: this.currentLanguage } },
            "*"
        );
      }
      return;
    }

    if (!this.iframe?.contentWindow) return;
    // TRACKING_BRIDGE: disabled
    // if (!Object.values(CashierMessageType).includes(type as CashierMessageType)) {
    //   this.handleBridgeMessage(type, data);
    //   return;
    // }

    if (!this.isValidOrigin(event.origin)) {
      throw new CashierError(
          CashierErrorCode.INVALID_ORIGIN,
          "Message from untrusted origin",
          { origin: event.origin }
      );
    }

    switch (type) {
      case CashierMessageType.CLOSE_IFRAME:
        this.emit(CashierEmitEvent.IFRAME_CLOSE_REQUESTED, data);
        this.close();
        break;

      case CashierMessageType.CASHIER_LOADED:
        if (!this.iframe?.contentWindow) {
          return;
        }
        this.iframe.contentWindow.postMessage(
            {
              type: CashierParentMessageType.SET_DEVICE,
              data: { device: this.cashierProperties.device }
            },
            "*"
        );
        this.iframe.contentWindow.postMessage(
            {
              type: CashierParentMessageType.SET_OPENED_IN,
              data: { openedIn: this.isOpenedIn }
            },
            "*"
        );
        if (this.parentUrl) {
          this.iframe.contentWindow.postMessage(
              {
                type: CashierParentMessageType.SET_PARENT_URL,
                data: { parentUrl: this.parentUrl }
              },
              "*"
          );
        }
        if (this.currentLanguage) {
          this.iframe.contentWindow.postMessage(
              {
                type: CashierParentMessageType.SET_LANGUAGE,
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

        this.emit(CashierEmitEvent.CASHIER_LOADED, data);
        break;

      case CashierMessageType.LIVE_CHAT_CLICK:
        this.emit(CashierEmitEvent.LIVE_CHAT_CLICKED, data);
        break;

      case CashierMessageType.KYC_REQUIRED_FIELD_ERRORS:
        this.emit(CashierEmitEvent.KYC_REQUIRED_FIELD_ERRORS, data as KYCRequiredFieldErrorsData[]);
        break;

      case CashierMessageType.KYC_REQUIRED_LEVEL_ERRORS:
        this.emit(CashierEmitEvent.KYC_REQUIRED_LEVEL_ERRORS, data as KYCRequiredLevelErrorsData[]);
        break;

      case CashierMessageType.PAYMENT_SUCCESS:
        this.emit(CashierEmitEvent.PAYMENT_SUCCESS, data as PaymentEmitEventData);
        // this.forwardToTrackingBridge("PAYMENT_SUCCESS", data as PaymentEmitEventData); // TRACKING_BRIDGE: disabled
        break;

      case CashierMessageType.PAYMENT_FAILED:
        this.emit(CashierEmitEvent.PAYMENT_FAILED, data as PaymentEmitEventData);
        // this.forwardToTrackingBridge("PAYMENT_FAILED", data as PaymentEmitEventData); // TRACKING_BRIDGE: disabled
        break;

      case CashierMessageType.PAYMENT_PENDING:
        this.emit(CashierEmitEvent.PAYMENT_PENDING, data as PaymentEmitEventData);
        // this.forwardToTrackingBridge("PAYMENT_PENDING", data as PaymentEmitEventData); // TRACKING_BRIDGE: disabled
        break;

      case CashierMessageType.PAYMENT_CANCELED:
        this.emit(CashierEmitEvent.PAYMENT_CANCELED, data as PaymentEmitEventData);
        // this.forwardToTrackingBridge("PAYMENT_CANCELED", data as PaymentEmitEventData); // TRACKING_BRIDGE: disabled
        break;

      case CashierMessageType.MOBILE_OVERLAY_CLICKED:
        this.emit(CashierEmitEvent.OVERLAY_CLICKED, undefined);
        this.close();
        break;

      default:
        this.emit(CashierEmitEvent.UNKNOWN, { type, data });
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

  private isValidOrigin(origin: string): boolean {
    try {
      return __DEV__ ? true : new URL(this.baseUrl).origin === origin;
    } catch {
      return false;
    }
  }

  private detectDevice(): DeviceType {
    if (typeof window === "undefined") return DeviceType.DESKTOP;
    const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        ) || window.innerWidth <= 768;
    return isMobile ? DeviceType.MOBILE : DeviceType.DESKTOP;
  }

  private buildUrl(
    sessionId: string,
    paymentAction: PaymentAction | undefined,
    layout?: "single"
  ): string {
    return buildCashierUrl(this.baseUrl, sessionId, paymentAction, layout);
  }

  open({ sessionId, containerId, paymentAction, layout }: openCashierParameters) {
    this.emit(CashierEmitEvent.IFRAME_OPEN_REQUESTED, undefined);
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
        this.container = document.getElementById(containerId) ?? undefined;
      } else if (this.cashierProperties.device === DeviceType.MOBILE) {
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

      if (
        this.container?.classList.contains("cashier-modal-overlay") ||
        this.container?.classList.contains("cashier-mobile-overlay")
      ) {
        this.container.addEventListener("click", (e) => {
          if (e.target === this.container) {
            this.emit(CashierEmitEvent.OVERLAY_CLICKED, undefined);
            this.close();
          }
        });
      }

      this.currentSessionId = sessionId;
      // this.updateTrackingBridgeSession(); // TRACKING_BRIDGE: disabled
      this.emit(CashierEmitEvent.IFRAME_OPENED, { sessionId });
    } catch (err) {
      throw err instanceof CashierError
          ? err
          : new CashierError(CashierErrorCode.UNKNOWN, "Failed to open cashier", err);
    }
  }

  close() {
    if (this.container) {
      if (
          this.container.classList.contains("cashier-modal-overlay") ||
          this.container.classList.contains("cashier-mobile-overlay")
      ) {
        this.container.remove();
      } else if (this.container === document.body && this.iframe) {
        this.iframe.remove();
      } else {
        this.container.innerHTML = "";
      }
    }
    this.iframe = undefined;
    this.container = undefined;
    this.currentSessionId = undefined;
    this.emit(CashierEmitEvent.IFRAME_CLOSED, undefined);
  }

  reload() {
    if (!this.currentSessionId) {
      throw new CashierError(
          CashierErrorCode.UNKNOWN,
          "Cannot reload cashier: no active session"
      );
    }

    const params: openCashierParameters = {
      sessionId: this.currentSessionId,
      containerId: this.container?.id,
      paymentAction: this.currentPaymentAction,
      layout: this.currentLayout,
    };

    this.close();
    this.open(params);
  }

  destroy() {
    window.removeEventListener("message", this.boundMessageHandler);
    // document.getElementById(TRACKING_BRIDGE_ID)?.remove(); // TRACKING_BRIDGE: disabled
    // this.trackingBridge = undefined; // TRACKING_BRIDGE: disabled
    this.close();
    this.emit(CashierEmitEvent.IFRAME_DESTROYED, undefined);
  }

  isOpen(): boolean {
    return !!this.iframe;
  }

  getSessionId(): string | undefined {
    return this.currentSessionId;
  }

  getDeviceType(): DeviceType {
    return this.cashierProperties.device;
  }
}