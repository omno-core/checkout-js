import {CashierMessageType, ModalStyles} from "../sdk/types";
import {DEFAULT_MODAL_STYLES} from "./data";
import loaderHTML from "./modal-loader.html";
import "./skeletons/skeleton-line.js";
import "./skeletons/skeleton-card.js";

export function mountModal(url: string, styles: ModalStyles = {}) {
  const {
    backgroundColor = DEFAULT_MODAL_STYLES.backgroundColor,
    width = DEFAULT_MODAL_STYLES.width,
    height = DEFAULT_MODAL_STYLES.height,
    borderRadius = DEFAULT_MODAL_STYLES.borderRadius,
    zIndex = DEFAULT_MODAL_STYLES.zIndex,
  } = styles;

  const overlay = document.createElement("div");
  overlay.classList.add("cashier-modal-overlay");
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: ${backgroundColor};
    z-index: ${zIndex};
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: ${width};
    height: ${height};
    background: transparent;
    border-radius: ${borderRadius};
    overflow: hidden;
    z-index: ${zIndex + 1};
  `;

  const loader = document.createElement("div");
  loader.style.cssText = "width: 100%; height: 100%; position: absolute; inset: 0";
  loader.innerHTML = loaderHTML;
  const closeBtn = loader.querySelector("[data-cashier-close]");
  loader.addEventListener("click", e => e.stopPropagation());
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.postMessage({ type: CashierMessageType.CLOSE_IFRAME }, "*");
    });
  }

  const iframe = document.createElement("iframe");
  iframe.allow = "clipboard-read; clipboard-write";
  iframe.src = url;
  iframe.style.cssText = "width: 100%; height: 100%; border: none;";

  modal.appendChild(loader);
  modal.appendChild(iframe);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return { overlay, loader, iframe };
}
