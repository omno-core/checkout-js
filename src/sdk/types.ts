import { ENV_CONFIG } from "../env";

// message given to cashierSdk
export enum CashierMessageType {
  CLOSE_IFRAME = "CLOSE_IFRAME",
  CASHIER_LOADED = "CASHIER_LOADED",
  LIVE_CHAT_CLICK = 'LIVE_CHAT_CLICK',

  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_CANCELED = "PAYMENT_CANCELED",

  MOBILE_OVERLAY_CLICKED = "MOBILE_OVERLAY_CLICKED",
}

// message emitted by cashierSdk
export enum CashierEmitEvent {
  IFRAME_OPENED = "iframeOpened",
  IFRAME_CLOSED = "iframeClosed",
  IFRAME_DESTROYED = "iframeDestroyed",
  IFRAME_OPEN_REQUESTED = "iframeOpenRequested",
  IFRAME_CLOSE_REQUESTED = "iframeCloseRequested",
  CASHIER_LOADED = "cashierLoaded",
  LIVE_CHAT_CLICKED = "liveChatClicked",
  OVERLAY_CLICKED = "overlayClicked",

  PAYMENT_SUCCESS = "paymentSuccess",
  PAYMENT_FAILED = "paymentFailed",
  PAYMENT_PENDING = "paymentPending",
  PAYMENT_CANCELED = "paymentCanceled",

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
  [CashierEmitEvent.LIVE_CHAT_CLICKED]: void;
  [CashierEmitEvent.OVERLAY_CLICKED]: void;

  [CashierEmitEvent.PAYMENT_SUCCESS]: PaymentEmitEventData;
  [CashierEmitEvent.PAYMENT_FAILED]: PaymentEmitEventData;
  [CashierEmitEvent.PAYMENT_PENDING]: PaymentEmitEventData;
  [CashierEmitEvent.PAYMENT_CANCELED]: PaymentEmitEventData;

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
  SET_OPENED_IN = "SET_OPENED_IN",
  SET_PARENT_URL = "SET_PARENT_URL",
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

export enum PaymentAction {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export type Environment = keyof typeof ENV_CONFIG;

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

// event properties
export type openCashierParameters = {
  sessionId: string;
  containerId?: string;
  paymentAction?: PaymentAction | undefined;
}
