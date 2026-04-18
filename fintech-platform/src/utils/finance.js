/**
 * Financial utility functions for the VaultIQ platform.
 * Contains deterministic data transformation, recommendation engine,
 * and portfolio calculation logic.
 */
// ─── DETERMINISTIC HELPERS ──────────────────────────────────────────
/**
 * Generates a seeded pseudo-random number from a string seed.
 * Ensures the SAME product always gets the SAME financial attributes.
 * @param {string|number} seed
 * @returns {number} 0–1 float
 */
// Calculates compound interest
// Formula: A = P(1 + r/n)^(nt)
// P = principal
// r = annual interest rate
// n = times compounded per year
// t = years
// Fixed edge case handling for zero and invalid portfolio values
function seededRandom(seed) {
  const s = String(seed);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(Math.abs(hash)) * 10000;
  return x - Math.floor(x);
}

// ─── API DATA TRANSFORMATION ─────────────────────────────────────────
const categoryMapping = {
  electronics: 'investment',
  jewelery: 'savings',
  "men's clothing": 'insurance',
  "women's clothing": 'crypto',
};
// Calculates simple annual return
export const calculateAnnualReturn = (principal, rate) => {
  return principal * (rate / 100);
};
const riskMapping = {
  investment: 'medium',
  savings: 'low',
  insurance: 'low',
  crypto: 'high',
};
// Safety check to prevent NaN errors in calculations
export const safeNumber = (value) => {
  return value && !isNaN(value) ? Number(value) : 0;
}


// Expected return ranges by risk (realistic FinTech logic)
const returnRanges = {
  low: [3, 7],
  medium: [7, 14],
  high: [14, 30],
};

// Liquidity by category (domain logic: crypto is liquid, insurance locked)
const liquidityMapping = {
  savings: 'easy',
  investment: 'moderate',
  insurance: 'locked',
  crypto: 'easy',
};

// Time horizon by risk level
const horizonMapping = {
  low: 'short',
  medium: 'medium',
  high: 'long',
};

// Product emoji icons by category
const categoryIcons = {
  savings: '🏦',
  investment: '📈',
  insurance: '🛡️',
  crypto: '₿',
};

/**
 * Transforms a raw Fake Store API product into a FinTech financial product.
 * Uses seeded randomness so the same product always maps identically.
 * @param {object} apiProduct
 * @returns {object} Financial product
 */
export function transformToFinancialProduct(apiProduct) {
  const category = categoryMapping[apiProduct.category] ?? 'investment';
  const riskLevel = riskMapping[category];
  const [minR, maxR] = returnRanges[riskLevel];
  // Deterministic: seed on product id so same product = same return
  const rand = seededRandom(apiProduct.id + apiProduct.title);
  const expectedReturn = parseFloat((minR + rand * (maxR - minR)).toFixed(2));
  const minInvestment = Math.round(apiProduct.price * 1000 / 100) * 100; // round to nearest 100 PKR

  return {
    id: apiProduct.id,
    name: apiProduct.title.length > 50
      ? apiProduct.title.substring(0, 50) + '…'
      : apiProduct.title,
    category,
    description: apiProduct.description,
    minInvestment,
    riskLevel,
    expectedReturn,
    liquidity: liquidityMapping[category],
    timeHorizon: horizonMapping[riskLevel],
    icon: categoryIcons[category],
    image: apiProduct.image,
  };
}

// ─── RECOMMENDATION ENGINE ────────────────────────────────────────────
/**
 * Risk tolerance → allowed product risk levels
 */
const riskTolerance = {
  conservative: ['low'],
  moderate: ['low', 'medium'],
  aggressive: ['low', 'medium', 'high'],
};

/**
 * Investment horizon → allowed product time horizons
 */
const horizonTolerance = {
  short: ['short'],
  medium: ['short', 'medium'],
  long: ['short', 'medium', 'long'],
};

/**
 * Liquidity preference → allowed product liquidity levels
 */
const liquidityTolerance = {
  easy: ['easy'],
  moderate: ['easy', 'moderate'],
  locked: ['easy', 'moderate', 'locked'],
};

