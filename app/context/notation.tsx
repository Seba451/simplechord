'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Notation = 'americano' | 'latino';

interface NotationContextProps {
  notation: Notation;
  toggleNotation: () => void;
  setNotation: (value: Notation) => void;
}

const NotationContext = createContext<NotationContextProps | undefined>(undefined);

export const NotationProvider = ({ children }: { children: ReactNode }) => {
  const [notation, setNotationState] = useState<Notation>('americano');

  // Leer de localStorage al cargar
  useEffect(() => {
    const savedNotation = localStorage.getItem('notation') as Notation;
    if (savedNotation === 'americano' || savedNotation === 'latino') {
      setNotationState(savedNotation);
    }
  }, []);

  const setNotation = (value: Notation) => {
    setNotationState(value);
    localStorage.setItem('notation', value);
  };

  const toggleNotation = () => {
    setNotationState((prev) => {
      const newNotation = prev === 'latino' ? 'americano' : 'latino';
      localStorage.setItem('notation', newNotation);
      return newNotation;
    });
  };

  return (
    <NotationContext.Provider value={{ notation, toggleNotation, setNotation }}>
      {children}
    </NotationContext.Provider>
  );
};

export const useNotation = () => {
  const context = useContext(NotationContext);
  if (!context) {
    throw new Error('useNotation debe usarse dentro de NotationProvider');
  }
  return context;
};