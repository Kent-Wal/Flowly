import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});
const client = new PlaidApi(config);
// Basic runtime checks to help during development
if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
  console.warn('PLAID_CLIENT_ID or PLAID_SECRET not set — Plaid API calls will fail. Set these in your environment (.env) for full functionality.');
}

export default client;