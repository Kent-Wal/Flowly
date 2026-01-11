import prisma from '../prismaClient.js';
import plaidClient from '../../utils/plaid.js';

export async function syncAccountsForItem({ accessToken, itemId, userId, institutionId = null }) {
    if (!accessToken) throw new Error('accessToken required');
    try {
        const accountsRes = await plaidClient.accountsGet({ access_token: accessToken });
        const accounts = accountsRes?.data?.accounts || [];
        for (const acct of accounts) {
            try {
                const plaidAccountId = acct.account_id;
                const name = acct.name || 'Unknown';
                const officialName = acct.official_name || null;
                const mask = acct.mask || null;
                const institutionIdField = acct.institution_id || institutionId || null;
                const currency = acct.balances?.iso_currency_code || acct.iso_currency_code || null;
                const balanceNum = (acct.balances && (acct.balances.current ?? acct.balances.available ?? 0)) || 0;
                const balanceStr = Number(balanceNum).toFixed(2);

                await prisma.account.upsert({
                    where: { plaidAccountId: String(plaidAccountId) },
                    update: {
                        name,
                        officialName,
                        mask,
                        institutionId: institutionIdField,
                        currency,
                        balance: balanceStr,
                        updatedAt: new Date(),
                        userId,
                        itemId,
                    },
                    create: {
                        plaidAccountId: String(plaidAccountId),
                        name,
                        officialName,
                        mask,
                        institutionId: institutionIdField,
                        currency,
                        balance: balanceStr,
                        userId,
                        itemId,
                    }
                });
            } catch (e) {
                console.warn('syncAccountsForItem: failed to persist account', acct?.account_id, e?.message || e);
            }
        }
        return { synced: accounts.length };
    } catch (e) {
        console.warn('syncAccountsForItem: failed to fetch accounts from Plaid', e?.message || e);
        throw e;
    }
}

export default syncAccountsForItem;
