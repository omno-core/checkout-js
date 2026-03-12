import { CashierSDK } from "../sdk/cashier";
import {
    CashierEmitEvent,
    type CashierProperties,
    DeviceType,
    type MobileStyles,
    type ModalStyles,
    type PaymentEmitEventData,
} from "../sdk/types";

const SESSION_ID = "33561b21-c733-481a-afda-547d747910f7";
let lastTxId: string | null = null;

const cashier = new CashierSDK({
    device: DeviceType.AUTO,
    styles: {
        modal: {
            backgroundColor: "rgba(0,0,0,0.4)",
            width: "900px",
            height: "800px",
            borderRadius: "12px",
            zIndex: 9,
        } as ModalStyles,
        mobile: {
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 10,
        } as MobileStyles,
    },
    returnUrlAfterRedirection: "http://example",
    baseUrl: "http://localhost:5173/",
} as CashierProperties);

cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data: PaymentEmitEventData) => {
    console.log("✅ PAYMENT_SUCCESS", data);
});

cashier.on(CashierEmitEvent.PAYMENT_FAILED, (data) => {
    console.error("❌ PAYMENT_FAILED", data);
});

cashier.on(CashierEmitEvent.PAYMENT_PENDING, (data) => {
    console.log("⏳ PAYMENT_PENDING", data);
});

cashier.on(CashierEmitEvent.PAYMENT_CANCELED, (data) => {
    console.warn("⚠️ PAYMENT_CANCELED", data);
});

// Fires once per unique transactionId for SUCCESS and FAILED only.
// Deduplication and filtering handled by the tracking bridge.
cashier.on(CashierEmitEvent.ANALYTICS_EVENT, (data: PaymentEmitEventData) => {
    console.log("🎯 ANALYTICS_EVENT (deduplicated)", data);

    // In real merchant code:
    // gtag('event', data.status === 'SUCCESS' ? 'purchase' : 'payment_failed', {
    //   transaction_id: data.transactionId,
    //   currency: data.currency,
    // });
});

document.getElementById("btn-open")?.addEventListener("click", () => {
    cashier.open({ sessionId: SESSION_ID });
});

document.getElementById("btn-close")?.addEventListener("click", () => {
    cashier.close();
});

document.getElementById("btn-destroy")?.addEventListener("click", () => {
    cashier.destroy();
});


function sendToBridge(type: string): void {
    const bridge = document.getElementById("omno-tracking-bridge") as HTMLIFrameElement | null;

    if (!bridge?.contentWindow) {
        console.warn("Bridge iframe not found — open cashier first");
        return;
    }

    lastTxId = `txId_${Math.random().toString(36).substr(2, 8)}`;

    const payload = {
        type,
        data: {
            transactionId: lastTxId,
            status: type,
            currency: "USD",
        } satisfies Pick<PaymentEmitEventData, "transactionId" | "status" | "currency">,
    };

    bridge.contentWindow.postMessage(payload, "*");
    console.log(`→ Sent to bridge: ${type} | txId: ${lastTxId}`);
}

document.getElementById("btn-success")?.addEventListener("click", () => {
    sendToBridge("PAYMENT_SUCCESS");
});

document.getElementById("btn-failed")?.addEventListener("click", () => {
    sendToBridge("PAYMENT_FAILED");
});

document.getElementById("btn-duplicate")?.addEventListener("click", () => {
    const bridge = document.getElementById("omno-tracking-bridge") as HTMLIFrameElement | null;

    if (!bridge?.contentWindow) {
        console.warn("Bridge iframe not found");
        return;
    }

    if (!lastTxId) {
        console.warn("Send a normal event first to get a txId to duplicate");
        return;
    }

    bridge.contentWindow.postMessage({
        type: "PAYMENT_SUCCESS",
        data: {
            transactionId: lastTxId,
            status: "PAYMENT_SUCCESS",
            currency: "USD",
        } satisfies Pick<PaymentEmitEventData, "transactionId" | "status" | "currency">,
    }, "*");

    console.warn(`→ Sent DUPLICATE | txId: ${lastTxId} — ANALYTICS_EVENT should NOT fire`);
});