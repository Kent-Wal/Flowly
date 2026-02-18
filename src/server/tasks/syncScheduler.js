import cron from 'node-cron';
import prisma from '../prismaClient.js';
import { syncAccountsForItem, syncTransactionsForItem } from '../services/plaidSync.js';

// configurable via env: SYNC_CRON (cron expression) and SYNC_ENABLED
const CRON_EXPR = process.env.SYNC_CRON || '0 * * * *'; // default: every hour at minute 0
const ENABLED = process.env.SYNC_ENABLED !== 'false';

async function runSyncAll() {
  console.log('syncScheduler: starting runSyncAll');
  try {
    // fetch items and filter those that have access tokens
    const allItems = await prisma.item.findMany();
    const items = allItems.filter(i => i && i.accessToken);

    for (const item of items) {
      try {
        const ctx = { accessToken: item.accessToken, itemId: item.id, userId: item.userId, institutionId: item.institutionId };
        await syncAccountsForItem(ctx);

        await syncTransactionsForItem(ctx);

        // Optionally update lastSyncedAt if item has that field
        try { await prisma.item.update({ where: { id: item.id }, data: { updatedAt: new Date() } }); } catch (_) {}
      } catch (e) {
        console.warn('syncScheduler: error syncing item', item.id, e?.message || e);
      }
    }
  } catch (e) {
    console.error('syncScheduler: fatal error', e?.message || e);
  } finally {
    console.log('syncScheduler: runSyncAll finished');
  }
}

export function startScheduler() {
  if (!ENABLED) {
    console.log('syncScheduler: disabled via SYNC_ENABLED=false');
    return;
  }

  try {
    // run once immediately on startup
    runSyncAll().catch(err => console.warn('syncScheduler: initial run failed', err?.message || err));

    // schedule future runs
    const task = cron.schedule(CRON_EXPR, () => {
      runSyncAll().catch(err => console.warn('syncScheduler: scheduled run failed', err?.message || err));
    }, { scheduled: true });

    console.log(`syncScheduler: scheduled sync with cron "${CRON_EXPR}"`);
    return task;
  } catch (e) {
    console.error('syncScheduler: failed to start', e?.message || e);
  }
}

export default { startScheduler };
