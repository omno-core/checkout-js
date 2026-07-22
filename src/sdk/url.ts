import { PaymentAction } from "./types";

export function buildCashierUrl(
  baseUrl: string,
  sessionId: string,
  paymentAction?: PaymentAction,
  layout?: "single"
): string {
  const suffix = paymentAction ? paymentAction.toLowerCase() : undefined;
  const path = suffix ? `${baseUrl}/${sessionId}/${suffix}` : `${baseUrl}/${sessionId}`;
  return layout === "single" ? `${path}?layout=single` : path;
}
