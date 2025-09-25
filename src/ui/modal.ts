import type { ModalStyles } from "../sdk/types";

export function mountModal(url: string, styles: ModalStyles = {}): HTMLDivElement {
  const {
    backgroundColor = "rgba(0,0,0,0.5)",
    width = "80%",
    height = "60%",
    borderRadius = "8px",
    zIndex = 9999,
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
  iframe.src = url;
  iframe.style.cssText = "width: 100%; height: 100%; border: none;";

  modal.appendChild(iframe);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return overlay;
}
