import { Link } from 'react-router-dom';
import { ProductCard } from '../components';
import { useUserProfile } from '../context/UserProfileContext';

export default function Recommendations({ products }) {
  const { profile, isProfileComplete, getProductRecommendations } = useUserProfile();

  if (!isProfileComplete()) {
    return (
      <div className="page-fade-in">
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state-icon">👤</div>
          <h3>// profile_required</h3>
          <p>Build your financial profile to generate personalised product recommendations.</p>
          <Link to="/profile" className="btn btn-primary btn-lg">Create Profile →</Link>
        </div>
      </div>
    );
  }

  const recommendations = getProductRecommendations(products);

  const sortDesc = {
    conservative: 'Sorted by lowest risk first, then by highest return within each risk tier.',
    moderate: 'Sorted by best risk-adjusted return (return ÷ risk penalty coefficient).',
    aggressive: 'Sorted by highest expected annual return — maximum growth priority.',
  };

  return (
    <div className="page-fade-in">
      <div className="reco-header-bar">
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--rule-heavy)', marginBottom: 10 }}>
            // personalised_picks
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: '2rem', letterSpacing: '-0.03em', marginBottom: 10 }}>
            Your Recommendations
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: '0.88rem', fontWeight: 300 }}>
            {profile.riskTolerance} · {profile.investmentHorizon} horizon · PKR {Number(profile.monthlyCapacity).toLocaleString()} capacity
          </p>
        </div>
        <div className="reco-count-block">
          <div className="reco-count-big">{recommendations.length}</div>
          <div className="reco-count-label">matches</div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px' }}>
        {/* Profile chips */}
        <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap', marginBottom: 28, border: 'var(--border)', width: 'fit-content' }}>
          {[
            ['RISK', profile.riskTolerance],
            ['HORIZON', profile.investmentHorizon],
            ['LIQUIDITY', profile.liquidityPreference],
            ['BUDGET', `PKR ${Number(profile.monthlyCapacity).toLocaleString()}`],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '8px 16px', borderRight: 'var(--border-thin)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rule-heavy)' }}>{k}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)', textTransform: 'capitalize' }}>{v}</span>
            </div>
          ))}
          <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
            <Link to="/profile" className="btn btn-ghost btn-sm">Edit ✏</Link>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 0' }}>
            <div className="empty-state-icon">⬜</div>
            <h3>// no_matches</h3>
            <p>No products match all your criteria. Try raising your budget or adjusting risk/liquidity preferences.</p>
            <Link to="/profile" className="btn btn-primary">Update Profile →</Link>
          </div>
        ) : (
          <>
            <div className="insight-box" style={{ marginBottom: 28 }}>
              <h4>// sort_algorithm</h4>
              <p>{sortDesc[profile.riskTolerance]}</p>
            </div>
            <div className="products-grid-wrap">
              <div className="products-grid">
                {recommendations.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
