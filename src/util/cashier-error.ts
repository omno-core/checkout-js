export enum CashierErrorCode {
  NO_IFRAME = "NO_IFRAME",
  CONTAINER_NOT_FOUND = "CONTAINER_NOT_FOUND",
  INVALID_ORIGIN = "INVALID_ORIGIN",
  SESSION_CONFLICT = "SESSION_CONFLICT",
  NOT_READY = "NOT_READY",
  UNKNOWN = "UNKNOWN",
}

export class CashierError extends Error {
  public code: CashierErrorCode;
  public details?: any;

  constructor(code: CashierErrorCode, message: string, details?: any) {
    super(message);
    this.name = "CashierError";
    this.code = code;
    this.details = details;
  }
}
