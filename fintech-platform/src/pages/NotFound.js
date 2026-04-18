import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="page-fade-in empty-state" style={{ paddingTop: 100 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '4rem', marginBottom: 16, color: 'var(--rule-heavy)' }}>404</div>
      <h3>// page_not_found</h3>
      <p>This route does not exist in the application.</p>
      <Link to="/" className="btn btn-primary">← Return Home</Link>
    </div>
  );
}
