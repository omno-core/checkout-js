import type { MobileStyles } from "../sdk/types";

export function mountMobile(url: string, styles: MobileStyles = {}): HTMLDivElement {
  const { backgroundColor = "#000", zIndex = 9999 } = styles;

  const wrapper = document.createElement("div");
  wrapper.classList.add("cashier-mobile-overlay");
  wrapper.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: ${backgroundColor}; z-index: ${zIndex};
  `;

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.style.cssText = `
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; border: none; background: transparent;
  `;

  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);

  return wrapper;
}
