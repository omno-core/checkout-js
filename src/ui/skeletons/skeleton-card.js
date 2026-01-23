class SkeletonCard extends HTMLElement {
  static get observedAttributes() {
    return ["w", "h", "r", "bg"];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .card {
          width: var(--w, 100%);
          height: var(--h, 56px);
          background: var(--bg, rgba(255,255,255,0.05));
          border-radius: var(--r, 12px);
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          padding: 8px;
          box-sizing: border-box;
        }
      </style>

      <div class="card">
        <skeleton-line w="16px" h="16px" r="50%"></skeleton-line>
        <skeleton-line w="36px" h="6px"></skeleton-line>
      </div>
    `;

    this._sync();
  }

  attributeChangedCallback() {
    this._sync();
  }

  _sync() {
    this.style.setProperty("--w", this.getAttribute("w") || "100%");
    this.style.setProperty("--h", this.getAttribute("h") || "56px");
    this.style.setProperty("--r", this.getAttribute("r") || "12px");
    this.style.setProperty("--bg", this.getAttribute("bg") || "rgba(255,255,255,0.05)");
  }
}

customElements.define("skeleton-card", SkeletonCard);
