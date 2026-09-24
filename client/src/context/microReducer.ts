import type { State, Action } from '../types';

export const microReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        incidents: [],
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'FETCH_SERVICES_SUCCESS':
      return { ...state, incidents: action.payload, loading: false };
    case 'CREATE_SERVICE_SUCCESS':
      return { ...state, incidents: [...state.incidents, action.payload] };
    case 'UPDATE_SERVICE_SUCCESS':
      return {
        ...state,
        incidents: state.incidents.map((incident) =>
          incident.id === action.payload.id ? action.payload : incident
        ),
      };
    case 'DELETE_SERVICE_SUCCESS':
      return {
        ...state,
        incidents: state.incidents.filter((incident) => incident.id !== action.payload),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};
