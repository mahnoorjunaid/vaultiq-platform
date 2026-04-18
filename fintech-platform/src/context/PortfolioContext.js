// ===============================
// Portfolio Context
// Manages user investments and returns
// ===============================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { calculatePortfolioStats } from '../utils/finance';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vaultiq_portfolio');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [stats, setStats] = useState(() => calculatePortfolioStats([]));

  // Recalculate stats whenever items change
  useEffect(() => {
    setStats(calculatePortfolioStats(items));
    try {
      localStorage.setItem('vaultiq_portfolio', JSON.stringify(items));
    } catch { /* quota exceeded */ }
  }, [items]);

  // Adds a new asset to the portfolio
  
  const addToPortfolio = useCallback((product, amount) => {
    setItems(prev => {
      if (prev.find(i => i.product.id === product.id)) return prev;
      return [...prev, { product, amount: Number(amount) || product.minInvestment }];
    });
  }, []);

  const removeFromPortfolio = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateAllocation = useCallback((productId, newAmount) => {
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, amount: Number(newAmount) } : i
      )
    );
  }, []);

  const isInPortfolio = useCallback((productId) => {
    return items.some(i => i.product.id === productId);
  }, [items]);

  return (
    <PortfolioContext.Provider value={{
      items,
      stats,
      addToPortfolio,
      removeFromPortfolio,
      updateAllocation,
      isInPortfolio,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be inside PortfolioProvider');
  return ctx;
}
