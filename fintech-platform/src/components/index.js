import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { formatPKR, formatReturn, CATEGORY_ICONS } from '../utils/finance';

export function RiskBadge({ riskLevel }) {
  const dot = riskLevel === 'low' ? '▲' : riskLevel === 'medium' ? '◆' : '●';
  return <span className={`badge badge-${riskLevel}`}>{dot} {riskLevel}</span>;
}

export function CategoryBadge({ category }) {
  return <span className={`badge badge-${category}`}>{CATEGORY_ICONS[category]} {category}</span>;
}

export function ReturnDisplay({ value }) {
  return (
    <span className="stat-val ret">{formatReturn(value)}</span>
  );
}

export function ProductCard({ product }) {
  const { addToPortfolio, isInPortfolio } = usePortfolio();
  const [added, setAdded] = useState(false);
  const inPortfolio = isInPortfolio(product.id);

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addToPortfolio(product, product.minInvestment);
    setAdded(true);
  }

  return (
    <div className="product-card">
      {/* ticker bar */}
      <div className="product-card-ticker">
        <span className="ticker-cat">{product.category.toUpperCase()}</span>
        <span>{formatReturn(product.expectedReturn)} P.A.</span>
      </div>

      {/* icon + hover overlay */}
      <div className="product-card-image">
        <span style={{ position: 'relative', zIndex: 1 }}>{product.icon}</span>
        <div className="product-card-overlay">
          <div className="overlay-label">Expected Return</div>
          <div className="overlay-return">{formatReturn(product.expectedReturn)}</div>
          <div className="overlay-label" style={{ marginTop: 6 }}>Min. {formatPKR(product.minInvestment)}</div>
          <div className="overlay-label">{product.liquidity} liquidity · {product.timeHorizon} horizon</div>
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-card-name">{product.name}</div>
        <RiskBadge riskLevel={product.riskLevel} />

        {/* data table stats */}
        <div className="product-card-stats">
          <div className="stat-cell">
            <div className="stat-lbl">Return</div>
            <div className="stat-val ret">{formatReturn(product.expectedReturn)}</div>
          </div>
          <div className="stat-cell">
            <div className="stat-lbl">Horizon</div>
            <div className="stat-val">{product.timeHorizon}</div>
          </div>
          <div className="stat-cell">
            <div className="stat-lbl">Liquidity</div>
            <div className="stat-val">{product.liquidity}</div>
          </div>
          <div className="stat-cell">
            <div className="stat-lbl">Min. Invest</div>
            <div className="stat-val" style={{ fontSize: '0.75rem' }}>{formatPKR(product.minInvestment)}</div>
          </div>
        </div>
      </div>

      <div className="product-card-footer">
        <Link to={`/product/${product.id}`} className="btn btn-outline btn-sm">
          Details →
        </Link>
        {inPortfolio || added ? (
          <button className="btn btn-sm btn-added" disabled>✓ Added</button>
        ) : (
          <button className="btn btn-accent btn-sm" onClick={handleAdd}>+ Portfolio</button>
        )}
      </div>
    </div>
  );
}

export function PortfolioItem({ item, onRemove, onUpdateAmount }) {
  const { product, amount } = item;
  const projected = (amount * (1 + product.expectedReturn / 100)).toFixed(0);
  return (
    <div className="portfolio-item-card">
      <div className="portfolio-item-icon">{product.icon}</div>
      <div className="portfolio-item-info">
        <div className="portfolio-item-name">{product.name}</div>
        <div className="portfolio-item-meta">
          <CategoryBadge category={product.category} />
          <RiskBadge riskLevel={product.riskLevel} />
        </div>
      </div>
      <div className="portfolio-item-amount">
        <input
          type="number"
          value={amount}
          min={product.minInvestment}
          step={1000}
          onChange={e => onUpdateAmount(product.id, e.target.value)}
        />
        <div className="portfolio-item-return">1yr → {formatPKR(projected)}</div>
      </div>
      <button className="btn btn-danger btn-sm" onClick={() => onRemove(product.id)}>Remove</button>
    </div>
  );
}

