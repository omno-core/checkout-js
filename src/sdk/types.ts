import type { Environment } from "../env.ts";

// message given to cashierSdk
export enum CashierMessageType {
  OPEN_IFRAME = "OPEN_IFRAME",
  CLOSE_IFRAME = "CLOSE_IFRAME",
  CASHIER_LOADED = "CASHIER_LOADED",

  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_CANCELED = "PAYMENT_CANCELED",
  PAYMENT_REDIRECT = "PAYMENT_REDIRECT",
}

// message emitted by cashierSdk
export enum CashierEmitEvent {
  IFRAME_OPENED = "iframeOpened",
  IFRAME_CLOSED = "iframeClosed",
  IFRAME_DESTROYED = "iframeDestroyed",
  IFRAME_OPEN_REQUESTED = "iframeOpenRequested",
  IFRAME_CLOSE_REQUESTED = "iframeCloseRequested",
  CASHIER_LOADED = "cashierLoaded",

  PAYMENT_SUCCESS = "paymentSuccess",
  PAYMENT_FAILED = "paymentFailed",
  PAYMENT_PENDING = "paymentPending",
  PAYMENT_CANCELED = "paymentCanceled",
  PAYMENT_REDIRECT = "paymentRedirect",

  UNKNOWN = "unknown",
}

// types of what each emitted event returns
export type CashierEventMap = {
  [CashierEmitEvent.IFRAME_OPENED]: { sessionId: string };
  [CashierEmitEvent.IFRAME_CLOSED]: void;
  [CashierEmitEvent.IFRAME_DESTROYED]: void;
  [CashierEmitEvent.IFRAME_OPEN_REQUESTED]: void;
  [CashierEmitEvent.IFRAME_CLOSE_REQUESTED]: void;
  [CashierEmitEvent.CASHIER_LOADED]: void;

  [CashierEmitEvent.PAYMENT_SUCCESS]: PaymentEmitEventData;
  [CashierEmitEvent.PAYMENT_FAILED]: PaymentEmitEventData;
  [CashierEmitEvent.PAYMENT_PENDING]: PaymentEmitEventData;
  [CashierEmitEvent.PAYMENT_CANCELED]: PaymentEmitEventData;
  [CashierEmitEvent.PAYMENT_REDIRECT]: PaymentEmitEventData;

  [CashierEmitEvent.UNKNOWN]: { type: string; data: any };
};

export type PaymentEmitEventData = {
  transactionId: string,
  status: string,
  currency: string,
  orderId: string,
  amount?: number
}

// cashierSdk to iframe message
export enum CashierParentMessageType {
  SET_DEVICE = "SET_DEVICE",
}

// cashierSdk Properties
export interface CashierProperties {
  environment?: Environment;
  device?: DeviceType;
  styles?: CashierStyles;
}

export interface ResolvedCashierProperties {
  environment: Environment;
  device: DeviceType;
  styles: CashierStyles;
}

export enum DeviceType {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  AUTO = 'AUTO'
}

// styles
export interface ModalStyles {
  backgroundColor?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  zIndex?: number;
}

export interface MobileStyles {
  backgroundColor?: string;
  zIndex?: number;
}

export interface CashierStyles {
  modal?: ModalStyles;
  mobile?: MobileStyles;
}
