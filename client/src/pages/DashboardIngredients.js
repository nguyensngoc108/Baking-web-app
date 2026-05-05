import React, { useState } from 'react';
import api from '../services/httpServices';

const DashboardIngredients = ({ ingredients, loading, onMessage, onDataChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [searchTerm, setSearchTerm]       = useState('');

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newIngredient.trim()) { onMessage('Please enter an ingredient name'); return; }
    try {
      setIsSubmitting(true);
      await api.post('/admin/ingredients', { name: newIngredient });
      onMessage('Ingredient added successfully!');
      setNewIngredient('');
      setShowAddForm(false);
      onDataChange();
    } catch (error) {
      onMessage('Error adding ingredient: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (window.confirm('Are you sure? This will also remove the ingredient from all product recipes.')) {
      try {
        setIsSubmitting(true);
        await api.delete(`/admin/ingredients/${id}`);
        onMessage('Ingredient deleted successfully!');
        onDataChange();
      } catch (error) {
        onMessage('Error deleting ingredient: ' + error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="dashboard-section">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0 }}>Ingredient Library</h2>
        <button
          className="dashboard-btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Ingredient'}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="dashboard-form" style={{ marginBottom: '25px', backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb' }}>
          <h3>Add New Ingredient</h3>
          <form onSubmit={handleAddIngredient} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Ingredient Name *</label>
              <input
                type="text"
                placeholder="e.g., All-Purpose Flour, Butter, Eggs..."
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <button type="submit" className="dashboard-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="table-toolbar" style={{ borderRadius: 'var(--r-lg)', marginBottom: 16 }}>
        <input
          type="text"
          className="table-search"
          placeholder="Search ingredients…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="dashboard-table-container">
        {loading ? (
          <div className="table-empty">Loading ingredients…</div>
        ) : filteredIngredients.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">🥄</div>
            {searchTerm ? 'No ingredients found' : 'No ingredients yet. Click "+ Add Ingredient" to get started!'}
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '70%' }}>Ingredient Name</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ingredient) => (
                <tr key={ingredient._id}>
                  <td style={{ textTransform: 'capitalize' }}>{ingredient.name}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="dashboard-btn-small delete"
                      onClick={() => handleDeleteIngredient(ingredient._id)}
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

      {/* Tip */}
      <div style={{ marginTop: 20, padding: '15px', backgroundColor: '#f0f9ff', border: '1px solid #e0e7ff', borderRadius: 8, fontSize: '0.9rem', color: '#6b7280' }}>
        <strong style={{ color: '#2563eb' }}>💡 Tip:</strong> These are the base ingredients available in your system.
        Assign them to cakes via <strong>Products → Manage</strong>.
        <br />
        <strong style={{ color: '#ef4444' }}>⚠️ Warning:</strong> Deleting an ingredient removes it from all product recipes.
      </div>

      {/* Summary strip */}
      <div className="summary-strip summary-strip-3" style={{ marginTop: 20 }}>
        <div className="summary-item">
          <div className="summary-item-value">{ingredients.length}</div>
          <div className="summary-item-label">Total Ingredients</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-value">{filteredIngredients.length}</div>
          <div className="summary-item-label">Showing</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-value">{ingredients.length - filteredIngredients.length > 0 ? `${ingredients.length - filteredIngredients.length} hidden` : 'All'}</div>
          <div className="summary-item-label">Filter</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardIngredients;
