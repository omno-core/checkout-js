export { default as CashierSDK } from './lib/CashierSDK';

export type {
    CustomerBilling,
    Customer,
    ReturnUrls,
    Webhook,
    PayInTransactionData,
    CashierConfig,
    PayInResponse
} from './lib/CashierSDK';

import CashierSDK from './lib/CashierSDK';
export default CashierSDK;