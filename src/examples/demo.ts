import {CashierSDK} from "../sdk/cashier";
import {
  CashierEmitEvent,
  type CashierProperties,
  DeviceType,
  type MobileStyles,
  type ModalStyles,
  PaymentAction,
  type PaymentEmitEventData
} from "../sdk/types";

const sessionId = "45e71f59-6c99-4d1b-87d3-8d5d8f909f3c";
// Paste a fresh cashier JWT (from the create-session response) whose session_id
// claim matches `sessionId` above. Leave undefined to open without a token.
const token: string | undefined = "eyJhbGciOiJIUzI1NiIsImtpZCI6ImRlZmF1bHQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJjYXNoaWVyLXNlcnZpY2UiLCJleHAiOjE3OTA5MzA3MTgsImlhdCI6MTc5MDkyOTgxOCwianRpIjoiYjQ0MGI3MDMtYWRhNi00NjhiLTk4YWMtZjI2MGFkNjdjM2RlIiwibWVyY2hhbnRfaWQiOiJhOWNmNDI1MTllOTQ0OGExOWIwNGI5Yzg2YjBlMWE2NiIsImN1c3RvbWVyX2lkIjoiMWZmZTU2MmYtNzc4YS00OTE4LWFjYmMtMGVjMmM5NjdiMmNiIiwic2Vzc2lvbl9pZCI6IjQ1ZTcxZjU5LTZjOTktNGQxYi04N2QzLThkNWQ4ZjkwOWYzYyJ9.GROYqWWlmiZSPmmzwuGFfODJRIs-1heQGfEAS7-keso";

// 1. Initialize SDK
const cashier = new CashierSDK({
  device: DeviceType.AUTO,
  styles: {
    modal: {
      backgroundColor: "rgba(0,0,0,0.4)",
      width: "900px",
      height: "800px",
      borderRadius: "12px",
      zIndex: 9
    } as ModalStyles,
    mobile: {
      backgroundColor: "rgba(0,0,0,0.4)",
      zIndex: 10
    } as MobileStyles,
  },
  returnUrlAfterRedirection: "http://example",
  baseUrl: "http://localhost:5173/"
} as CashierProperties);

// 2. Register listeners
cashier.on(CashierEmitEvent.IFRAME_OPEN_REQUESTED, () => {
  console.log("Cashier open requested");
});

cashier.on(CashierEmitEvent.IFRAME_OPENED, ({ sessionId }) => {
  console.log("Cashier opened with session:", sessionId);
});

cashier.on(CashierEmitEvent.CASHIER_LOADED, () => {
  console.log("Cashier finished loading");
});

cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data: PaymentEmitEventData) => {
  console.log("✅ Payment success", data);
});

cashier.on(CashierEmitEvent.PAYMENT_FAILED, (data) => {
  console.error("❌ Payment failed", data);
});

cashier.on(CashierEmitEvent.PAYMENT_PENDING, (data) => {
  console.log("⏳ Payment pending", data);
});

cashier.on(CashierEmitEvent.PAYMENT_CANCELED, (data) => {
  console.warn("⚠️ Payment canceled", data);
});

cashier.on(CashierEmitEvent.IFRAME_CLOSE_REQUESTED, () => {
  console.log("Cashier iframe close requested");
});

cashier.on(CashierEmitEvent.IFRAME_CLOSED, () => {
  console.log("Cashier iframe closed");
});

cashier.on(CashierEmitEvent.IFRAME_DESTROYED, () => {
  console.log("Cashier destroyed");
});

cashier.on(CashierEmitEvent.LIVE_CHAT_CLICKED, () => {
  console.log("Live chat clicked");
});

cashier.on(CashierEmitEvent.OVERLAY_CLICKED, () => {
  console.log("Clicked outside of the cashier");
});

cashier.on(CashierEmitEvent.KYC_REQUIRED_FIELD_ERRORS, (data) => {
  console.log("KYC Required Field Errors:", data);
});

cashier.on(CashierEmitEvent.KYC_REQUIRED_LEVEL_ERRORS, (data) => {
  console.log("KYC Required Level Errors:", data);
});
// cashier.on(CashierEmitEvent.ANALYTICS_EVENT, (data) => { // TRACKING_BRIDGE: disabled
//   console.log("Analytics Event:", data);
// });

// 3. Open Cashier (modal by default)
document.getElementById("btn-open")?.addEventListener("click", () => {
  cashier.open({ sessionId, token });
});

// 3b. Open Cashier in single layout mode (?layout=single)
document.getElementById("btn-open-single")?.addEventListener("click", () => {
  cashier.open({ sessionId, layout: "single" });
});

// 4. Open Cashier in a specific container
document.getElementById("btn-container")?.addEventListener("click", () => {
  cashier.open({ sessionId, containerId: "your-container-id" });
});

// 5. Open Cashier with a specific payment action: Withdraw or Deposit
document.getElementById("btn-container")?.addEventListener("click", () => {
  cashier.open({ sessionId, paymentAction: PaymentAction.WITHDRAW });
});

// 6. Close cashier
document.getElementById("btn-close")?.addEventListener("click", () => {
  cashier.close();
});

// 7. Close cashier
document.getElementById("btn-reload")?.addEventListener("click", () => {
  cashier.reload();
});

// 8. Destroy the cashier instance completely
document.getElementById("btn-destroy")?.addEventListener("click", () => {
  cashier.destroy();
});

// 9. Set language dynamically
document.querySelectorAll("[data-lang]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const language = (btn as HTMLElement).dataset.lang!;
    console.log(`🌍 Setting language: ${language}`);
    window.postMessage({ type: "SET_LANGUAGE", data: { language } }, "*");
  });
});

