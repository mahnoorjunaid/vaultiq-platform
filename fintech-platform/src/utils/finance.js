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

// Financial product names by category (deterministic lookup by id)
const financialNames = {
  savings:    ['High-Yield Savings Account','Money Market Fund','Premium Savings Plus','Govt. Treasury Bills Fund','National Savings Certificate','Liquid Savings Plan','Fixed Deposit Scheme','Capital Protection Fund'],
  investment: ['Equity Growth Mutual Fund','Balanced Allocation Fund','Dividend Income Fund','Small-Cap Growth Fund','Technology Sector Fund','Real Estate Income Fund','Blue-Chip Stock Fund','Index Tracker Fund'],
  insurance:  ['Term Life Insurance Plan','Health & Life Bundle Plan','Retirement Annuity Plan','Child Education Plan','Whole Life Insurance','Critical Illness Cover','Endowment Policy','Family Takaful Plan'],
  crypto:     ['Bitcoin Direct Investment','Ethereum Investment Pool','DeFi Yield Product','Alt-Coin Basket','Crypto Index Fund','Stablecoin Yield Account','Web3 Growth Fund','Metaverse Asset Pool'],
};

const financialDescriptions = {
  savings: [
    'A government-backed savings account offering competitive interest rates with full deposit protection. Ideal for emergency funds and short-term goals with guaranteed capital safety.',
    'Low-risk fund investing in government T-Bills and short-term bank deposits. Park surplus cash with better returns than a standard account while maintaining full liquidity.',
    'An upgraded savings tier offering higher interest rates for maintaining a minimum balance. Includes bonus interest tiers and free digital banking tools.',
    'A fund investing exclusively in short-duration Pakistani government treasury bills. Offers sovereign debt safety with slightly better yields than standard savings.',
    'Government-backed savings certificate with guaranteed returns and sovereign-level security. One of the safest investment vehicles available, issued by the National Savings Centre.',
    'Flexible savings plan with tiered interest rates and instant withdrawal capability. Suitable for building an emergency fund with no lock-in period.',
    'Fixed-term deposit offering above-market rates in exchange for a committed lock-in period. Capital is fully protected with guaranteed maturity payout.',
    'A capital-protection fund investing in sovereign instruments. Guarantees return of principal with modest growth, ideal for risk-averse investors.',
  ],
  investment: [
    'A diversified equity fund investing in blue-chip Pakistani stocks across multiple sectors. Managed by experienced fund managers with a strong track record and transparent fee structure.',
    'A 60/40 blend of equities and fixed income instruments. Offers moderate growth with meaningful downside protection for medium-term investors.',
    'A fund focused on high-dividend-yielding stocks from mature Pakistani corporations. Provides regular quarterly income alongside moderate capital appreciation.',
    'High-growth potential through investments in emerging Pakistani companies across tech and manufacturing. Greater volatility offset by significant upside over the long run.',
    'Concentrated exposure to Pakistan\'s growing technology sector including IT services, fintech, and e-commerce. Higher concentration risk offset by sector growth potential.',
    'Indirect real estate exposure through a REIT-style structure investing in commercial properties across major Pakistani cities. Provides rental income and capital appreciation.',
    'Invests in established, large-cap companies with consistent earnings and strong market positions. Lower volatility than broader market funds with reliable long-term returns.',
    'Passively tracks a broad market index to deliver market-rate returns at minimal cost. Ideal for long-term investors seeking diversification without active management fees.',
  ],
  insurance: [
    'Comprehensive life coverage with an investment component. Provides family protection while building long-term wealth through managed government-backed funds.',
    'Combined health and life insurance with a savings wrapper. Monthly premiums are invested in government securities for stable, predictable returns with full coverage.',
    'A retirement-focused insurance product with monthly annuity payouts and life coverage. Designed for long-term income security in retirement.',
    'A long-term savings-linked plan designed to fund a child\'s education. Premiums accumulate in a protected fund with guaranteed payout upon policy maturity.',
    'Permanent life insurance with a cash value component that grows over time. Premiums remain fixed, coverage is lifelong, and cash value can be borrowed against if needed.',
    'Provides a lump-sum payout upon diagnosis of specified critical illnesses. Supplements health insurance to cover lost income and treatment costs.',
    'A traditional endowment policy combining life cover with disciplined long-term savings. Matures at a fixed date with a guaranteed sum assured.',
    'Sharia-compliant family protection plan with a savings element. Contributions are pooled and invested in halal instruments with transparent profit sharing.',
  ],
  crypto: [
    'Direct exposure to Bitcoin, the largest cryptocurrency by market cap. High volatility with significant upside potential, suitable only for risk-tolerant investors with long-term conviction.',
    'A pooled Ethereum investment offering exposure to the second-largest cryptocurrency with smart contract utility. Suitable for investors who believe in decentralised finance long-term.',
    'Access decentralised finance yields through a managed DeFi basket. Exposure to lending protocols and liquidity pools. High risk with high potential reward for experienced investors.',
    'A diversified basket of established alternative cryptocurrencies excluding Bitcoin. Spread across 10 coins weighted by market cap, reducing single-coin risk.',
    'Tracks a broad crypto market index across the top 20 coins by market cap. Provides diversified digital asset exposure without single-asset concentration risk.',
    'Earn yield on stablecoin holdings through vetted DeFi lending protocols. Lower volatility than typical crypto products while still generating above-market returns.',
    'Growth-focused fund targeting early-stage Web3 projects and blockchain infrastructure. Extremely high risk with venture-level upside potential over a 5+ year horizon.',
    'Exposure to metaverse platforms, NFT infrastructure, and virtual economy assets. Speculative but diversified across the emerging digital ownership ecosystem.',
  ],
};


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
    name: financialNames[category][apiProduct.id % financialNames[category].length],
    category,
    description: financialDescriptions[category][apiProduct.id % financialDescriptions[category].length],
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
