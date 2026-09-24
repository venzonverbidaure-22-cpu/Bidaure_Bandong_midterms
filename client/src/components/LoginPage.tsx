import React, { useState } from 'react';
import { useMicroContext } from '../context/MicroContext';

export const LoginPage: React.FC = () => {
  const { dispatch } = useMicroContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        dispatch({ type: 'SET_AUTH', payload: { user: data.user, token: data.token } });
      } else {
        // Zod validation errors come as an array of issues
        if (data.issues) {
          setError(data.issues.map((i: any) => i.message).join(', '));
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (err: any) {
      setError('Network error. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Decorative orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="login-header">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#logo-gradient)" />
              <path d="M12 20C12 15.5 15.5 12 20 12C24.5 12 28 15.5 28 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 20C16 17.8 17.8 16 20 16C22.2 16 24 17.8 24 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="20" r="2" fill="white" />
              <path d="M20 22V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>PulseDesk</h1>
          <p className="login-subtitle">Incident Management Platform</p>
        </div>

        {error && (
          <div className="error-banner">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 10a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pulse.dev"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="login-hint">
          Use any email and password (min 6 chars) to sign in
        </p>
      </div>
    </div>
  );
};
