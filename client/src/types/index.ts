export interface Microservice {
  id: string;
  title: string;
  description: string;
  severity: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  status: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  createdAt?: string;
  updatedAt?: string;
}

export interface State {
  user: { id: string; email: string } | null;
  token: string | null;
  incidents: Microservice[];
  loading: boolean;
  error: string | null;
}

export type Action =
 | { type: 'SET_AUTH'; payload: { user: any; token: string } }
 | { type: 'LOGOUT' }
 | { type: 'SET_LOADING'; payload: boolean }
 | { type: 'FETCH_SERVICES_SUCCESS'; payload: Microservice[] }
 | { type: 'CREATE_SERVICE_SUCCESS'; payload: Microservice }
 | { type: 'UPDATE_SERVICE_SUCCESS'; payload: Microservice }
 | { type: 'DELETE_SERVICE_SUCCESS'; payload: string }
 | { type: 'SET_ERROR'; payload: string | null };

