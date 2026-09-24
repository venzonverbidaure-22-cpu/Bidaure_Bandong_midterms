import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { State, Action } from '../types';
import { microReducer } from './microReducer';

const initialState: State = {
  user: null,
  token: localStorage.getItem('token'),
  incidents: [],
  loading: false,
  error: null,
};

interface MicroContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const MicroContext = createContext<MicroContextType | undefined>(undefined);

export const MicroProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(microReducer, initialState);

  return (
    <MicroContext.Provider value={{ state, dispatch }}>
      {children}
    </MicroContext.Provider>
  );
};

export const useMicroContext = () => {
  const context = useContext(MicroContext);
  if (!context) {
    throw new Error('useIncidentContext must be used within an IncidentProvider');
  }
  return context;
};
