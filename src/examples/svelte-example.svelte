<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import CashierSDK, { CashierEmitEvent, DeviceType } from "@omno-payment/checkout-js";

  const sessionId = "your-session-id-here";
  let cashier: CashierSDK;

  onMount(() => {
    // 1. Initialize SDK
    cashier = new CashierSDK({
      device: DeviceType.MOBILE,
      environment: "sandbox",
      styles: {
        modal: {
          backgroundColor: "rgba(0,0,0,0.4)",
          width: "900px",
          height: "800px",
          borderRadius: "12px",
          zIndex: 9
        },
        mobile: {
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 10
        }
      }
    });

    // 2. Register event listeners
    cashier.on(CashierEmitEvent.PAYMENT_SUCCESS, (data) => {
      console.log("✅ Payment success", data);
    });

    cashier.on(CashierEmitEvent.PAYMENT_FAILED, (data) => {
      console.error("❌ Payment failed", data);
    });

    cashier.on(CashierEmitEvent.IFRAME_CLOSED, () => {
      console.log("Cashier closed");
    });
  });

  onDestroy(() => {
    cashier?.destroy();
  });

  // 3. Actions
  const openModal = () => {
    cashier.open({ sessionId });
  }

  const openInContainer = () => {
    cashier.open({ sessionId, containerId: "your-container-id" });
  }

</script>

<h2>Cashier SDK Demo</h2>

<div class="actions">
  <button onclick={openModal}>Open (Modal)</button>
  <button onclick={openInContainer}>Open in Container</button>
</div>

<!-- Container example -->
<div id="cashier-slot" class="cashier-slot"></div>

<style lang="scss">
  .actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .cashier-slot {
    border: 2px dashed #aaa;
    height: 500px;
    width: 100%;
    position: relative;
  }
</style>
