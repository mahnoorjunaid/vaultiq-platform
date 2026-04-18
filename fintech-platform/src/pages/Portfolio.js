import { Link } from 'react-router-dom';
import { PortfolioSummary, PortfolioItem } from '../components';
import { usePortfolio } from '../context/PortfolioContext';
import { formatPKR, formatReturn } from '../utils/finance';

export default function Portfolio() {
  const { items, stats, removeFromPortfolio, updateAllocation } = usePortfolio();

  if (items.length === 0) {
    return (
      <div className="page-fade-in">
        <div className="page-title-bar">
          <div style={{ maxWidth: 1240, margin: '0 auto' }}>
            <h1>Portfolio</h1>
            <p>Manage allocations, track weighted return, monitor risk distribution</p>
          </div>
        </div>
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-state-icon">💼</div>
          <h3>// portfolio_empty</h3>
          <p>Add products to begin tracking allocations and portfolio-level statistics.</p>
          <div style={{ display: 'flex', gap: 0, justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
            <Link to="/recommendations" className="btn btn-outline btn-lg">View Picks</Link>
          </div>
        </div>
      </div>
    );
  }

  const highRiskPct = stats.riskDistribution.high;

  return (
    <div className="page-fade-in">
      <div className="page-title-bar">
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Portfolio</h1>
            <p>{items.length} holdings · {formatPKR(stats.totalInvested)} total · {formatReturn(stats.weightedReturn)} blended return</p>
          </div>
          <Link to="/products" className="btn btn-primary">+ Add Product</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 28px' }}>
        {highRiskPct > 70 && (
          <div className="warning-banner">
            ⚠ HIGH RISK CONCENTRATION: {highRiskPct}% of portfolio in high-risk products. Consider diversifying.
          </div>
        )}

        <PortfolioSummary portfolio={{ items, stats }} />

        {/* Holdings list */}
        <div style={{ border: 'var(--border)', marginBottom: 32 }}>
          <div style={{ background: 'var(--ink)', color: 'white', padding: '12px 20px', fontFamily: 'var(--mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            // holdings — {items.length} products
          </div>
          {items.map(item => (
            <PortfolioItem key={item.product.id} item={item} onRemove={removeFromPortfolio} onUpdateAmount={updateAllocation} />
          ))}
        </div>

        {/* Category breakdown */}
        <div style={{ border: 'var(--border)', marginBottom: 32 }}>
          <div style={{ background: 'var(--ink)', color: 'white', padding: '12px 20px', fontFamily: 'var(--mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            // category_breakdown
          </div>
          <div style={{ padding: '20px 24px' }}>
            {Object.entries(stats.categoryDistribution).map(([cat, amount]) => {
              const pct = stats.totalInvested > 0 ? ((amount / stats.totalInvested) * 100).toFixed(1) : 0;
              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontFamily: 'var(--mono)', fontSize: '0.78rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 700, color: 'var(--ink)' }}>{cat}</span>
                    <span style={{ color: 'var(--rule-heavy)' }}>{formatPKR(amount)} / {pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--rule)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--blue)', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portfolio analysis */}
        <div className="insight-box">
          <h4>// portfolio_analysis</h4>
          <p>
            Blended return: <strong>{formatReturn(stats.weightedReturn)}</strong> p.a.{' '}
            {stats.diversificationScore >= 70 ? 'Portfolio is well-diversified across multiple asset categories.' :
             stats.diversificationScore >= 40 ? 'Consider adding more categories to improve diversification.' :
             'Portfolio is highly concentrated — spreading across more categories reduces systemic risk.'}
            {highRiskPct > 70 && ' ⚠ High-risk concentration exceeds 70% — review your risk tolerance.'}
          </p>
        </div>
      </div>
    </div>
  );
}