/**
 * Main recommendation function. Dynamically computes suitable products
 * based on the user's financial profile. No hardcoding.
 * @param {Array} products
 * @param {object} userProfile
 * @returns {Array} Sorted recommended products
 */
export function getRecommendations(products, userProfile) {
  if (!userProfile || !userProfile.riskTolerance) return [];

  const allowedRisk = riskTolerance[userProfile.riskTolerance] ?? ['low'];
  const allowedHorizon = horizonTolerance[userProfile.investmentHorizon] ?? ['short'];
  const allowedLiquidity = liquidityTolerance[userProfile.liquidityPreference] ?? ['easy'];
  const budget = Number(userProfile.monthlyCapacity) || 0;

  const recommended = products.filter(p =>
    allowedRisk.includes(p.riskLevel) &&
    allowedHorizon.includes(p.timeHorizon) &&
    allowedLiquidity.includes(p.liquidity) &&
    p.minInvestment <= budget
  );

  // Conservative users: lowest risk first, then highest return within risk tier
  if (userProfile.riskTolerance === 'conservative') {
    return recommended.sort((a, b) => {
      const riskOrder = { low: 0, medium: 1, high: 2 };
      const diff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      return diff !== 0 ? diff : b.expectedReturn - a.expectedReturn;
    });
  }

  // Moderate: best risk-adjusted return (return / risk multiplier)
  if (userProfile.riskTolerance === 'moderate') {
    const riskPenalty = { low: 1, medium: 1.15, high: 1.4 };
    return recommended.sort((a, b) => {
      const scoreA = a.expectedReturn / riskPenalty[a.riskLevel];
      const scoreB = b.expectedReturn / riskPenalty[b.riskLevel];
      return scoreB - scoreA;
    });
  }

  // Aggressive: highest return first
  return recommended.sort((a, b) => b.expectedReturn - a.expectedReturn);
}

/**
 * Count how many products match a profile (preview without full sort)
 */
export function countMatches(products, userProfile) {
  return getRecommendations(products, userProfile).length;
}

// ─── PORTFOLIO CALCULATIONS ───────────────────────────────────────────
/**
 * Calculates comprehensive portfolio statistics from items list.
 * @param {Array} items - [{product, amount}]
 * @returns {object} Portfolio stats
 */
export function calculatePortfolioStats(items) {
  if (!items || items.length === 0) {
    return {
      totalInvested: 0,
      weightedReturn: 0,
      riskDistribution: { low: 0, medium: 0, high: 0 },
      categoryDistribution: {},
      diversificationScore: 0,
    };
  }

  const totalInvested = items.reduce((sum, item) => sum + Number(item.amount), 0);

  // Weighted expected return = Σ (allocation/total × expectedReturn)
  const weightedReturn = totalInvested > 0
    ? items.reduce((sum, item) => {
        const weight = Number(item.amount) / totalInvested;
        return sum + weight * item.product.expectedReturn;
      }, 0)
    : 0;

  // Risk distribution as percentages
  const riskDistribution = { low: 0, medium: 0, high: 0 };
  if (totalInvested > 0) {
    items.forEach(item => {
      riskDistribution[item.product.riskLevel] += Number(item.amount);
    });
    for (const key in riskDistribution) {
      riskDistribution[key] = parseFloat(
        ((riskDistribution[key] / totalInvested) * 100).toFixed(1)
      );
    }
  }

  // Category distribution
  const categoryDistribution = {};
  items.forEach(item => {
    const cat = item.product.category;
    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + Number(item.amount);
  });

  // Diversification score: based on unique categories + number of items
  const uniqueCategories = Object.keys(categoryDistribution).length;
  const maxConcentration = totalInvested > 0
    ? Math.max(...Object.values(categoryDistribution)) / totalInvested
    : 1;
  const diversificationScore = Math.round(
    (uniqueCategories / 4) * 50 + (1 - maxConcentration) * 50
  );

  return {
    totalInvested,
    weightedReturn: parseFloat(weightedReturn.toFixed(2)),
    riskDistribution,
    categoryDistribution,
    diversificationScore,
  };
}

