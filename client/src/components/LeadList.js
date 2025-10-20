import React from 'react';
import { leadsAPI } from '../services/api';
import './LeadList.css';

const LeadList = ({ leads, onEdit, onDelete, onRefresh }) => {
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await leadsAPI.updateStatus(leadId, newStatus);
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (leads.length === 0) {
    return (
      <div className="empty-state card">
        <div className="empty-icon">📭</div>
        <h3>No leads found</h3>
        <p>Start by adding your first lead</p>
      </div>
    );
  }

  return (
    <div className="lead-list">
      {leads.map((lead) => (
        <div key={lead.id} className="lead-card card">
          <div className="lead-header">
            <div className="lead-info">
              <h3 className="lead-name">{lead.name}</h3>
              <div className="lead-meta">
                {lead.email && (
                  <span className="meta-item">
                    📧 {lead.email}
                  </span>
                )}
                {lead.phone && (
                  <span className="meta-item">
                    📱 {lead.phone}
                  </span>
                )}
              </div>
            </div>
            <div className="lead-actions">
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                className={getStatusBadgeClass(lead.status)}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          <div className="lead-body">
            {lead.source && (
              <div className="lead-detail">
                <strong>Source:</strong> {lead.source}
              </div>
            )}
            {lead.budget && (
              <div className="lead-detail">
                <strong>Budget:</strong> {lead.budget}
              </div>
            )}
            {lead.notes && (
              <div className="lead-detail">
                <strong>Notes:</strong> {lead.notes}
              </div>
            )}
          </div>

          <div className="lead-footer">
            <span className="lead-date">
              Created {formatDate(lead.created_at)}
            </span>
            <div className="lead-buttons">
              <button
                onClick={() => onEdit(lead)}
                className="btn-secondary btn-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(lead.id)}
                className="btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadList;
