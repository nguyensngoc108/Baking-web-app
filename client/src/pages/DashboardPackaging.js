import React, { useState } from 'react';
import api from '../services/httpServices';

const DashboardPackaging = ({ packagingOptions, loading, message, onMessage, onDataChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState(null);
  const [newPackaging, setNewPackaging] = useState({ name: '', price: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPackaging = packagingOptions.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPackaging = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingPackaging) {
        await api.put(`/admin/packaging-options/${editingPackaging._id}`, {
          name: newPackaging.name,
          price: parseFloat(newPackaging.price)
        });
        onMessage('Packaging option updated successfully!');
      } else {
        await api.post('/admin/packaging-options', {
          name: newPackaging.name,
          price: parseFloat(newPackaging.price)
        });
        onMessage('Packaging option added successfully!');
      }
      resetForm();
      onDataChange();
    } catch (error) {
      onMessage('Error saving packaging: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPackaging = (pkg) => {
    setEditingPackaging(pkg);
    setNewPackaging({ name: pkg.name, price: pkg.price });
    setShowAddForm(true);
  };

  const handleDeletePackaging = async (id) => {
    if (window.confirm('Are you sure you want to delete this packaging option?')) {
      try {
        setIsSubmitting(true);
        await api.delete(`/admin/packaging-options/${id}`);
        onMessage('Packaging option deleted successfully!');
        onDataChange();
      } catch (error) {
        onMessage('Error deleting packaging: ' + error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleToggleStatus = async (pkg) => {
    try {
      setIsSubmitting(true);
      await api.put(`/admin/packaging-options/${pkg._id}`, {
        isActive: !pkg.isActive
      });
      onMessage(`Packaging ${!pkg.isActive ? 'activated' : 'deactivated'} successfully!`);
      onDataChange();
    } catch (error) {
      onMessage('Error updating packaging: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingPackaging(null);
    setNewPackaging({ name: '', price: '' });
  };

  return (
    <div className="dashboard-section">
      {/* Header with Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0 }}>Packaging Options</h2>
        <button
          className="dashboard-btn-primary"
          onClick={() => {
            if (showAddForm) {
              resetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          style={{
            padding: '10px 20px',
            fontSize: '0.95rem'
          }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Packaging'}
        </button>
      </div>

      {/* Add/Edit Packaging Form - Hidden by Default */}
      {showAddForm && (
        <div className="dashboard-form" style={{ marginBottom: '25px', backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb' }}>
          <h3>{editingPackaging ? 'Edit Packaging Option' : 'Add New Packaging Option'}</h3>
          <form onSubmit={handleAddPackaging}>
            <div className="form-row">
              <div className="form-group">
                <label>Packaging Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Premium Box, Standard Box..."
                  value={newPackaging.name}
                  onChange={(e) => setNewPackaging({ ...newPackaging, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="5.00"
                  value={newPackaging.price}
                  onChange={(e) => setNewPackaging({ ...newPackaging, price: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="dashboard-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : editingPackaging ? 'Update Packaging' : 'Add Packaging'}
              </button>
              <button
                type="button"
                className="dashboard-btn-secondary"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="table-toolbar" style={{ borderRadius: 'var(--r-lg)', marginBottom: 16 }}>
        <input
          type="text"
          className="table-search"
          placeholder="Search packaging…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Packaging Options Table */}
      <div className="dashboard-table-container">
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading packaging options...</p>
        ) : filteredPackaging.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
            {searchTerm ? 'No packaging found' : 'No packaging options yet. Click "Add Packaging" to get started!'}
          </p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Name</th>
                <th style={{ width: '15%' }}>Price</th>
                <th style={{ width: '20%' }}>Status</th>
                <th style={{ textAlign: 'center', width: '25%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackaging.map((pkg) => (
                <tr key={pkg._id}>
                  <td style={{ fontWeight: '600', color: '#2563eb', textTransform: 'capitalize' }}>
                    {pkg.name}
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    ${parseFloat(pkg.price).toFixed(2)}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(pkg)}
                      disabled={isSubmitting}
                      className={`status ${pkg.isActive ? 'active' : 'inactive'}`}
                      style={{
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {pkg.isActive ? '✓ Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="dashboard-btn-small edit"
                      onClick={() => handleEditPackaging(pkg)}
                      disabled={isSubmitting}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="dashboard-btn-small delete"
                      onClick={() => handleDeletePackaging(pkg._id)}
                      disabled={isSubmitting}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary strip */}
      <div className="summary-strip summary-strip-3">
        <div className="summary-item">
          <div className="summary-item-value">{packagingOptions.length}</div>
          <div className="summary-item-label">Total Options</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-value">{packagingOptions.filter(p => p.isActive).length}</div>
          <div className="summary-item-label">Active</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-value">
            ${packagingOptions.length > 0
              ? (packagingOptions.reduce((s, p) => s + parseFloat(p.price), 0) / packagingOptions.length).toFixed(2)
              : '0.00'}
          </div>
          <div className="summary-item-label">Avg Cost</div>
        </div>
      </div>
    </div>
  );
};


export default DashboardPackaging;
