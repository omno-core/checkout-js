export const ENV_CONFIG = {
  sandbox: {
    checkoutBase: "https://checkout.omno.dev/payments-v2/cashier",
  },
  production: {
    checkoutBase: "https://checkout.omno.com/payments-v2/cashier",
  },
} as const;
