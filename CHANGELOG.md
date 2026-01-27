✨ UI Improvements
Built-in Loading State (Skeleton Loader)

The SDK now includes a native loading state.

Before the cashier iframe finishes loading, a skeleton loader UI is rendered automatically.

No configuration is required — this works out of the box.

How it works

Loader is mounted immediately when open() is called

Iframe is mounted behind the loader

When the iframe emits CASHIER_LOADED, the loader is removed

Only the fully loaded cashier UI remains visible

This prevents blank screens, flickering, and layout jumps on slow networks.

Desktop Behavior

Skeleton loader is rendered inside the modal

Matches the final cashier layout

Loader is removed instantly once the cashier is ready

Mobile Behavior

Skeleton loader slides up from the bottom

Matches the mobile drawer layout

Overlay clicks and close actions are handled consistently

🧠 UX Benefits

Improved perceived performance

No iframe flicker during load

No partial or broken UI states

Consistent experience across desktop and mobile

```
open() called
  ↓
Skeleton loader mounted
  ↓
Iframe mounted (hidden behind loader)
  ↓
CASHIER_LOADED received
  ↓
Skeleton loader removed
```
