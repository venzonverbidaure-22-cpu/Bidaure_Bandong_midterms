import React, { useState } from 'react';
import { useIncidentContext } from '../context/MicroContext';
import type { Incident } from '../types';

interface IncidentCardProps {
  incident: Incident;
}

const severityConfig = {
  LOW: { label: 'Low', className: 'severity-low' },
  MEDIUM: { label: 'Medium', className: 'severity-medium' },
  HIGH: { label: 'High', className: 'severity-high' },
  CRITICAL: { label: 'Critical', className: 'severity-critical' },
};

const statusConfig = {
  OPEN: { label: 'Open', className: 'status-open' },
  IN_PROGRESS: { label: 'In Progress', className: 'status-in-progress' },
  RESOLVED: { label: 'Resolved', className: 'status-resolved' },
  CLOSED: { label: 'Closed', className: 'status-closed' },
};

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident }) => {
  const { state, dispatch } = useIncidentContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const updateIncident = async (field: 'severity' | 'status', value: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        const updated = await response.json();
        dispatch({ type: 'UPDATE_SUCCESS', payload: updated });
      } else {
        const err = await response.json();
        dispatch({ type: 'SET_ERROR', payload: err.message || 'Update failed' });
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteIncident = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${state.token}` },
      });

      if (response.ok) {
        dispatch({ type: 'DELETE_SUCCESS', payload: incident.id });
      } else {
        const err = await response.json();
        dispatch({ type: 'SET_ERROR', payload: err.message || 'Delete failed' });
      }
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const sev = severityConfig[incident.severity];
  const stat = statusConfig[incident.status];

  return (
    <div className={`incident-card ${sev.className}`}>
      <div className="incident-card-header">
        <div className="incident-badges">
          <span className={`badge ${sev.className}`}>{sev.label}</span>
          <span className={`badge ${stat.className}`}>{stat.label}</span>
        </div>
        <div className="incident-actions">
          {!showConfirmDelete ? (
            <button
              className="btn-icon btn-delete"
              onClick={() => setShowConfirmDelete(true)}
              title="Delete incident"
              disabled={isUpdating}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
              </svg>
            </button>
          ) : (
            <div className="confirm-delete">
              <button
                className="btn btn-sm btn-danger"
                onClick={deleteIncident}
                disabled={isDeleting}
              >
                {isDeleting ? '...' : 'Confirm'}
              </button>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="incident-title">{incident.title}</h3>
      <p className="incident-description">{incident.description}</p>

      <div className="incident-controls">
        <div className="control-group">
          <label>Severity</label>
          <select
            value={incident.severity}
            onChange={(e) => updateIncident('severity', e.target.value)}
            disabled={isUpdating}
            className={`select-input ${sev.className}`}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="control-group">
          <label>Status</label>
          <select
            value={incident.status}
            onChange={(e) => updateIncident('status', e.target.value)}
            disabled={isUpdating}
            className={`select-input ${stat.className}`}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {incident.createdAt && (
        <div className="incident-meta">
          Created {new Date(incident.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
};
