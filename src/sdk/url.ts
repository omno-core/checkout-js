import { PaymentAction, type HpfFieldName } from "./types";

export function buildCashierUrl(
  baseUrl: string,
  sessionId: string,
  paymentAction?: PaymentAction,
  layout?: "single",
  mobileHeight?: string
): string {
  const suffix = paymentAction ? paymentAction.toLowerCase() : undefined;
  const path = suffix ? `${baseUrl}/${sessionId}/${suffix}` : `${baseUrl}/${sessionId}`;

  const params = new URLSearchParams();
  if (layout === "single") params.set("layout", "single");
  if (mobileHeight) params.set("mobileHeight", mobileHeight);
  const query = params.toString();

  return query ? `${path}?${query}` : path;
}

export const HPF_FIELD_SLUGS: Record<HpfFieldName, string> = {
  cardNumber: "card-number",
  expiry: "expiry",
  cvv: "cvv",
  cardholder: "cardholder",
};

export function buildFieldUrl(
  originBaseUrl: string,
  field: HpfFieldName,
  sessionId: string
): string {
  const slug = HPF_FIELD_SLUGS[field];
  return `${originBaseUrl}/embed/field/${slug}?session=${encodeURIComponent(sessionId)}`;
}

export function buildCoordinatorUrl(originBaseUrl: string, sessionId: string): string {
  return `${originBaseUrl}/embed/coordinator?session=${encodeURIComponent(sessionId)}`;
}
