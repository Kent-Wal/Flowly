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

export async function syncTransactionsForItem({ accessToken, itemId, userId, startDate = null, endDate = null }) {
    if (!accessToken) throw new Error('accessToken required');
    // default to last 90 days if dates not provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d; })();
    const start_date = start.toISOString().slice(0, 10);
    const end_date = end.toISOString().slice(0, 10);

    try {
        let offset = 0;
        const pageSize = 100; // Plaid allows fetching in pages via offset/count
        let totalSynced = 0;
        while (true) {
            const txRes = await plaidClient.transactionsGet({
                access_token: accessToken,
                start_date,
                end_date,
                options: { count: pageSize, offset }
            });
            const transactions = txRes?.data?.transactions || [];
            for (const tx of transactions) {
                try {
                    const plaidTransactionId = tx.transaction_id;
                    const plaidAccountId = tx.account_id;

                    // map to internal account.id
                    const accountRecord = await prisma.account.findUnique({ where: { plaidAccountId: String(plaidAccountId) } });
                    if (!accountRecord) {
                        console.warn('syncTransactionsForItem: no local account for plaidAccountId', plaidAccountId, 'skipping transaction', plaidTransactionId);
                        continue;
                    }

                    const merchantName = tx.merchant_name || tx.name || null;
                    const category = Array.isArray(tx.category) ? tx.category.join(' > ') : (tx.category?.[0] ?? null);
                    const isoCurrencyCode = tx.iso_currency_code || null;
                    const pending = Boolean(tx.pending);
                    const amount = tx.amount ?? 0;
                    const date = tx.date;
                    const authorizedDate = tx.authorized_date || null;

                    await prisma.transaction.upsert({
                        where: { plaidTransactionId: String(plaidTransactionId) },
                        update: {
                            accountId: accountRecord.id,
                            amount,
                            pending,
                            merchantName,
                            category,
                            isoCurrencyCode,
                            date: new Date(date),
                            authorizedDate: authorizedDate ? new Date(authorizedDate) : null,
                            updatedAt: new Date(),
                        },
                        create: {
                            accountId: accountRecord.id,
                            plaidTransactionId: String(plaidTransactionId),
                            amount,
                            pending,
                            merchantName,
                            category,
                            isoCurrencyCode,
                            date: new Date(date),
                            authorizedDate: authorizedDate ? new Date(authorizedDate) : null,
                        }
                    });
                    totalSynced++;
                } catch (e) {
                    console.warn('syncTransactionsForItem: failed to persist transaction', tx?.transaction_id, e?.message || e);
                }
            }

            if (transactions.length < pageSize) break; // done
            offset += pageSize;
        }

        return { synced: totalSynced, start_date, end_date };
    } catch (e) {
        console.warn('syncTransactionsForItem: failed to fetch transactions from Plaid', e?.message || e);
        throw e;
    }
}

