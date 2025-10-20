import React, { useState, useEffect } from 'react';
import { leadsAPI } from '../services/api';
import './LeadModal.css';

const LeadModal = ({ lead, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'new',
    source: '',
    budget: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'new',
        source: lead.source || '',
        budget: lead.budget || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (lead) {
        await leadsAPI.update(lead.id, formData);
      } else {
        await leadsAPI.create(formData);
      }
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save lead');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Lead name"
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="source">Source</label>
              <input
                id="source"
                name="source"
                type="text"
                value={formData.source}
                onChange={handleChange}
                placeholder="Website, Referral, etc."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="budget">Budget</label>
            <input
              id="budget"
              name="budget"
              type="text"
              value={formData.budget}
              onChange={handleChange}
              placeholder="$50,000 - $100,000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information about this lead..."
              rows={4}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : lead ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
