import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { leadsAPI } from '../services/api';
import StatsCards from './StatsCards';
import LeadList from './LeadList';
import LeadModal from './LeadModal';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leadsResponse, statsResponse] = await Promise.all([
        leadsAPI.getAll(),
        leadsAPI.getStats(),
      ]);
      setLeads(leadsResponse.data);
      setStats(statsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleCreateLead = () => {
    setSelectedLead(null);
    setShowModal(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsAPI.delete(leadId);
        await fetchData();
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedLead(null);
    fetchData();
  };

  const filteredLeads = filter === 'all'
    ? leads
    : leads.filter(lead => lead.status === filter);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Lead Dashboard</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div className="header-right">
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content container">
        <StatsCards stats={stats} />

        <div className="leads-section">
          <div className="section-header">
            <h2>Your Leads</h2>
            <div className="section-actions">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Leads ({leads.length})</option>
                <option value="new">New ({stats?.new || 0})</option>
                <option value="contacted">Contacted ({stats?.contacted || 0})</option>
                <option value="qualified">Qualified ({stats?.qualified || 0})</option>
                <option value="converted">Converted ({stats?.converted || 0})</option>
                <option value="lost">Lost ({stats?.lost || 0})</option>
              </select>
              <button onClick={handleCreateLead} className="btn-primary">
                + Add Lead
              </button>
            </div>
          </div>

          <LeadList
            leads={filteredLeads}
            onEdit={handleEditLead}
            onDelete={handleDeleteLead}
            onRefresh={fetchData}
          />
        </div>
      </div>

      {showModal && (
        <LeadModal
          lead={selectedLead}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default Dashboard;
