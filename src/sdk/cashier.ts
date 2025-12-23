import { mountModal } from "../ui/modal";
import { mountMobile } from "../ui/mobile";
import { mountInContainerWithId } from "../ui/container";
import { ENV_CONFIG } from "../env";
import { EventEmitter } from "../util/event-emitter";
import {
  CashierEmitEvent,
  type CashierEventMap,
  CashierMessageType,
  CashierParentMessageType,
  type CashierProperties,
  DeviceType,
  type openCashierParameters,
  PaymentAction,
  type PaymentEmitEventData,
  type ResolvedCashierProperties
} from "./types";
import { CashierError, CashierErrorCode } from "../util/cashier-error";
import { DEFAULT_MOBILE_STYLES, DEFAULT_MODAL_STYLES } from "../ui/data";

export class CashierSDK extends EventEmitter<CashierEventMap> {
  private iframe?: HTMLIFrameElement;
  private container?: HTMLElement;
  private isOpenedIn?: "Container" | "Modal";
  private currentPaymentAction?: PaymentAction;
  private currentSessionId?: string;
  private cashierProperties: ResolvedCashierProperties;
  private readonly boundMessageHandler: (event: MessageEvent) => void;
  private parentUrl: string = "";

  constructor(options: CashierProperties) {
    super();
    this.currentPaymentAction = PaymentAction.DEPOSIT;
    this.cashierProperties = {
      environment: options.environment ?? "production",
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

    this.boundMessageHandler = this.setupMessageListener.bind(this);
    window.addEventListener("message", this.boundMessageHandler);
    window.addEventListener("load", () => {
      this.parentUrl = window.location.href;
      const sessionId = new URLSearchParams(window.location.search).get("omCashierSessionIdNo");
      if (sessionId) this.open({ sessionId: sessionId })
    });
  }

  private setupMessageListener(event: MessageEvent): void {
    if (!this.iframe?.contentWindow) return;

    const { type, data } = event.data ?? {};
    if (!Object.values(CashierMessageType).includes(type as CashierMessageType)) return;

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
        this.iframe.contentWindow.postMessage(
          {
            type: CashierParentMessageType.SET_PARENT_URL,
            data: { parentUrl: this.parentUrl }
          },
          "*"
        );
        this.emit(CashierEmitEvent.CASHIER_LOADED, data);
        break;

      case CashierMessageType.LIVE_CHAT_CLICK:
        this.emit(CashierEmitEvent.LIVE_CHAT_CLICKED, data);
        break;

      case CashierMessageType.PAYMENT_SUCCESS:
        this.emit(CashierEmitEvent.PAYMENT_SUCCESS, data as PaymentEmitEventData);
        break;

      case CashierMessageType.PAYMENT_FAILED:
        this.emit(CashierEmitEvent.PAYMENT_FAILED, data as PaymentEmitEventData);
        break;

      case CashierMessageType.PAYMENT_PENDING:
        this.emit(CashierEmitEvent.PAYMENT_PENDING, data as PaymentEmitEventData);
        break;

      case CashierMessageType.PAYMENT_CANCELED:
        this.emit(CashierEmitEvent.PAYMENT_CANCELED, data as PaymentEmitEventData);
        break;

      case CashierMessageType.MOBILE_OVERLAY_CLICKED:
        this.emit(CashierEmitEvent.OVERLAY_CLICKED, undefined);
        break;

      default:
        this.emit(CashierEmitEvent.UNKNOWN, { type, data });
        break;
    }
  }

  private isValidOrigin(origin: string): boolean {
    try {
      const { checkoutBase } = ENV_CONFIG[this.cashierProperties.environment];
      return new URL(checkoutBase).origin === origin;
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

  private buildUrl(sessionId: string, paymentAction: PaymentAction | undefined): string {
    const { checkoutBase } = ENV_CONFIG[this.cashierProperties.environment];
    const suffix = paymentAction ? paymentAction.toLowerCase() : undefined;
    return suffix ? `${checkoutBase}/${sessionId}/${suffix}` : `${checkoutBase}/${sessionId}`;
  }

  open({ sessionId, containerId, paymentAction }: openCashierParameters) {
    this.emit(CashierEmitEvent.IFRAME_OPEN_REQUESTED, undefined);
    if (this.isOpen() && this.currentSessionId === sessionId) return;
    if (this.isOpen()) this.close();

    if (paymentAction) this.currentPaymentAction = paymentAction;
    const url = this.buildUrl(sessionId, paymentAction);

    if (containerId) this.isOpenedIn = "Container";
    else this.isOpenedIn = "Modal"

    try {
      if (containerId) {
        this.iframe = mountInContainerWithId(url, containerId);
        this.container = document.getElementById(containerId) ?? undefined;
      } else if (this.cashierProperties.device === DeviceType.MOBILE) {
        this.container = mountMobile(url, this.cashierProperties.styles?.mobile);
        this.iframe = this.container.querySelector("iframe") ?? undefined;
      } else {
        this.container = mountModal(url, this.cashierProperties.styles?.modal);
        this.iframe = this.container.querySelector("iframe") ?? undefined;
      }

      // click listener for modal
      if (this.container?.classList.contains("cashier-modal-overlay")) {
        this.container.addEventListener("click", () => {
          this.emit(CashierEmitEvent.OVERLAY_CLICKED, undefined);
        });
      }

      this.currentSessionId = sessionId;
      this.emit(CashierEmitEvent.IFRAME_OPENED, { sessionId });
    } catch (err) {
      throw err instanceof CashierError ? err : new CashierError(CashierErrorCode.UNKNOWN, "Failed to open cashier", err);
    }
  }

  close() {
    if (this.container) {
      if (this.container.classList.contains("cashier-modal-overlay") ||
        this.container.classList.contains("cashier-mobile-overlay")) {
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
    };

    this.close();
    this.open(params);
  }


  destroy() {
    window.removeEventListener("message", this.boundMessageHandler);
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