export function PortfolioSummary({ portfolio }) {
  const { stats } = portfolio;
  return (
    <div className="portfolio-summary-grid">
      <div className="summary-stat-card">
        <div className="summary-stat-label">Total Invested</div>
        <div className="summary-stat-value">{formatPKR(stats.totalInvested)}</div>
        <div className="summary-stat-sub">{portfolio.items.length} holdings</div>
      </div>
      <div className="summary-stat-card">
        <div className="summary-stat-label">Weighted Return</div>
        <div className="summary-stat-value" style={{ color: 'var(--risk-low)' }}>{formatReturn(stats.weightedReturn)}</div>
        <div className="summary-stat-sub">blended annual p.a.</div>
      </div>
      <div className="summary-stat-card">
        <div className="summary-stat-label">Risk Distribution</div>
        <div style={{ marginTop: 10 }}>
          <div className="risk-distribution">
            {stats.riskDistribution.low > 0 && <div className="risk-dist-bar risk-dist-low" style={{ width: `${stats.riskDistribution.low}%` }} />}
            {stats.riskDistribution.medium > 0 && <div className="risk-dist-bar risk-dist-medium" style={{ width: `${stats.riskDistribution.medium}%` }} />}
            {stats.riskDistribution.high > 0 && <div className="risk-dist-bar risk-dist-high" style={{ width: `${stats.riskDistribution.high}%` }} />}
          </div>
          <div className="risk-dist-legend">
            <span><span className="legend-dot" style={{ background: 'var(--risk-low)' }} />Low {stats.riskDistribution.low}%</span>
            <span><span className="legend-dot" style={{ background: 'var(--risk-medium)' }} />Med {stats.riskDistribution.medium}%</span>
            <span><span className="legend-dot" style={{ background: 'var(--risk-high)' }} />High {stats.riskDistribution.high}%</span>
          </div>
        </div>
      </div>
      <div className="summary-stat-card">
        <div className="summary-stat-label">Diversification</div>
        <div className="summary-stat-value">{stats.diversificationScore}<span style={{ fontSize: '1rem', color: 'var(--rule-heavy)' }}>/100</span></div>
        <div className="summary-stat-sub">{stats.diversificationScore >= 70 ? '▲ Well diversified' : stats.diversificationScore >= 40 ? '◆ Moderate' : '● Concentrated'}</div>
      </div>
    </div>
  );
}

export function FilterPanel({ filters, onFilterChange, productCount }) {
  function toggle(field, value) {
    const arr = filters[field];
    onFilterChange(field, arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  }

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3>// filters</h3>
        <span className="product-count-chip">{productCount}</span>
      </div>

      <div className="filter-group">
        <label>Risk Level</label>
        <div className="filter-checkboxes">
          {['low', 'medium', 'high'].map(r => (
            <label key={r} className="checkbox-item">
              <input type="checkbox" checked={filters.riskLevels.includes(r)} onChange={() => toggle('riskLevels', r)} />
              <RiskBadge riskLevel={r} />
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Category</label>
        <div className="filter-checkboxes">
          {['savings', 'investment', 'insurance', 'crypto'].map(c => (
            <label key={c} className="checkbox-item">
              <input type="checkbox" checked={filters.categories.includes(c)} onChange={() => toggle('categories', c)} />
              {CATEGORY_ICONS[c]} {c}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Return Range (%)</label>
        <div className="range-inputs">
          <input type="number" placeholder="Min" value={filters.minReturn} min={0} onChange={e => onFilterChange('minReturn', e.target.value)} />
          <span className="range-sep">–</span>
          <input type="number" placeholder="Max" value={filters.maxReturn} min={0} onChange={e => onFilterChange('maxReturn', e.target.value)} />
        </div>
      </div>

      <div className="filter-group">
        <label>Liquidity</label>
        <select className="filter-select" value={filters.liquidity} onChange={e => onFilterChange('liquidity', e.target.value)}>
          <option value="all">All</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="locked">Locked</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Time Horizon</label>
        <select className="filter-select" value={filters.timeHorizon} onChange={e => onFilterChange('timeHorizon', e.target.value)}>
          <option value="all">All</option>
          <option value="short">Short (1–2 yr)</option>
          <option value="medium">Medium (3–5 yr)</option>
          <option value="long">Long (5+ yr)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Max Min. Investment (PKR)</label>
        <input type="number" className="filter-select" placeholder="e.g. 50000" value={filters.maxMinInvestment} step={1000} onChange={e => onFilterChange('maxMinInvestment', e.target.value)} />
      </div>

      <div className="filter-group">
        <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => onFilterChange('__reset__', null)}>
          Reset all filters
        </button>
      </div>
    </div>
  );
}

export function Navbar() {
  const { items } = usePortfolio();
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-mark">VQ</span>
          VaultIQ
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/recommendations" className="nav-link">Picks</Link>
          <Link to="/portfolio" className="nav-portfolio-badge">
            Portfolio <span className="badge-count">{items.length}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
