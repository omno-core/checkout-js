import type { ModalStyles } from "../sdk/types";
import { DEFAULT_MODAL_STYLES } from "./data";

export function mountModal(url: string, styles: ModalStyles = {}): HTMLDivElement {
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
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: ${backgroundColor}; z-index: ${zIndex - 1};
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: ${width}; height: ${height};
    background: transparent; border-radius: ${borderRadius};
    overflow: hidden; z-index: ${zIndex};
  `;

  const iframe = document.createElement("iframe");
  iframe.allow = "clipboard-read; clipboard-write";
  iframe.src = url;
  iframe.style.cssText = "width: 100%; height: 100%; border: none;";

  modal.appendChild(iframe);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return overlay;
}
