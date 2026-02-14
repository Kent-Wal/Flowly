import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const router = express.Router();

// DELETE /accounts/:id - unlink an account (and its transactions)
router.delete('/:id', async (req, res) => {
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

    const accountId = Number(req.params.id);
    if (!Number.isFinite(accountId)) return res.status(400).json({ error: 'Invalid account id' });

    // Ensure the account belongs to the requesting user
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    if (account.userId !== payload.id) return res.status(403).json({ error: 'Forbidden' });

    // Delete transactions for account, then delete the account record
    await prisma.transaction.deleteMany({ where: { accountId } });
    await prisma.account.delete({ where: { id: accountId } });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('/accounts/:id DELETE error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
