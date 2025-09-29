import { CashierEmitEvent, DeviceType } from "../sdk/types";
import { CashierSDK } from "../sdk/cashier";

const sessionId = "94c78160-81b7-43ef-b4ca-e64519047b8d";

// 1. Initialize SDK
const cashier = new CashierSDK({
  device: DeviceType.AUTO,
  environment: "sandbox",
  styles: {
    modal: {
      backgroundColor: "rgba(0,0,0,0.4)",
      width: "900px",
      height: "600px",
      borderRadius: "12px",
      zIndex: 9
    },
    mobile: {
      backgroundColor: "rgba(0,0,0,0.4)",
      zIndex: 10
    }
  }
});

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

cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data) => {
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

// 3. Open Cashier (modal by default)
document.getElementById("btn-open")?.addEventListener("click", () => {
  cashier.open(sessionId);
});

// 4. Open Cashier in a specific container
document.getElementById("btn-container")?.addEventListener("click", () => {
  cashier.open(sessionId, "cashier-slot");
});

// 5. Close cashier
document.getElementById("btn-close")?.addEventListener("click", () => {
  cashier.close();
});

// 6. Destroy the cashier instance completely
document.getElementById("btn-destroy")?.addEventListener("click", () => {
  cashier.destroy();
});
