import { createContext, useContext, useState, useCallback } from 'react';
import { getRecommendations, countMatches } from '../utils/finance';

const UserProfileContext = createContext(null);

const defaultProfile = {
  riskTolerance: '',
  investmentHorizon: '',
  monthlyCapacity: '',
  liquidityPreference: '',
  investmentGoal: '',
};

export function UserProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('vaultiq_profile');
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch { return defaultProfile; }
  });

  const updateProfile = useCallback((newProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('vaultiq_profile', JSON.stringify(newProfile));
    } catch { /* quota exceeded */ }
  }, []);

  const isProfileComplete = useCallback(() => {
    return !!(
      profile.riskTolerance &&
      profile.investmentHorizon &&
      profile.monthlyCapacity &&
      profile.liquidityPreference &&
      profile.investmentGoal
    );
  }, [profile]);

  const getProductRecommendations = useCallback((products) => {
    return getRecommendations(products, profile);
  }, [profile]);

  const getMatchCount = useCallback((products) => {
    return countMatches(products, profile);
  }, [profile]);

  return (
    <UserProfileContext.Provider value={{
      profile,
      updateProfile,
      isProfileComplete,
      getProductRecommendations,
      getMatchCount,
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be inside UserProfileProvider');
  return ctx;
}
