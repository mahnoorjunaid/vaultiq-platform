import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../context/UserProfileContext';

const RISK_OPTIONS = [
  { value: 'conservative', label: 'Conservative', icon: '🛡️', desc: 'Capital preservation' },
  { value: 'moderate', label: 'Moderate', icon: '⚖️', desc: 'Balanced growth' },
  { value: 'aggressive', label: 'Aggressive', icon: '🚀', desc: 'Max return' },
];
const HORIZON_OPTIONS = [
  { value: 'short', label: 'Short (1–2 yr)', icon: '⚡' },
  { value: 'medium', label: 'Medium (3–5 yr)', icon: '📅' },
  { value: 'long', label: 'Long (5+ yr)', icon: '🌱' },
];
const LIQUIDITY_OPTIONS = [
  { value: 'easy', label: 'Need quick access', icon: '🏃' },
  { value: 'moderate', label: 'Some flexibility', icon: '🚶' },
  { value: 'locked', label: 'Can lock funds', icon: '🔒' },
];
const GOAL_OPTIONS = ['Wealth Building', 'Retirement', 'Emergency Fund', 'Specific Purchase', 'Education', 'Business Capital'];

export default function UserProfile({ products }) {
  const { profile, updateProfile, isProfileComplete, getMatchCount } = useUserProfile();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...profile });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    setSaved(false);
  }

  function validate() {
    const errs = {};
    if (!form.riskTolerance) errs.riskTolerance = 'Required';
    if (!form.investmentHorizon) errs.investmentHorizon = 'Required';
    if (!form.monthlyCapacity || Number(form.monthlyCapacity) < 1000) errs.monthlyCapacity = 'Minimum PKR 1,000';
    if (!form.liquidityPreference) errs.liquidityPreference = 'Required';
    if (!form.investmentGoal) errs.investmentGoal = 'Required';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    updateProfile(form);
    setSaved(true);
    setTimeout(() => navigate('/recommendations'), 1100);
  }

  // Live count from form (not yet saved)
  const liveCount = products.filter(p => {
    const riskMap = { conservative: ['low'], moderate: ['low', 'medium'], aggressive: ['low', 'medium', 'high'] };
    const horizonMap = { short: ['short'], medium: ['short', 'medium'], long: ['short', 'medium', 'long'] };
    const liqMap = { easy: ['easy'], moderate: ['easy', 'moderate'], locked: ['easy', 'moderate', 'locked'] };
    const aR = riskMap[form.riskTolerance] || ['low'];
    const aH = horizonMap[form.investmentHorizon] || [];
    const aL = liqMap[form.liquidityPreference] || [];
    return aR.includes(p.riskLevel)
      && (aH.length === 0 || aH.includes(p.timeHorizon))
      && (aL.length === 0 || aL.includes(p.liquidity))
      && p.minInvestment <= (Number(form.monthlyCapacity) || 0);
  }).length;

  return (
    <div className="page-fade-in">
      <div className="page-title-bar">
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <h1>Financial Profile</h1>
          <p>Profile data drives the recommendation engine — every field matters</p>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div className="profile-layout">
          <div className="profile-form-col">
            <form onSubmit={handleSubmit}>
              {/* Risk */}
              <div className="form-group">
                <label>Risk Tolerance <span>*</span></label>
                <div className="radio-group">
                  {RISK_OPTIONS.map(opt => (
                    <label key={opt.value} className={`radio-card${form.riskTolerance === opt.value ? ' selected' : ''}`}>
                      <input type="radio" name="risk" value={opt.value} checked={form.riskTolerance === opt.value} onChange={() => setField('riskTolerance', opt.value)} />
                      <span className="rc-icon">{opt.icon}</span>
                      <div className="radio-card-label">{opt.label}</div>
                      <div className="rc-sub">{opt.desc}</div>
                    </label>
                  ))}
                </div>
                {errors.riskTolerance && <div className="form-error">// {errors.riskTolerance}</div>}
              </div>

              {/* Horizon */}
              <div className="form-group">
                <label>Investment Horizon <span>*</span></label>
                <div className="radio-group">
                  {HORIZON_OPTIONS.map(opt => (
                    <label key={opt.value} className={`radio-card${form.investmentHorizon === opt.value ? ' selected' : ''}`}>
                      <input type="radio" name="horizon" value={opt.value} checked={form.investmentHorizon === opt.value} onChange={() => setField('investmentHorizon', opt.value)} />
                      <span className="rc-icon">{opt.icon}</span>
                      <div className="radio-card-label">{opt.label}</div>
                    </label>
                  ))}
                </div>
                {errors.investmentHorizon && <div className="form-error">// {errors.investmentHorizon}</div>}
              </div>

              {/* Budget */}
              <div className="form-group">
                <label>Monthly Investment Capacity (PKR) <span>*</span></label>
                <input type="number" className={`form-control${errors.monthlyCapacity ? ' error' : ''}`} placeholder="e.g. 25000" value={form.monthlyCapacity} min={1000} step={500} onChange={e => setField('monthlyCapacity', e.target.value)} />
                {errors.monthlyCapacity && <div className="form-error">// {errors.monthlyCapacity}</div>}
              </div>

              {/* Liquidity */}
              <div className="form-group">
                <label>Liquidity Preference <span>*</span></label>
                <div className="radio-group">
                  {LIQUIDITY_OPTIONS.map(opt => (
                    <label key={opt.value} className={`radio-card${form.liquidityPreference === opt.value ? ' selected' : ''}`}>
                      <input type="radio" name="liquidity" value={opt.value} checked={form.liquidityPreference === opt.value} onChange={() => setField('liquidityPreference', opt.value)} />
                      <span className="rc-icon">{opt.icon}</span>
                      <div className="radio-card-label">{opt.label}</div>
                    </label>
                  ))}
                </div>
                {errors.liquidityPreference && <div className="form-error">// {errors.liquidityPreference}</div>}
              </div>

              {/* Goal */}
              <div className="form-group">
                <label>Investment Goal <span>*</span></label>
                <select className={`form-control${errors.investmentGoal ? ' error' : ''}`} value={form.investmentGoal} onChange={e => setField('investmentGoal', e.target.value)}>
                  <option value="">Select goal…</option>
                  {GOAL_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                {errors.investmentGoal && <div className="form-error">// {errors.investmentGoal}</div>}
              </div>

              <button type="submit" className="btn btn-primary btn-lg">
                {saved ? '✓ Saved → Redirecting' : 'Save Profile & View Recommendations →'}
              </button>

              {form.riskTolerance && (
                <div className="insight-box" style={{ marginTop: 24 }}>
                  <h4>// recommendation_logic_preview</h4>
                  <p>
                    A <strong>{form.riskTolerance}</strong> investor sees:{' '}
                    {{ conservative: 'low risk only', moderate: 'low + medium risk', aggressive: 'all risk levels' }[form.riskTolerance]}.
                    {form.investmentHorizon && ` ${form.investmentHorizon.charAt(0).toUpperCase() + form.investmentHorizon.slice(1)}-term horizon further filters matching time horizons.`}
                    {form.monthlyCapacity && ` Only products requiring ≤ PKR ${Number(form.monthlyCapacity).toLocaleString()} appear.`}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar */}
          <div className="profile-sidebar">
            {/* Live counter */}
            {form.riskTolerance && form.monthlyCapacity && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rule-heavy)', marginBottom: 10 }}>
                  // live_match_count
                </div>
                <div className="match-count-chip">
                  <div className="match-count">{liveCount}</div>
                  <div className="match-label">products match this form</div>
                </div>
              </div>
            )}

            {/* Saved profile */}
            {isProfileComplete() && (
              <div style={{ border: 'var(--border)', marginBottom: 24 }}>
                <div style={{ background: 'var(--ink)', color: 'white', padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  // saved_profile
                </div>
                <div style={{ padding: 16 }}>
                  {[['Risk', profile.riskTolerance], ['Horizon', profile.investmentHorizon], ['Budget', `PKR ${Number(profile.monthlyCapacity).toLocaleString()}`], ['Liquidity', profile.liquidityPreference], ['Goal', profile.investmentGoal]].map(([k, v]) => (
                    <div key={k} className="profile-summary-row">
                      <span className="psrow-key">{k}</span>
                      <span className="psrow-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ border: 'var(--border)' }}>
              <div style={{ background: 'var(--ink)', color: 'white', padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                // how_it_works
              </div>
              <div style={{ padding: 16 }}>
                <p style={{ fontSize: '0.84rem', color: 'var(--ink-3)', lineHeight: 1.7, fontWeight: 300 }}>
                  Your profile is not cosmetic. It actively determines which products are shown.
                  Conservative investors never see high-risk crypto. The algorithm applies AND logic
                  across risk tolerance, time horizon, liquidity, and budget simultaneously.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
