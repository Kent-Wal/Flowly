import express from 'express';
import prisma from '../prismaClient.js';
import plaidClient from '../../utils/plaid.js';
import syncAccountsForItem from '../services/plaidSync.js';

const router = express.Router();

router.post('/create_link_token', async (req, res) => {
    // If Plaid credentials are missing, provide a development mock response so frontend can be tested.
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(400).json({ error: 'Missing PLAID_CLIENT_ID or PLAID_SECRET environment variables. Set these and restart the server.' });
        }
        // Development fallback: return a mock link token so UI can open a test flow client-side.
        console.warn('PLAID creds missing — returning mock link token for dev testing');
        return res.status(200).json({ link_token: 'mock-link-token-dev-12345' });
    }

    try{
        const userId = req.body.userId || 'user-id-123';
        const response = await plaidClient.linkTokenCreate({
            user: {client_user_id: String(userId)},
            client_name: 'Flowly',
            // 'accounts' is not a valid Plaid product — remove it. Use 'auth' and/or 'transactions' as needed.
            products: ['transactions', 'auth'],
            country_codes: ['CA', 'US'],
            language: 'en'
        });
        res.status(200).json(response.data);
    }
    catch(err){
        console.error('create_link_token error', err);
        // If Plaid SDK returned structured error info, forward it to the client for easier debugging
        if (err?.response?.data) return res.status(err.response.status || 500).json({ error: err.response.data });
        res.status(500).json({error: err.message || 'Failed to create link token'});
    }
});

router.post('/exchange_public_token', async (req, res) => {
    // If Plaid credentials are missing, allow a development mock exchange so frontend can be tested.
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(400).json({ error: 'Missing PLAID_CLIENT_ID or PLAID_SECRET environment variables. Set these and restart the server.' });
        }
        console.warn('PLAID creds missing — returning mock access token for dev testing');
        // Optionally, persist a mock DB record here. For now return a mock token/item.
        return res.status(200).json({ access_token: 'mock-access-token-dev-12345', item_id: 'mock-item-dev-1' });
    }
    try{
        const {public_token, userId} = req.body;
        const exchangeRes = await plaidClient.itemPublicTokenExchange({public_token});
        const access_token = exchangeRes.data.access_token;
        const item_id = exchangeRes.data.item_id;

        // Persist the Plaid item to the DB. The schema stores Items in the `Item` model.
        const userIdNum = Number(userId);
        if (!Number.isFinite(userIdNum) || userIdNum <= 0) {
            // If userId is missing or invalid, return tokens but don't persist.
            console.warn('exchange_public_token: invalid or missing userId, skipping DB persist');
            return res.status(200).json({ access_token, item_id, warning: 'userId missing or invalid; access token not persisted' });
        }

        // Create a new Item record linked to the user. If an Item with the same plaidItemId
        // already exists, update its accessToken instead. Capture the upsert result so we have the internal item id.
        const itemRecord = await prisma.item.upsert({
            where: { plaidItemId: item_id },
            update: { accessToken: access_token, updatedAt: new Date(), userId: userIdNum },
            create: { plaidItemId: item_id, userId: userIdNum, accessToken: access_token }
        });

        // Try to fetch Item + institution details from Plaid and persist them.
        let institutionId = null;
        try {
            const itemRes = await plaidClient.itemGet({ access_token });
            institutionId = itemRes?.data?.item?.institution_id || null;
            if (institutionId) {
                try {
                    const instRes = await plaidClient.institutionsGetById({ institution_id: institutionId, country_codes: ['US'] });
                    const institutionName = instRes?.data?.institution?.name || null;
                    await prisma.item.update({
                        where: { plaidItemId: item_id },
                        data: { institutionId: institutionId, institutionName: institutionName }
                    });
                } catch (e) {
                    console.warn('Failed to fetch institution info from Plaid', e?.message || e);
                }
            }
        } catch (e) {
            console.warn('Failed to call itemGet on Plaid', e?.message || e);
        }

        // Delegate accounts retrieval & persistence to the sync service.
        try {
            await syncAccountsForItem({ accessToken: access_token, itemId: itemRecord.id, userId: userIdNum, institutionId });
        } catch (e) {
            console.warn('Failed to sync accounts for item', item_id, e?.message || e);
        }

        res.status(200).json({ access_token, item_id });
    }
    catch(err){
        console.error('exchange_public_token error', err);
        if (err?.response?.data) return res.status(err.response.status || 500).json({ error: err.response.data });
        res.status(500).json({error: err.message || 'Failed to exchange public token'});
    }
});

export default router;