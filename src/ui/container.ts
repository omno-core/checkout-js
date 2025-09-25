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
  iframe.src = url;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";

  target.appendChild(iframe);

  return iframe;
}
