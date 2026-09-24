import React, { useEffect, useState } from 'react';
import { useIncidentContext } from '../context/MicroContext';
import { IncidentCard } from './IncidentCard';
import type { Incident } from '../types';

export const Dashboard: React.FC = () => {
  const { state, dispatch } = useIncidentContext();

  // Create incident form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Incident['severity']>('MEDIUM');
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // ── Fetch Incidents ──────────────────────────────────────────────────────
  const fetchIncidents = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/incidents', {
        headers: { Authorization: `Bearer ${state.token}` },
      });
      const data = await response.json();
      if (response.ok) {
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message || 'Failed to fetch' });
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  useEffect(() => {
    if (state.token) fetchIncidents();
  }, [state.token]);

  // ── Create Incident ──────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ title, description, severity }),
      });

      const data = await response.json();
      if (response.ok) {
        dispatch({ type: 'CREATE_SUCCESS', payload: data });
        setTitle('');
        setDescription('');
        setSeverity('MEDIUM');
        setShowForm(false);
      } else {
        if (data.issues) {
          dispatch({
            type: 'SET_ERROR',
            payload: data.issues.map((i: any) => i.message).join(', '),
          });
        } else {
          dispatch({ type: 'SET_ERROR', payload: data.message || 'Create failed' });
        }
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      setIsCreating(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // ── Filter Incidents ─────────────────────────────────────────────────────
  const filteredIncidents = state.incidents.filter((inc) => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
    return true;
  });

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    total: state.incidents.length,
    open: state.incidents.filter((i) => i.status === 'OPEN').length,
    critical: state.incidents.filter((i) => i.severity === 'CRITICAL').length,
    resolved: state.incidents.filter((i) => i.status === 'RESOLVED').length,
  };

  return (
    <div className="dashboard">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-sm">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="url(#logo-gradient-sm)" />
              <path d="M12 20C12 15.5 15.5 12 20 12C24.5 12 28 15.5 28 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 20C16 17.8 17.8 16 20 16C22.2 16 24 17.8 24 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="20" r="2" fill="white" />
              <path d="M20 22V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="logo-gradient-sm" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="header-title">PulseDesk</h1>
        </div>
        <div className="header-right">
          <span className="user-email">{state.user?.email}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* ── Stats Cards ───────────────────────────────────────────────── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Incidents</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-open">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.open}</span>
              <span className="stat-label">Open</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-critical">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="7.86,2 16.14,2 22,7.86 22,16.14 16.14,22 7.86,22 2,16.14 2,7.86" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.critical}</span>
              <span className="stat-label">Critical</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-resolved">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.resolved}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        </div>

        {/* ── Error Banner ──────────────────────────────────────────────── */}
        {state.error && (
          <div className="error-banner dashboard-error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 10a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            <span>{state.error}</span>
            <button className="btn-icon" onClick={() => dispatch({ type: 'SET_ERROR', payload: '' })}>
              ✕
            </button>
          </div>
        )}

        {/* ── Toolbar ───────────────────────────────────────────────────── */}
        <div className="toolbar">
          <div className="toolbar-filters">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="select-input"
            >
              <option value="ALL">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="select-input"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>✕ Cancel</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Incident
              </>
            )}
          </button>
        </div>

        {/* ── Create Form ───────────────────────────────────────────────── */}
        {showForm && (
          <div className="create-form-wrapper">
            <form onSubmit={handleCreate} className="create-form">
              <h3>Report New Incident</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="incident-title">Title</label>
                  <input
                    id="incident-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief incident title..."
                    required
                    minLength={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="incident-severity">Severity</label>
                  <select
                    id="incident-severity"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as Incident['severity'])}
                    className="select-input"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="incident-description">Description</label>
                <textarea
                  id="incident-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of the incident..."
                  required
                  minLength={5}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={isCreating}>
                  {isCreating ? <span className="spinner" /> : 'Create Incident'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Incidents Grid ────────────────────────────────────────────── */}
        {state.loading ? (
          <div className="loading-state">
            <span className="spinner spinner-lg" />
            <p>Loading incidents...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h3>No incidents found</h3>
            <p>
              {state.incidents.length === 0
                ? 'Create your first incident to get started'
                : 'No incidents match the current filters'}
            </p>
          </div>
        ) : (
          <div className="incidents-grid">
            {filteredIncidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
