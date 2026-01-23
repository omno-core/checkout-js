class SkeletonLine extends HTMLElement {
  static get observedAttributes() {
    return ["w", "h", "r", "bg", "o"];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          width: var(--w, 100%);
        }
        .line {
          width: var(--w, 100%);
          height: var(--h, 12px);
          border-radius: var(--r, 8px);
          background: var(--bg, rgba(255,255,255,0.05));
          opacity: var(--o, 1);
          position: relative;
          overflow: hidden;
        }
        .line::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.12),
            transparent
          );
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer {
          to { transform: translateX(100%); }
        }
      </style>
      <div class="line"></div>
    `;

    this._sync();
  }

  attributeChangedCallback() {
    this._sync();
  }

  _sync() {
    this.style.setProperty("--w", this.getAttribute("w") || "100%");
    this.style.setProperty("--h", this.getAttribute("h") || "12px");
    this.style.setProperty("--r", this.getAttribute("r") || "8px");
    this.style.setProperty("--bg", this.getAttribute("bg") || "rgba(255,255,255,0.05)");
    this.style.setProperty("--o", this.getAttribute("o") || "1");
  }
}

customElements.define("skeleton-line", SkeletonLine);
