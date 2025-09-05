import { useState, useEffect } from 'react';

/**
 * Custom hook para gerenciar localStorage com TypeScript
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Função para ler o valor do localStorage
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State para armazenar o valor atual
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Função para definir valor no localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permite função setter como useState
      const newValue = value instanceof Function ? value(storedValue) : value;
      
      // Salva no state
      setStoredValue(newValue);
      
      // Salva no localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Efeito para sincronizar com mudanças no localStorage de outras abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
}
