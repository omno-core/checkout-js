import {CashierMessageType, MobileStyles} from "../sdk/types";
import {DEFAULT_MOBILE_STYLES} from "./data";
import loaderHTML from "./mobile-loader.html";
import loaderCSS from "./mobile-loader.css";
import "./skeletons/skeleton-line.js";
import "./skeletons/skeleton-card.js";

export function mountMobile(url: string, styles: MobileStyles = {}) {
  const {
    backgroundColor = DEFAULT_MOBILE_STYLES.backgroundColor,
    zIndex = DEFAULT_MOBILE_STYLES.zIndex
  } = styles;

  const overlay = document.createElement("div");
  overlay.classList.add("cashier-mobile-overlay");
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: ${backgroundColor};
    z-index: ${zIndex};
  `;

  const loader = document.createElement("div");
  loader.style.cssText = `position: absolute; width: 100%; bottom: 0; z-index: ${zIndex + 1};`;

  const shadow = loader.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${loaderCSS}</style>${loaderHTML}`;

  const closeBtn = shadow.querySelector("[data-cashier-close]");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.postMessage({ type: CashierMessageType.CLOSE_IFRAME }, "*");
    });
  }

  const iframe = document.createElement("iframe");
  iframe.allow = "clipboard-read; clipboard-write";
  iframe.src = url;
  iframe.style.cssText = `
    position: absolute; inset: 0; opacity: 0;
    width: 100%; height: 100%; border: none; background: transparent;
  `;

  overlay.appendChild(loader);
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  return { overlay, loader, iframe };
}