/**
 * Return projection calculator using compound interest
 * @param {number} principal
 * @param {number} annualReturnPct
 * @param {number} years
 * @returns {number} projected value
 */
export function compoundProjection(principal, annualReturnPct, years) {
  return parseFloat((principal * Math.pow(1 + annualReturnPct / 100, years)).toFixed(2));
}

// ─── DECISION INSIGHT GENERATOR ──────────────────────────────────────
/**
 * Dynamically generates decision insights for a product based on its
 * financial attributes. NOT hardcoded — all strings depend on product data.
 * @param {object} product
 * @returns {string} Multi-sentence insight paragraph
 */
export function generateDecisionInsight(product) {
  const insights = [];

  // Risk-based insight
  if (product.riskLevel === 'low') {
    insights.push(
      'Suitable for conservative investors who prioritise capital preservation over maximum returns.'
    );
  } else if (product.riskLevel === 'medium') {
    insights.push(
      'Designed for moderate-risk investors seeking a balance between growth and stability.'
    );
  } else {
    insights.push(
      'Best suited for aggressive investors comfortable with significant short-term volatility in exchange for higher potential returns.'
    );
  }

  // Liquidity insight
  if (product.liquidity === 'locked') {
    insights.push(
      'Funds are locked for the investment period; early withdrawal may incur penalties, so only invest money you will not need urgently.'
    );
  } else if (product.liquidity === 'moderate') {
    insights.push(
      'Offers partial liquidity — withdrawals are possible but may require notice or incur minor fees.'
    );
  } else {
    insights.push(
      'High liquidity means you can access your funds quickly, making this suitable as an emergency buffer investment.'
    );
  }

  // Time horizon insight
  if (product.timeHorizon === 'long') {
    insights.push(
      'Optimal performance is typically achieved when held for 5+ years, allowing compounding to work in your favour.'
    );
  } else if (product.timeHorizon === 'medium') {
    insights.push(
      'A 3–5 year horizon is recommended to ride out short-term market fluctuations.'
    );
  } else {
    insights.push(
      'Appropriate for short-term goals (1–2 years) given its quick access and stable return profile.'
    );
  }

  // Return context
  if (product.expectedReturn >= 20) {
    insights.push(
      `The ${product.expectedReturn}% expected annual return is above market average, reflecting elevated risk.`
    );
  } else if (product.expectedReturn >= 10) {
    insights.push(
      `At ${product.expectedReturn}% annual return, this product offers competitive performance within its risk category.`
    );
  } else {
    insights.push(
      `The ${product.expectedReturn}% annual return reflects its conservative risk profile, prioritising security over growth.`
    );
  }

  return insights.join(' ');
}

// ─── FILTERING LOGIC ─────────────────────────────────────────────────
/**
 * Filter products with AND logic across all active filters.
 * @param {Array} products
 * @param {object} filters
 * @returns {Array} Filtered products
 */
export function applyFilters(products, filters) {
  return products.filter(product => {
    const {
      riskLevels, minReturn, maxReturn, categories,
      liquidity, timeHorizon, maxMinInvestment,
    } = filters;

    if (riskLevels.length > 0 && !riskLevels.includes(product.riskLevel)) return false;
    if (product.expectedReturn < Number(minReturn)) return false;
    if (maxReturn && product.expectedReturn > Number(maxReturn)) return false;
    if (categories.length > 0 && !categories.includes(product.category)) return false;
    if (liquidity && liquidity !== 'all' && product.liquidity !== liquidity) return false;
    if (timeHorizon && timeHorizon !== 'all' && product.timeHorizon !== timeHorizon) return false;
    if (maxMinInvestment && product.minInvestment > Number(maxMinInvestment)) return false;

    return true;
  });
}

// ─── FORMAT HELPERS ───────────────────────────────────────────────────
export function formatPKR(amount) {
  if (!amount && amount !== 0) return '—';
  return 'PKR ' + Number(amount).toLocaleString('en-PK');
}

export function formatReturn(value) {
  return `${Number(value).toFixed(2)}%`;
}

export const CATEGORY_ICONS = categoryIcons;
