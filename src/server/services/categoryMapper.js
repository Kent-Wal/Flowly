// Simple Plaid category -> application category mapper
// This file contains heuristic rules to map Plaid top-level categories
// and category hierarchy items to the app's normalized category names.

export function mapPlaidCategory({ topCategory, categoryHierarchy, merchantName, plaidCategoryId }) {
  const cat = (topCategory || '').toLowerCase();
  const hierarchy = Array.isArray(categoryHierarchy) ? categoryHierarchy.map(c => (c||'').toLowerCase()) : [];
  const merchant = (merchantName || '').toLowerCase();

  // exact/hierarchy rules
  if (hierarchy.includes('transportation') || hierarchy.includes('travel')) return 'Transportation';
  if (hierarchy.includes('food and drink') || hierarchy.includes('restaurants') || hierarchy.includes('food')) return 'Dining';
  if (hierarchy.includes('groceries') || merchant.includes('grocery') || merchant.includes('whole foods') || merchant.includes('safeway')) return 'Groceries';
  if (hierarchy.includes('housing') || cat.includes('rent') || cat.includes('mortgage')) return 'Housing';
  if (hierarchy.includes('shopping') || cat.includes('retail') || cat.includes('shopping')) return 'Shopping';
  if (hierarchy.includes('utilities') || cat.includes('utilities')) return 'Utilities';
  if (hierarchy.includes('personal') || hierarchy.includes('health and fitness') || cat.includes('health')) return 'Health';
  if (hierarchy.includes('entertainment') || cat.includes('entertainment')) return 'Entertainment';
  if (hierarchy.includes('travel') || cat.includes('travel')) return 'Travel';
  if (hierarchy.includes('services') || cat.includes('service')) return 'Services';
  if (hierarchy.includes('transfer') || cat.includes('transfer')) return 'Transfer';

  // merchant-based heuristics
  if (merchant.includes('uber') || merchant.includes('lyft') || merchant.includes('taxi') || merchant.includes('uber eats')) return 'Transportation';
  if (merchant.includes('airbnb') || merchant.includes('delta') || merchant.includes('united') || merchant.includes('hotel')) return 'Travel';
  if (merchant.includes('shell') || merchant.includes('exxon') || merchant.includes('chevron') || merchant.includes('bp ')) return 'Transportation';

  // Plaid category id common mappings (example ids) — expand as needed
  const plaidCategoryMap = {
    '13005000': 'Groceries', // example Plaid category id for groceries
    '22005000': 'Transportation'
  };
  if (plaidCategoryId && plaidCategoryMap[plaidCategoryId]) return plaidCategoryMap[plaidCategoryId];

  // fallback: normalize topCategory a bit
  if (cat.includes('food') || cat.includes('restaurant')) return 'Dining';
  if (cat.includes('grocery')) return 'Groceries';
  if (cat.includes('transport') || cat.includes('taxi')) return 'Transportation';

  return null; // leave unset if we don't have a confident mapping
}

export default mapPlaidCategory;
