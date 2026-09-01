import { CashierError, CashierErrorCode } from "../util/cashier-error";

export function mountInContainerWithId(url: string, containerId: string): HTMLIFrameElement {
  const target = document.getElementById(containerId);
  if (!target) {
    throw new CashierError(
      CashierErrorCode.CONTAINER_NOT_FOUND,
      `Container with id="${containerId}" not found`
    );
  }

  // Clear existing content
  target.innerHTML = "";

  const iframe = document.createElement("iframe");
  iframe.allow = "payment; clipboard-read; clipboard-write";
  iframe.src = url;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  target.appendChild(iframe);

  return iframe;
}

export function mountHiddenIframe(url: string): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");
  iframe.style.cssText =
    "display:none;width:0;height:0;border:none;position:absolute;pointer-events:none;";
  document.body.appendChild(iframe);
  return iframe;
}
