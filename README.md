# FinVest — Dynamic Financial Product Discovery Platform

A comprehensive React-based FinTech web application built for the FAST National University Web Programming assignment (BS Financial Technology Program).

---

## Features

- **Home Page** — Hero, featured products per category, category navigation, stats strip, CTA banner
- **Product Listing** — Full filter panel (risk, return range, category, liquidity, time horizon, min investment) with AND logic
- **Product Detail** — Dynamic route `/product/:id`, attribute explainers, decision insight generator, return projection calculator, side-by-side comparison, add to portfolio
- **User Financial Profile** — Controlled form with validation, radio cards, live match preview, profile-to-recommendation mapping explanation
- **Recommendations** — Dynamically computed from profile (zero hardcoding), sorted by risk-adjusted relevance
- **Portfolio** — Weighted return calculation, risk distribution bar, category breakdown, diversification score, high-risk warning (>70%)

---

## Financial Logic

### Risk-to-Product Mapping
| User Risk Tolerance | Allowed Product Risk Levels |
|---|---|
| Conservative | Low only |
| Moderate | Low, Medium |
| Aggressive | Low, Medium, High |

### Recommendation Sorting
- **Conservative** → lowest risk first, then highest return within tier
- **Moderate** → best risk-adjusted return (return ÷ risk penalty)
- **Aggressive** → highest expected return first

### Portfolio Weighted Return
```
weightedReturn = Σ (allocation / totalInvested) × product.expectedReturn
```

### Deterministic API Transformation
Each API product is mapped to the same financial attributes every time using a seeded pseudo-random number (based on product ID + title), ensuring consistent data without random re-assignment on re-renders.

---

## Component Hierarchy

```
App
├── BrowserRouter
│   ├── UserProfileProvider (Context)
│   │   └── PortfolioProvider (Context)
│   │       ├── Navbar
│   │       └── Routes
│   │           ├── Home
│   │           │   └── ProductCard[]
│   │           ├── ProductListing
│   │           │   ├── FilterPanel
│   │           │   └── ProductCard[]
│   │           ├── ProductDetail (/:id)
│   │           │   ├── RiskBadge
│   │           │   ├── CategoryBadge
│   │           │   └── ReturnDisplay
│   │           ├── UserProfile
│   │           ├── Portfolio
│   │           │   ├── PortfolioSummary
│   │           │   └── PortfolioItem[]
│   │           ├── Recommendations
│   │           │   └── ProductCard[]
│   │           └── NotFound
```

---

## State Management

### Local State (useState)
- Form inputs (controlled components)
- Filter state in ProductListing
- Calculator inputs in ProductDetail
- UI states (loading, error, added feedback)

### Global Context (Context API)
- **PortfolioContext** — items, stats, add/remove/update, isInPortfolio
- **UserProfileContext** — profile, updateProfile, isProfileComplete, getProductRecommendations, getMatchCount

Both contexts persist to `localStorage` for session continuity.

---

## API Integration

Uses **Fake Store API** (`https://fakestoreapi.com/products`).

Transformation mapping:
| API Category | Financial Category | Risk | Liquidity |
|---|---|---|---|
| electronics | investment | medium | moderate |
| jewelery | savings | low | easy |
| men's clothing | insurance | low | locked |
| women's clothing | crypto | high | easy |

Returns are assigned deterministically using a seeded hash of the product ID and title — the same product always receives the same expected return.

A 12-product fallback dataset is included for when the API is unreachable.

---

## Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

Requires Node.js 16+ and npm.

---

## Folder Structure

```
src/
├── components/     # Reusable UI components (ProductCard, FilterPanel, Navbar, etc.)
├── context/        # PortfolioContext, UserProfileContext
├── pages/          # Home, ProductListing, ProductDetail, UserProfile, Portfolio, Recommendations, NotFound
├── utils/          # finance.js — all financial logic, transformations, calculations
├── styles/         # global.css — full custom CSS (no UI libraries)
├── App.js          # Root component with routing
└── index.js        # Entry point
```

---

## Styling

- **No UI libraries used** — 100% custom CSS
- CSS variables for consistent theming (blue/white color scheme)
- Responsive design: mobile, tablet, desktop breakpoints
- Animations: card entry, hover overlays, page fade-in, spinner
- Respects `prefers-reduced-motion`

---

## Bonus Features Implemented

- ✅ localStorage persistence (portfolio + profile)
- ✅ Return projection calculator (compound interest, multiple periods)
- ✅ Side-by-side product comparison
- ✅ Diversification score calculation
- ✅ Portfolio high-risk concentration warning (>70%)
- ✅ Live match count preview on profile form (updates as user fills in form)
- ✅ Sorting options (return, risk, min investment)
- ✅ `prefers-reduced-motion` support
- ✅ Fallback static dataset when API is unreachable

## Notes
This project follows component-based architecture with React Context for state management and utility-based financial calculations.
