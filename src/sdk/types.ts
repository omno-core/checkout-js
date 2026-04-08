// message given to cashierSdk
export enum CashierMessageType {
  CLOSE_IFRAME = "CLOSE_IFRAME",
  CASHIER_LOADED = "CASHIER_LOADED",
  LIVE_CHAT_CLICK = 'LIVE_CHAT_CLICK',
  KYC_REQUIRED_FIELD_ERRORS = 'KYC_REQUIRED_FIELD_ERRORS',
  KYC_REQUIRED_LEVEL_ERRORS = 'KYC_REQUIRED_LEVEL_ERRORS',

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

  KYC_REQUIRED_FIELD_ERRORS = 'kycRequiredFieldErrors',
  KYC_REQUIRED_LEVEL_ERRORS = 'kycRequiredLevelErrors',
  ANALYTICS_EVENT = "ANALYTICS_EVENT",
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

  [CashierEmitEvent.KYC_REQUIRED_FIELD_ERRORS]: KYCRequiredFieldErrorsData[];
  [CashierEmitEvent.KYC_REQUIRED_LEVEL_ERRORS]: KYCRequiredLevelErrorsData[];
  [CashierEmitEvent.ANALYTICS_EVENT]: PaymentEmitEventData;

  [CashierEmitEvent.UNKNOWN]: { type: string; data: any };
};

export type PaymentEmitEventData = {
  transactionId: string,
  status: string,
  currency: string,
  orderId?: string,
  amount?: number,
  merchantTransactionId?: string,
  timestamp?: string
}

export type KYCRequiredFieldErrorsData = {
  fieldName: string,
  issue: 'MISSING' | 'INVALID',
  errorMessage: string
}

export type KYCRequiredLevelErrorsData = {
  level: string,
  description: string,
}

// cashierSdk to iframe message
export enum CashierParentMessageType {
  SET_DEVICE = "SET_DEVICE",
  SET_OPENED_IN = "SET_OPENED_IN",
  SET_PARENT_URL = "SET_PARENT_URL",
  SET_LANGUAGE = "SET_LANGUAGE",
}

export enum MerchantMessageType {
  SET_LANGUAGE = "SET_LANGUAGE",
}

// cashierSdk Properties
export interface CashierProperties {
  device?: DeviceType;
  styles?: CashierStyles;
  returnUrlAfterRedirection?: string;
  baseUrl?: string;
}

export interface ResolvedCashierProperties {
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
