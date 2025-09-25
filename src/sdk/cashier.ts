import { mountModal } from "../ui/modal";
import { mountMobile } from "../ui/mobile";
import { mountInContainerWithId } from "../ui/container";
import { ENV_CONFIG } from "../env";
import { EventEmitter } from "../util/event-emitter";
import {
  CashierEmitEvent,
  type CashierEventMap,
  CashierMessageType, CashierParentMessageType,
  type CashierProperties,
  DeviceType, type PaymentEmitEventData, type ResolvedCashierProperties
} from "./types";
import { CashierError, CashierErrorCode } from "../util/cashier-error";
import { DEFAULT_MOBILE_STYLES, DEFAULT_MODAL_STYLES } from "../ui/data";

export class CashierSDK extends EventEmitter<CashierEventMap> {
  private iframe?: HTMLIFrameElement;
  private container?: HTMLElement;
  private currentSessionId?: string;
  private cashierProperties: ResolvedCashierProperties;
  private readonly boundMessageHandler: (event: MessageEvent) => void;

  constructor(options: CashierProperties = {}) {
    super();
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
  }

  private setupMessageListener(event: MessageEvent): void {
    if (!this.isValidOrigin(event.origin)) {
      throw new CashierError(
        CashierErrorCode.INVALID_ORIGIN,
        "Message from untrusted origin",
        { origin: event.origin }
      );
    }

    const { type, data } = event.data ?? {};

    switch (type) {
      case CashierMessageType.OPEN_IFRAME:
        this.emit(CashierEmitEvent.IFRAME_OPEN_REQUESTED, data);
        this.close();
        break;

      case CashierMessageType.CLOSE_IFRAME:
        this.emit(CashierEmitEvent.IFRAME_CLOSE_REQUESTED, data);
        this.close();
        break;

      case CashierMessageType.CASHIER_LOADED:
        if (!this.iframe?.contentWindow) {
          return;
        }
        this.iframe.contentWindow.postMessage(
          { type: CashierParentMessageType.SET_DEVICE, data: { device: this.cashierProperties.device } },
          "*"
        );
        this.emit(CashierEmitEvent.CASHIER_LOADED, data);
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

  private buildUrl(sessionId: string): string {
    const { checkoutBase } = ENV_CONFIG[this.cashierProperties.environment];
    return `${checkoutBase}/${sessionId}`;
  }

  open(sessionId: string, containerId?: string) {
    if (this.isOpen() && this.currentSessionId === sessionId) return;
    if (this.isOpen()) this.close();

    const url = this.buildUrl(sessionId);

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

      this.currentSessionId = sessionId;
      this.emit(CashierEmitEvent.IFRAME_OPENED, { sessionId });
    } catch (err) {
      throw err instanceof CashierError ? err : new CashierError(CashierErrorCode.UNKNOWN, "Failed to open cashier", err);
    }
  }

  close() {
    if (this.container) {
      if (this.container.classList.contains("cashier-modal-overlay")) {
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
