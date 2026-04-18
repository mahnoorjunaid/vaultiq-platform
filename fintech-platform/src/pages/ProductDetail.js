import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RiskBadge, CategoryBadge } from '../components';
import { usePortfolio } from '../context/PortfolioContext';
import { generateDecisionInsight, compoundProjection, formatPKR, formatReturn } from '../utils/finance';

export default function ProductDetail({ products }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToPortfolio, isInPortfolio } = usePortfolio();
  const [amount, setAmount] = useState('');
  const [years, setYears] = useState(5);
  const [compareId, setCompareId] = useState('');
  const [added, setAdded] = useState(false);

  const product = products.find(p => String(p.id) === String(id));

  if (!product) {
    return (
      <div className="page-fade-in">
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state-icon">⬜</div>
          <h3>// product_not_found</h3>
          <p>ID "{id}" does not exist in the database.</p>
          <Link to="/products" className="btn btn-primary">← Back to Products</Link>
        </div>
      </div>
    );
  }

  const insight = generateDecisionInsight(product);
  const inPortfolio = isInPortfolio(product.id);
  const investmentAmt = Number(amount) || product.minInvestment;
  const compareProduct = products.find(p => String(p.id) === String(compareId));

  function handleAdd() { addToPortfolio(product, investmentAmt); setAdded(true); }

  return (
    <div className="page-fade-in">
      {/* Breadcrumb */}
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div className="detail-breadcrumb">
          <Link to="/products" style={{ color: 'var(--blue)' }}>products</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{product.category}</span>
          <span className="breadcrumb-sep">/</span>
          <span style={{ color: 'var(--ink)' }}>#{product.id}</span>
        </div>

        <div className="detail-layout">
          {/* LEFT */}
          <div className="detail-main">
            <div className="detail-hero">
              <div className="detail-icon-line">
                <div className="detail-big-icon">{product.icon}</div>
                <div>
                  <div className="detail-badges">
                    <RiskBadge riskLevel={product.riskLevel} />
                    <CategoryBadge category={product.category} />
                    <span className="badge" style={{ background: 'var(--blue-pale)', color: 'var(--blue)', border: '1px solid var(--blue)' }}>
                      {product.liquidity} liquidity
                    </span>
                  </div>
                  <h1 className="detail-title">{product.name}</h1>
                </div>
              </div>
              <p className="detail-description">{product.description}</p>
            </div>

            {/* Attributes table */}
            <div style={{ borderBottom: '2px solid var(--ink)' }}>
              <table className="attributes-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Attribute</th>
                    <th style={{ width: '20%' }}>Value</th>
                    <th>What it means</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="attr-name">Expected Return</span></td>
                    <td><span className="attr-ret">{formatReturn(product.expectedReturn)}</span></td>
                    <td><span className="attr-explain">Projected annual growth as a percentage of invested capital.</span></td>
                  </tr>
                  <tr>
                    <td><span className="attr-name">Risk Level</span></td>
                    <td><RiskBadge riskLevel={product.riskLevel} /></td>
                    <td>
                      <div className="risk-bar-track"><div className={`risk-bar-fill risk-fill-${product.riskLevel}`} /></div>
                      <span className="attr-explain">Probability of capital loss. Low = preservation. High = volatility.</span>
                    </td>
                  </tr>
                  <tr>
                    <td><span className="attr-name">Liquidity</span></td>
                    <td><span className="attr-val">{product.liquidity}</span></td>
                    <td><span className="attr-explain">Ease of accessing funds. Easy = anytime. Locked = committed for term.</span></td>
                  </tr>
                  <tr>
                    <td><span className="attr-name">Time Horizon</span></td>
                    <td><span className="attr-val">{product.timeHorizon}</span></td>
                    <td><span className="attr-explain">Ideal holding period: short 1–2yr, medium 3–5yr, long 5+yr.</span></td>
                  </tr>
                  <tr>
                    <td><span className="attr-name">Min. Investment</span></td>
                    <td><span className="attr-val" style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>{formatPKR(product.minInvestment)}</span></td>
                    <td><span className="attr-explain">Minimum capital required to enter this product.</span></td>
                  </tr>
                  <tr>
                    <td><span className="attr-name">Category</span></td>
                    <td><CategoryBadge category={product.category} /></td>
                    <td><span className="attr-explain">The type of financial instrument and its primary function.</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Decision insight */}
            <div className="insight-box">
              <h4>// decision_insight — who is this for?</h4>
              <p>{insight}</p>
            </div>

            {/* Comparison */}
            <div style={{ padding: '24px', borderTop: '2px solid var(--ink)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rule-heavy)', marginBottom: 12 }}>
                // product_comparison
              </div>
              <select
                value={compareId}
                onChange={e => setCompareId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: 'var(--border)', borderRadius: 0, fontFamily: 'var(--mono)', fontSize: '0.85rem', marginBottom: 16, outline: 'none' }}
              >
                <option value="">— select a product to compare —</option>
                {products.filter(p => p.id !== product.id).map(p => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
              {compareProduct ? (
                <div className="comparison-grid">
                  <div className="compare-col active">
                    <div className="compare-header">{product.icon} This Product</div>
                    <div className="compare-body">
                      {[['Category', product.category], ['Risk', product.riskLevel], ['Return', formatReturn(product.expectedReturn)], ['Liquidity', product.liquidity], ['Horizon', product.timeHorizon], ['Min. Invest', formatPKR(product.minInvestment)]].map(([k, v]) => (
                        <div key={k} className="compare-row"><span className="compare-key">{k}</span><span className="compare-val">{v}</span></div>
                      ))}
                    </div>
                  </div>
                  <div className="compare-col">
                    <div className="compare-header">{compareProduct.icon} {compareProduct.name.substring(0, 25)}</div>
                    <div className="compare-body">
                      {[['Category', compareProduct.category], ['Risk', compareProduct.riskLevel], ['Return', formatReturn(compareProduct.expectedReturn)], ['Liquidity', compareProduct.liquidity], ['Horizon', compareProduct.timeHorizon], ['Min. Invest', formatPKR(compareProduct.minInvestment)]].map(([k, v]) => (
                        <div key={k} className="compare-row"><span className="compare-key">{k}</span><span className="compare-val">{v}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--rule-heavy)' }}>Select a product above to compare side by side.</p>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="detail-sidebar">
            {/* Return calculator */}
            <div className="panel-section">
              <div className="panel-section-head">// return_calculator</div>
              <div className="panel-section-body">
                <div className="calc-input-group">
                  <label>Investment Amount (PKR)</label>
                  <input type="number" placeholder={`Min: ${product.minInvestment.toLocaleString()}`} value={amount} min={product.minInvestment} step={1000} onChange={e => setAmount(e.target.value)} />
                </div>
                <div className="calc-input-group">
                  <label>Period</label>
                  <select value={years} onChange={e => setYears(Number(e.target.value))}>
                    <option value={1}>1 Year</option>
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years</option>
                    <option value={5}>5 Years</option>
                    <option value={10}>10 Years</option>
                  </select>
                </div>
                <div className="calc-results">
                  {[1, 3, 5, 10].map(y => (
                    <div key={y} className="calc-result-row">
                      <span>{y}yr</span>
                      <span>{formatPKR(compoundProjection(investmentAmt, product.expectedReturn, y))}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--rule-heavy)', marginTop: 10 }}>* Compound interest at {formatReturn(product.expectedReturn)} p.a.</p>
              </div>
            </div>

            {/* Add to portfolio */}
            <div className="panel-section">
              <div className="panel-section-head">// add_to_portfolio</div>
              <div className="panel-section-body">
                <div className="calc-input-group">
                  <label>Allocation (PKR)</label>
                  <input type="number" placeholder={`Min: ${product.minInvestment.toLocaleString()}`} value={amount} min={product.minInvestment} step={1000} onChange={e => setAmount(e.target.value)} />
                </div>
                {inPortfolio || added ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="btn btn-added" style={{ width: '100%', justifyContent: 'center' }} disabled>✓ In Portfolio</button>
                    <Link to="/portfolio" className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}>View Portfolio →</Link>
                  </div>
                ) : (
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAdd} disabled={amount && Number(amount) < product.minInvestment}>
                    Add to Portfolio
                  </button>
                )}
                <p style={{ fontFamily: 'var(--mono)', fontSize: '0.68rem', color: 'var(--rule-heavy)', marginTop: 10 }}>Min: {formatPKR(product.minInvestment)}</p>
              </div>
            </div>

            {/* Quick glance */}
            <div className="panel-section">
              <div className="panel-section-head">// quick_glance</div>
              <div>
                {[['Expected Return', formatReturn(product.expectedReturn)], ['Risk Level', product.riskLevel], ['Liquidity', product.liquidity], ['Time Horizon', product.timeHorizon + ' term'], ['Min. Investment', formatPKR(product.minInvestment)]].map(([k, v]) => (
                  <div key={k} className="compare-row"><span className="compare-key">{k}</span><span className="compare-val">{v}</span></div>
                ))}
              </div>
            </div>

            <div style={{ padding: 16 }}>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(-1)}>← Back</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
