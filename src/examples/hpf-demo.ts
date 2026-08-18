import { CashierSDK } from "../sdk/cashier";
import {
  CashierEmitEvent,
  type CashierProperties,
  type FieldValidityData,
  type HpfFieldName,
  type HpfHandle,
} from "../sdk/types";

const sessionId = "10cb9ae8-894b-4fd3-8803-ed5d2c974b65";

const cashier = new CashierSDK({
  baseUrl: "http://localhost:5173/",
} as CashierProperties);

const fields: HpfHandle = cashier.mountFields({
  sessionId,
  fields: {
    cardholder: { containerId: "om-cardholder" },
    cardNumber: { containerId: "om-card-number" },
    expiry: { containerId: "om-expiry" },
    cvv: { containerId: "om-cvv" },
  },
  styles: {
    base: {
      color: "#1a1a2e",
      fontFamily: "-apple-system, system-ui, sans-serif",
      fontSize: "16px",
      "::placeholder": { color: "#98a2b3" },
    },
    invalid: { color: "#d92d20" },
    placeholder: {
      cardNumber: "0000 0000 0000 0000",
      expiry: "MM / YY",
      cvv: "•••",
      cardholder: "Name on card",
    },
  },
});

const payButton = document.getElementById("pay") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLDivElement;

const validity: Record<HpfFieldName, boolean> = {
  cardNumber: false,
  expiry: false,
  cvv: false,
  cardholder: false,
};

cashier.on(CashierEmitEvent.FIELD_VALIDITY_CHANGE, ({ field, valid, error }: FieldValidityData) => {
  validity[field] = valid;
  payButton.disabled = !Object.values(validity).every(Boolean);
  if (error) console.warn(`Field ${field}: ${error}`);
});

cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data) => {
  statusEl.textContent = `✅ Approved — transaction ${data.transactionId}`;
  statusEl.className = "ok";
});

cashier.on(CashierEmitEvent.PAYMENT_FAILED, (data) => {
  statusEl.textContent = `❌ Declined — ${data.status}`;
  statusEl.className = "err";
  payButton.disabled = false;
});

cashier.on(CashierEmitEvent.PAYMENT_PENDING, () => {
  statusEl.textContent = "⏳ Processing…";
  statusEl.className = "";
});

payButton.addEventListener("click", () => {
  statusEl.textContent = "⏳ Submitting…";
  statusEl.className = "";
  payButton.disabled = true;
  // `amount` is required for dynamic-amount sessions (a session without a fixed
  // amount / pre-created transaction). In a real integration this comes from the
  // merchant's own amount input. Omit it only for fixed-amount sessions.
  fields.submit({ saveCard: false, amount: 10 });
});
