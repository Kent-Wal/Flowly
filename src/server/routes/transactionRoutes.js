import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const router = express.Router();

// GET /transactions
// Returns recent transactions for the authenticated user
router.get('/', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace(/^Bearer\s+/i, '').trim();
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { account: { userId: payload.id } },
      include: { account: true },
      orderBy: { date: 'desc' },
      take: 500,
    });

    return res.status(200).json({ transactions });
  } catch (err) {
    console.error('/transactions error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

    // PATCH /transactions/:id - update fields like category (auth + ownership check)
    router.patch('/:id', async (req, res) => {
      try {
        const auth = req.headers.authorization || '';
        const token = auth.replace(/^Bearer\s+/i, '').trim();
        if (!token) return res.status(401).json({ error: 'Missing auth token' });

        let payload;
        try {
          payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        const txId = Number(req.params.id);
        if (!Number.isFinite(txId)) return res.status(400).json({ error: 'Invalid transaction id' });

        const existing = await prisma.transaction.findUnique({ where: { id: txId }, include: { account: true } });
        if (!existing) return res.status(404).json({ error: 'Transaction not found' });
        if (existing.account.userId !== payload.id) return res.status(403).json({ error: 'Forbidden' });

        const { category } = req.body;
        const updated = await prisma.transaction.update({ where: { id: txId }, data: { category: category ?? null, updatedAt: new Date() }, include: { account: true } });

        return res.status(200).json({ transaction: updated });
      } catch (err) {
        console.error('/transactions/:id PATCH error', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    });

export default router;
