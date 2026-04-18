import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { Navbar } from './components';
import { transformToFinancialProduct } from './utils/finance';
import './styles/global.css';

import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import UserProfile from './pages/UserProfile';
import Portfolio from './pages/Portfolio';
import Recommendations from './pages/Recommendations';
import NotFound from './pages/NotFound';

/**
 * Static fallback dataset — used immediately on mount.
 * If the Fake Store API is reachable, its transformed products REPLACE these.
 * This ensures the app is never stuck on a loading spinner.
 */
const FALLBACK_PRODUCTS = [
  { id: 1,  name: 'High-Yield Savings Account',      category: 'savings',    description: 'A premium savings account with competitive interest rates and full government deposit protection. Ideal for building an emergency fund or short-term savings goals with guaranteed capital safety.', minInvestment: 10000,  riskLevel: 'low',    expectedReturn: 5.5,  liquidity: 'easy',     timeHorizon: 'short',  icon: '🏦', image: '' },
  { id: 2,  name: 'Equity Growth Mutual Fund',        category: 'investment', description: 'A diversified equity fund investing in blue-chip Pakistani stocks across multiple sectors. Managed by experienced fund managers with a strong 10-year track record and transparent fee structure.',  minInvestment: 50000,  riskLevel: 'medium', expectedReturn: 11.8, liquidity: 'moderate', timeHorizon: 'medium', icon: '📈', image: '' },
  { id: 3,  name: 'Bitcoin Direct Investment',        category: 'crypto',     description: 'Direct exposure to Bitcoin, the largest cryptocurrency by market cap. High volatility with significant upside potential. Suitable only for risk-tolerant investors with a long-term conviction.', minInvestment: 5000,   riskLevel: 'high',   expectedReturn: 25.0, liquidity: 'easy',     timeHorizon: 'long',   icon: '₿',  image: '' },
  { id: 4,  name: 'Term Life Insurance Plan',         category: 'insurance',  description: 'Comprehensive life coverage with an investment component. Provides family protection while building long-term wealth through managed government-backed funds. Premiums are locked for the term.', minInvestment: 20000,  riskLevel: 'low',    expectedReturn: 6.5,  liquidity: 'locked',   timeHorizon: 'long',   icon: '🛡️', image: '' },
  { id: 5,  name: 'Money Market Fund',                category: 'savings',    description: 'Low-risk fund investing in government T-Bills and short-term bank deposits. Ideal for parking surplus cash with better returns than a standard savings account while maintaining full liquidity.',  minInvestment: 5000,   riskLevel: 'low',    expectedReturn: 4.2,  liquidity: 'easy',     timeHorizon: 'short',  icon: '🏦', image: '' },
  { id: 6,  name: 'Ethereum Investment Pool',         category: 'crypto',     description: 'A pooled Ethereum investment offering exposure to the second-largest cryptocurrency with smart contract utility. Suitable for investors who believe in decentralised finance long-term.',        minInvestment: 3000,   riskLevel: 'high',   expectedReturn: 22.5, liquidity: 'easy',     timeHorizon: 'long',   icon: '₿',  image: '' },
  { id: 7,  name: 'Balanced Allocation Fund',         category: 'investment', description: 'A 60/40 blend of equities and fixed income instruments. Offers moderate growth with meaningful downside protection. Suitable for medium-term investors who want growth without full equity risk.', minInvestment: 25000,  riskLevel: 'medium', expectedReturn: 9.3,  liquidity: 'moderate', timeHorizon: 'medium', icon: '📈', image: '' },
  { id: 8,  name: 'Health & Life Bundle Plan',        category: 'insurance',  description: 'Combined health and life insurance with a savings wrapper. Monthly premiums are invested in government securities for stable, predictable returns while maintaining comprehensive coverage.', minInvestment: 15000,  riskLevel: 'low',    expectedReturn: 5.8,  liquidity: 'locked',   timeHorizon: 'long',   icon: '🛡️', image: '' },
  { id: 9,  name: 'Small-Cap Growth Fund',            category: 'investment', description: 'High-growth potential through investments in emerging Pakistani companies across tech and manufacturing sectors. Greater volatility is offset by significant upside potential over the long run.',  minInvestment: 30000,  riskLevel: 'high',   expectedReturn: 18.4, liquidity: 'moderate', timeHorizon: 'long',   icon: '📈', image: '' },
  { id: 10, name: 'National Savings Certificate',     category: 'savings',    description: 'Government-backed savings certificate with guaranteed returns and sovereign-level security. One of the safest investment vehicles available in Pakistan, issued by the National Savings Centre.', minInvestment: 1000,   riskLevel: 'low',    expectedReturn: 6.1,  liquidity: 'locked',   timeHorizon: 'medium', icon: '🏦', image: '' },
  { id: 11, name: 'DeFi Yield Product',               category: 'crypto',     description: 'Access decentralised finance yields through a managed DeFi basket. Exposure to lending protocols and liquidity pools. High risk with high potential reward for experienced, tech-savvy investors.',  minInvestment: 10000,  riskLevel: 'high',   expectedReturn: 28.7, liquidity: 'moderate', timeHorizon: 'long',   icon: '₿',  image: '' },
  { id: 12, name: 'Retirement Annuity Plan',          category: 'insurance',  description: 'A retirement-focused insurance product with monthly annuity payouts and life coverage. Designed for long-term income security in retirement with consistent, low-volatility returns.',           minInvestment: 100000, riskLevel: 'low',    expectedReturn: 7.2,  liquidity: 'locked',   timeHorizon: 'long',   icon: '🛡️', image: '' },
  { id: 13, name: 'Dividend Income Fund',             category: 'investment', description: 'A fund focused on high-dividend-yielding stocks from mature Pakistani corporations. Provides regular income through quarterly dividend distributions alongside moderate capital appreciation.',    minInvestment: 20000,  riskLevel: 'medium', expectedReturn: 10.5, liquidity: 'moderate', timeHorizon: 'medium', icon: '📈', image: '' },
  { id: 14, name: 'Premium Savings Plus',             category: 'savings',    description: 'An upgraded savings account tier offering higher interest rates for maintaining a minimum balance. Includes bonus interest tiers and free digital banking tools for active account management.',    minInvestment: 50000,  riskLevel: 'low',    expectedReturn: 6.8,  liquidity: 'easy',     timeHorizon: 'short',  icon: '🏦', image: '' },
  { id: 15, name: 'Alt-Coin Basket',                  category: 'crypto',     description: 'A diversified basket of established alternative cryptocurrencies excluding Bitcoin. Spread across 10 coins weighted by market cap. High volatility, but diversification reduces single-coin risk.', minInvestment: 8000,   riskLevel: 'high',   expectedReturn: 20.1, liquidity: 'easy',     timeHorizon: 'long',   icon: '₿',  image: '' },
  { id: 16, name: 'Child Education Plan',             category: 'insurance',  description: 'A long-term savings-linked insurance plan designed to fund a child\'s education. Premiums accumulate in a protected fund with a guaranteed payout upon policy maturity regardless of circumstances.',   minInvestment: 12000,  riskLevel: 'low',    expectedReturn: 6.0,  liquidity: 'locked',   timeHorizon: 'long',   icon: '🛡️', image: '' },
  { id: 17, name: 'Technology Sector Fund',           category: 'investment', description: 'Concentrated exposure to Pakistan\'s growing technology sector including IT services, fintech, and e-commerce companies. Higher concentration risk offset by sector growth potential.',               minInvestment: 35000,  riskLevel: 'high',   expectedReturn: 17.6, liquidity: 'moderate', timeHorizon: 'long',   icon: '📈', image: '' },
  { id: 18, name: 'Govt. Treasury Bills Fund',        category: 'savings',    description: 'A fund investing exclusively in short-duration Pakistani government treasury bills. Offers the safety of sovereign debt with slightly better yields than standard savings accounts.',               minInvestment: 25000,  riskLevel: 'low',    expectedReturn: 5.0,  liquidity: 'moderate', timeHorizon: 'short',  icon: '🏦', image: '' },
  { id: 19, name: 'Real Estate Income Fund',          category: 'investment', description: 'Indirect real estate exposure through a REIT-style structure investing in commercial properties across Karachi, Lahore, and Islamabad. Provides rental income and moderate capital appreciation.',    minInvestment: 75000,  riskLevel: 'medium', expectedReturn: 12.2, liquidity: 'moderate', timeHorizon: 'long',   icon: '📈', image: '' },
  { id: 20, name: 'Whole Life Insurance',             category: 'insurance',  description: 'Permanent life insurance with a cash value component that grows over time. Premiums remain fixed, coverage is lifelong, and the accumulated cash value can be borrowed against if needed.',          minInvestment: 30000,  riskLevel: 'low',    expectedReturn: 5.2,  liquidity: 'locked',   timeHorizon: 'long',   icon: '🛡️', image: '' },
];

