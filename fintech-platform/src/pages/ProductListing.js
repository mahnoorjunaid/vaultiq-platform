import { useState, useMemo } from 'react';
import { ProductCard, FilterPanel } from '../components';
import { applyFilters } from '../utils/finance';

const DEFAULT_FILTERS = {
  riskLevels: [], categories: [], minReturn: 0, maxReturn: '',
  liquidity: 'all', timeHorizon: 'all', maxMinInvestment: '',
};

export default function ProductListing({ products, loading }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState('return-desc');

  function handleFilterChange(field, value) {
    if (field === '__reset__') { setFilters(DEFAULT_FILTERS); return; }
    setFilters(prev => ({ ...prev, [field]: value }));
  }

  const filtered = useMemo(() => {
    let result = applyFilters(products, filters);
    switch (sortBy) {
      case 'return-desc': return result.sort((a, b) => b.expectedReturn - a.expectedReturn);
      case 'return-asc': return result.sort((a, b) => a.expectedReturn - b.expectedReturn);
      case 'risk-asc': { const o = { low: 0, medium: 1, high: 2 }; return result.sort((a, b) => o[a.riskLevel] - o[b.riskLevel]); }
      case 'investment-asc': return result.sort((a, b) => a.minInvestment - b.minInvestment);
      default: return result;
    }
  }, [products, filters, sortBy]);

  return (
    <div className="page-fade-in">
      <div className="page-title-bar">
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <h1>All Financial Products</h1>
          <p>Multi-criteria filter system — AND logic across all active filters</p>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div className="listing-layout">
          <div className="listing-sidebar-col">
            <FilterPanel filters={filters} onFilterChange={handleFilterChange} productCount={filtered.length} />
          </div>
          <main className="listing-main">
            <div className="listing-main-header">
              <span className="result-count">
                <strong>{filtered.length}</strong> of {products.length} products
              </span>
              <div className="sort-bar">
                <span className="sort-label">Sort:</span>
                <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="return-desc">Highest Return</option>
                  <option value="return-asc">Lowest Return</option>
                  <option value="risk-asc">Lowest Risk First</option>
                  <option value="investment-asc">Min. Investment ↑</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-screen"><div className="spinner" /><div className="loading-text">Loading products…</div></div>
            ) : filtered.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">⬜</div>
                <h3>// no_results</h3>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--rule-heavy)' }}>
                  Adjust the filters on the left to see matching products.
                </p>
              </div>
            ) : (
              <div className="products-grid-wrap">
                <div className="products-grid">
                  {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
