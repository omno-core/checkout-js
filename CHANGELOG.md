## v1.0.14

✨ Added

Introduced the returnUrlAfterRedirection option to the CashierSDK constructor.

Allows users to be redirected back to the page where the SDK is embedded after being redirected to an external status or authorization page.

Automatically restores and resumes the same cashier session upon return.

🧠 Behavior

When the cashier is loaded, returnUrlAfterRedirection is associated with the current session.

During external cashier flows, the user is redirected to the external page and then back to the provided returnUrlAfterRedirection.

On page load, the SDK detects the session ID from the URL and automatically reopens the cashier.

The SDK is resumed using the omCashierSessionIdNo query parameter.

🧩 Compatibility

This change is fully backward-compatible.

If returnUrlAfterRedirection is not provided, the SDK behaves exactly as before.