function AppInner() {
  // Initialise with fallback immediately — no blank loading state
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [apiNote, setApiNote] = useState(false);

  useEffect(() => {
    /**
     * Try to fetch live data from the Fake Store API.
     * If it succeeds, replace fallback products with transformed live data.
     * If it fails or times out (5s), keep the fallback silently.
     */
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch('https://fakestoreapi.com/products', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('non-2xx');
        return res.json();
      })
      .then(data => {
        const transformed = data.map(transformToFinancialProduct);
        setProducts(transformed);
      })
      .catch(() => {
        // Keep fallback, show subtle note
        setApiNote(true);
      })
      .finally(() => clearTimeout(timeout));

    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"            element={<Home            products={products} loading={loading} />} />
        <Route path="/products"    element={<ProductListing  products={products} loading={loading} />} />
        <Route path="/product/:id" element={<ProductDetail   products={products} />} />
        <Route path="/profile"     element={<UserProfile     products={products} />} />
        <Route path="/portfolio"   element={<Portfolio />} />
        <Route path="/recommendations" element={<Recommendations products={products} />} />
        <Route path="*"            element={<NotFound />} />
      </Routes>
      {apiNote && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16,
          background: 'var(--ink)', color: 'white',
          padding: '8px 14px', fontFamily: 'var(--mono)',
          fontSize: '0.72rem', letterSpacing: '0.05em',
          borderLeft: '3px solid var(--blue)', zIndex: 9999,
        }}>
          // using_static_dataset — api unreachable
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProfileProvider>
        <PortfolioProvider>
          <AppInner />
        </PortfolioProvider>
      </UserProfileProvider>
    </BrowserRouter>
  );
}
