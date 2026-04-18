import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components';
import { useUserProfile } from '../context/UserProfileContext';

const CATEGORY_META = {
  savings: { icon: '🏦', name: 'Savings', desc: 'Low risk, guaranteed returns, high liquidity' },
  investment: { icon: '📈', name: 'Investments', desc: 'Pooled funds with growth potential' },
  insurance: { icon: '🛡️', name: 'Insurance', desc: 'Risk protection with investment wrapper' },
  crypto: { icon: '₿', name: 'Crypto', desc: 'High volatility digital assets' },
};

export default function Home({ products, loading }) {
  const { isProfileComplete } = useUserProfile();
  const [activeCategory, setActiveCategory] = useState(null);

  // Featured: top performer per category
  const featured = (() => {
    if (!products.length) return [];
    return Object.keys(CATEGORY_META).map(cat => {
      const group = products.filter(p => p.category === cat);
      return group.length ? group.reduce((best, p) => p.expectedReturn > best.expectedReturn ? p : best) : null;
    }).filter(Boolean);
  })();

  const displayProducts = activeCategory ? featured.filter(p => p.category === activeCategory) : featured;
  const catCounts = {};
  products.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });

  return (
    <div className="page-fade-in">
      {/* Masthead — editorial grid */}
      <div style={{ borderBottom: 'var(--border)', background: 'var(--white)' }}>
        <div className="home-masthead">
          <div className="masthead-left">
            <div className="masthead-eyebrow">Pakistan's Intelligent FinTech Platform</div>
            <h1 className="masthead-title">
              Find the Right<br /><em>Financial Product</em><br />for Your Goals
            </h1>
            <p className="masthead-sub">
              Compare savings accounts, mutual funds, insurance plans, and crypto assets —
              all filtered to match your risk profile and investment capacity.
            </p>
            <div className="masthead-actions">
              {isProfileComplete() ? (
                <Link to="/recommendations" className="btn btn-accent btn-lg">View My Picks →</Link>
              ) : (
                <Link to="/profile" className="btn btn-primary btn-lg">Build Profile →</Link>
              )}
              <Link to="/products" className="btn btn-outline btn-lg" style={{ marginLeft: 0, borderLeft: 'none' }}>
                Browse All
              </Link>
            </div>
          </div>
          <div className="masthead-right">
            {[
              { label: 'Total Products', value: products.length || '—', blue: false },
              { label: 'Asset Categories', value: '4', blue: false },
              { label: 'Return Range', value: '3–30%', blue: true },
              { label: 'Currency', value: 'PKR', blue: false },
            ].map(s => (
              <div key={s.label} className="masthead-stat">
                <span className="mstat-label">{s.label}</span>
                <span className={`mstat-value${s.blue ? ' blue' : ''}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category strip */}
      <div className="section-wrap">
        <div className="section-header">
          <div>
            <div className="section-index">01 — Categories</div>
            <h2 className="section-title">Browse by Asset Class</h2>
          </div>
          <Link to="/products" className="btn btn-ghost btn-sm">All products →</Link>
        </div>
        <div className="category-strip mt-24">
          {Object.entries(CATEGORY_META).map(([cat, meta]) => (
            <div
              key={cat}
              className={`category-tile${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              <span className="cat-icon">{meta.icon}</span>
              <div className="cat-name">{meta.name}</div>
              <div className="cat-count">{catCounts[cat] || 0} products</div>
              <div className="cat-desc">{meta.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured products */}
      <div className="section-wrap" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <div>
            <div className="section-index">02 — Featured</div>
            <h2 className="section-title">
              {activeCategory ? `Top ${CATEGORY_META[activeCategory]?.name}` : 'Top Performer per Category'}
            </h2>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--rule-heavy)' }}>
            {displayProducts.length} products shown
          </span>
        </div>

        {loading ? (
          <div className="loading-screen mt-24">
            <div className="spinner" />
            <div className="loading-text">Fetching market data…</div>
          </div>
        ) : (
          <div className="products-grid-wrap mt-24">
            <div className="products-grid">
              {displayProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* CTA strip */}
      <div className="section-wrap" style={{ paddingTop: 0 }}>
        <div className="cta-banner">
          <div>
            <h2>Get Personalised Recommendations</h2>
            <p>
              Your risk tolerance, investment horizon, and monthly budget determine which products
              you see. The algorithm is transparent — no black boxes.
            </p>
          </div>
          <Link to="/profile" className="btn btn-lg" style={{ background: 'white', color: 'var(--ink)', border: '2px solid white', flexShrink: 0 }}>
            Build My Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
