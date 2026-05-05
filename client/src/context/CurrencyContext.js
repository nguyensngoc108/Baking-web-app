import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PREF_KEY  = 's2ugar_currency';
const CACHE_KEY = 's2ugar_fx_rate';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const CurrencyContext = createContext(null);

const getCachedRate = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.rate;
  } catch {}
  return null;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem(PREF_KEY) || 'NZD'
  );
  const [rate, setRate] = useState(1);         // NZD → selected currency
  const [loading, setLoading] = useState(false);

  const fetchRate = useCallback(async () => {
    const cached = getCachedRate();
    if (cached) { setRate(currency === 'USD' ? cached : 1); return; }

    setLoading(true);
    try {
      const res  = await fetch('https://api.frankfurter.app/latest?from=NZD&to=USD');
      const data = await res.json();
      const usdRate = data.rates.USD;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: usdRate, ts: Date.now() }));
      setRate(currency === 'USD' ? usdRate : 1);
    } catch {
      // silently keep previous rate
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => { fetchRate(); }, [fetchRate]);

  const setCurrency = (code) => {
    localStorage.setItem(PREF_KEY, code);
    setCurrencyState(code);
    const cached = getCachedRate();
    setRate(code === 'USD' ? (cached ?? rate) : 1);
  };

  const formatPrice = useCallback((nzdAmount) => {
    if (nzdAmount == null) return '—';
    const amount = nzdAmount * rate;
    return currency === 'USD'
      ? `US$${amount.toFixed(2)}`
      : `NZ$${amount.toFixed(2)}`;
  }, [currency, rate]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, loading, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
