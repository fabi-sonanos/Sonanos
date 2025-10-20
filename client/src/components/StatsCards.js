import React from 'react';
import './StatsCards.css';

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: 'Total Leads',
      value: stats.total || 0,
      color: '#3b82f6',
      icon: '📊',
    },
    {
      title: 'New',
      value: stats.new || 0,
      color: '#6366f1',
      icon: '🆕',
    },
    {
      title: 'Contacted',
      value: stats.contacted || 0,
      color: '#f59e0b',
      icon: '📞',
    },
    {
      title: 'Qualified',
      value: stats.qualified || 0,
      color: '#8b5cf6',
      icon: '⭐',
    },
    {
      title: 'Converted',
      value: stats.converted || 0,
      color: '#10b981',
      icon: '✅',
    },
    {
      title: 'Lost',
      value: stats.lost || 0,
      color: '#ef4444',
      icon: '❌',
    },
  ];

  const conversionRate = stats.total > 0
    ? ((stats.converted / stats.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="stats-container">
      <div className="stats-grid">
        {cards.map((card, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <p className="stat-title">{card.title}</p>
              <h3 className="stat-value">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="conversion-card card">
        <h3>Conversion Rate</h3>
        <div className="conversion-rate">
          <span className="rate-value">{conversionRate}%</span>
          <p className="rate-description">
            {stats.converted} converted out of {stats.total} total leads
          </p>
        </div>
        <div className="conversion-bar">
          <div
            className="conversion-fill"
            style={{ width: `${conversionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
