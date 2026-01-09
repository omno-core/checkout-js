## v1.0.15

### ✨ Added

#### New Event: `KYC_REQUIRED_FIELD_ERRORS`

A new emit event that triggers when required KYC fields are missing or invalid during a payment attempt.

This event allows integrators to:

- Display field-level validation errors
- Guide users to complete required KYC steps
- Redirect users to KYC verification flows
- Implement fully custom KYC UX flows

---

### ⚙️ Cashier Builder Behavior Toggle

A new option has been added to the **Cashier Builder** that allows switching between:

1. **Omno Forms enabled** — Use built-in cashier KYC forms
2. **Omno Forms disabled** — Custom Integration Mode: Disable built-in forms and emit `KYC_REQUIRED_FIELD_ERRORS`
   instead

When **Custom Integration Mode** is enabled, the cashier will:

- Skip its internal KYC UI
- Emit `KYC_REQUIRED_FIELD_ERRORS`
- Let integrators fully control how KYC errors are displayed and resolved

This enables:

- Custom UI implementations
- External KYC flows
- Headless KYC handling
- Embedded compliance experiences

---

### 🔧 Usage

Register the listener:

```ts
cashier.on(CashierEmitEvent.KYC_REQUIRED_FIELD_ERRORS, (data: KYCRequiredFieldErrorsData[]) => {
  console.log("KYC Required Field Errors:", data);
});
