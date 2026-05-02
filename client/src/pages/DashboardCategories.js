import React, { useState } from 'react';
import api from '../services/httpServices';

const PRESET_COLORS = [
  '#6366f1', '#2563eb', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#9333ea', '#db2777',
];

const DashboardCategories = ({ categories, loading, onMessage, onDataChange }) => {
  const [showForm, setShowForm]         = useState(false);
  const [editingCat, setEditingCat]     = useState(null);
  const [form, setForm]                 = useState({ name: '', description: '', color: '#6366f1' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const resetForm = () => {
    setShowForm(false);
    setEditingCat(null);
    setForm({ name: '', description: '', color: '#6366f1' });
  };

  const openEdit = (cat) => {
    setEditingCat(cat);
    setForm({ name: cat.name, description: cat.description || '', color: cat.color || '#6366f1' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingCat) {
        await api.put(`/admin/categories/${editingCat._id}`, form);
        onMessage('Category updated successfully!');
      } else {
        await api.post('/admin/categories', form);
        onMessage('Category created successfully!');
      }
      resetForm();
      onDataChange();
    } catch (error) {
      onMessage('Error saving category: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? Products assigned to this category will not be deleted.`)) return;
    try {
      await api.delete(`/admin/categories/${cat._id}`);
      onMessage('Category deleted.');
      onDataChange();
    } catch (error) {
      onMessage('Error deleting category: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="dashboard-section">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
        <h2 style={{ margin: 0 }}>Manage Categories</h2>
        <button
          className="dashboard-btn-primary"
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          {showForm ? '✕ Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="dashboard-form" style={{ marginBottom: 25, backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb' }}>
          <h3 style={{ marginTop: 0 }}>{editingCat ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Birthday Cakes"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Badge Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                        cursor: 'pointer', outline: form.color === c ? `3px solid ${c}` : '3px solid transparent',
                        outlineOffset: 2, transition: 'outline 0.15s',
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    title="Pick custom color"
                    style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #d1d5db', cursor: 'pointer', padding: 2 }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{form.color}</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                placeholder="Optional short description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            {/* Preview badge */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280', marginRight: 8 }}>Preview:</span>
              <span style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: 20,
                fontSize: '0.82rem', fontWeight: 600, color: '#fff',
                background: form.color || '#6366f1',
              }}>
                {form.name || 'Category Name'}
              </span>
            </div>

            <div className="form-actions">
              <button type="submit" className="dashboard-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" className="dashboard-btn-secondary" onClick={resetForm} disabled={isSubmitting}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="table-toolbar" style={{ borderRadius: 'var(--r-lg)', marginBottom: 16 }}>
        <input
          type="text"
          className="table-search"
          placeholder="Search categories…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="dashboard-table-container">
        {loading ? (
          <div className="table-empty">Loading categories…</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">🏷️</div>
            {searchTerm ? 'No categories found' : 'No categories yet. Click "+ Add Category" to create one.'}
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <span style={{
                      display: 'inline-block', padding: '4px 14px', borderRadius: 20,
                      fontSize: '0.82rem', fontWeight: 600, color: '#fff',
                      background: cat.color || '#6366f1',
                    }}>
                      {cat.name}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.82rem', background: '#f3f4f6', padding: '2px 8px', borderRadius: 4, color: '#374151' }}>
                      {cat.slug}
                    </code>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: '0.9rem' }}>{cat.description || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="dashboard-btn-small edit" onClick={() => openEdit(cat)}>✏️ Edit</button>
                    <button className="dashboard-btn-small delete" onClick={() => handleDelete(cat)} style={{ marginLeft: 6 }}>🗑️ Delete</button>
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
          <div className="summary-item-value">{categories.length}</div>
          <div className="summary-item-label">Total Categories</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-value">{filtered.length}</div>
          <div className="summary-item-label">Showing</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-value" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            {categories.length > 0 ? categories.map(c => c.name).slice(0, 2).join(', ') + (categories.length > 2 ? '…' : '') : '—'}
          </div>
          <div className="summary-item-label">Recent</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCategories;
