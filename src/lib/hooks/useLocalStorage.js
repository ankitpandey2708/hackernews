import { useState, useEffect } from 'react';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const getStorageSize = (data) => {
  const jsonString = JSON.stringify(data);
  return new Blob([jsonString]).size;
};

const pruneIfNeeded = (data) => {
  const currentSize = getStorageSize(data);

  if (currentSize > MAX_SIZE) {
    // Prune oldest 20% to free up space
    const entries = Object.entries(data);
    // Sort by timestamp value (oldest first)
    entries.sort((a, b) => a[1] - b[1]);
    const keepCount = Math.floor(entries.length * 0.8);
    // Keep the newest 80%
    return Object.fromEntries(entries.slice(-keepCount));
  }

  return data;
};

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const prunedValue = pruneIfNeeded(value);
      window.localStorage.setItem(key, JSON.stringify(prunedValue));

      // Update state if pruning occurred
      if (prunedValue !== value) {
        setValue(prunedValue);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);

      // If still exceeding quota after pruning, try emergency cleanup
      if (error.name === 'QuotaExceededError') {
        try {
          const entries = Object.entries(value);
          // Sort by timestamp value (oldest first)
          entries.sort((a, b) => a[1] - b[1]);
          const keepCount = Math.floor(entries.length * 0.5); // Keep only 50%
          const emergencyPruned = Object.fromEntries(entries.slice(-keepCount));
          window.localStorage.setItem(key, JSON.stringify(emergencyPruned));
          setValue(emergencyPruned);
        } catch (emergencyError) {
          console.error(`Emergency pruning failed for key "${key}":`, emergencyError);
        }
      }
    }
  }, [key, value]);

  return [value, setValue];
} 