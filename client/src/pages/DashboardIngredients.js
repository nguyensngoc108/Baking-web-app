import React, { useState, useEffect } from 'react';
import api from '../services/httpServices';

const DashboardIngredients = ({
  ingredients,
  products,
  loading,
  message,
  onMessage,
  onDataChange
}) => {
  const [activeSubTab, setActiveSubTab] = useState('library');

  // Library state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Recipe ingredients state
  const [selectedCakeId, setSelectedCakeId] = useState('');
  const [recipeRows, setRecipeRows] = useState([]);
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCake = products.find(p => p._id === selectedCakeId);

  useEffect(() => {
    if (selectedCake) {
      const rows = (selectedCake.ingredients || []).map(ri => ({
        ingredientId: ri.ingredientId?._id || ri.ingredientId || '',
        totalCost: ri.totalCost ?? '',
        measure: ri.measure ?? '',
        each: ri.each ?? '',
        totalEach: ri.totalEach ?? '',
      }));
      setRecipeRows(rows);
    } else {
      setRecipeRows([]);
    }
  }, [selectedCakeId, products]);

  // --- Library handlers ---

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (!newIngredient.trim()) {
      onMessage('Please enter an ingredient name');
      return;
    }
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
    if (window.confirm('Are you sure you want to delete this ingredient? This will also remove it from all products.')) {
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

  // --- Recipe ingredient handlers ---

  const addRecipeRow = () => {
    setRecipeRows([...recipeRows, { ingredientId: '', totalCost: '', measure: '', each: '', totalEach: '' }]);
  };

  const removeRecipeRow = (index) => {
    setRecipeRows(recipeRows.filter((_, i) => i !== index));
  };

  const updateRecipeRow = (index, field, value) => {
    const updated = [...recipeRows];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeRows(updated);
  };

  const handleSaveRecipe = async () => {
    if (!selectedCakeId) {
      onMessage('Please select a cake first');
      return;
    }
    for (const row of recipeRows) {
      if (!row.ingredientId || row.totalCost === '' || row.measure === '' || row.each === '' || row.totalEach === '') {
        onMessage('Please fill in all fields for each ingredient row');
        return;
      }
    }
    try {
      setIsSavingRecipe(true);
      const ingredientPayload = recipeRows.map(row => ({
        ingredientId: row.ingredientId,
        totalCost: parseFloat(row.totalCost),
        measure: row.measure,
        each: parseFloat(row.each),
        totalEach: parseFloat(row.totalEach),
      }));
      await api.put('/admin/recipe-ingredients', { cakeId: selectedCakeId, ingredients: ingredientPayload });
      onMessage('Recipe ingredients saved successfully!');
      onDataChange();
    } catch (error) {
      onMessage('Error saving recipe: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const computeRowCost = (row) => {
    const totalCost = parseFloat(row.totalCost);
    const measure = parseFloat(row.measure);
    const each = parseFloat(row.each);
    if (!isNaN(totalCost) && !isNaN(measure) && !isNaN(each) && measure > 0) {
      return ((totalCost / measure) * each).toFixed(2);
    }
    return null;
  };

  const totalRecipeCost = recipeRows.reduce((sum, row) => {
    const cost = parseFloat(computeRowCost(row));
    return isNaN(cost) ? sum : sum + cost;
  }, 0);

  const subTabStyle = (tab) => ({
    padding: '10px 22px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: activeSubTab === tab ? '700' : '500',
    color: activeSubTab === tab ? '#2563eb' : '#6b7280',
    borderBottom: activeSubTab === tab ? '3px solid #2563eb' : '3px solid transparent',
    backgroundColor: 'transparent',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    marginBottom: '-2px',
  });

  return (
    <div className="dashboard-section">
      {/* Sub-tab navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e0e7ff', marginBottom: '25px' }}>
        <button style={subTabStyle('library')} onClick={() => setActiveSubTab('library')}>
          🥄 Ingredient Library
        </button>
        <button style={subTabStyle('recipe')} onClick={() => setActiveSubTab('recipe')}>
          📋 Recipe Ingredients
        </button>
      </div>

      {/* ── Ingredient Library ── */}
      {activeSubTab === 'library' && (
        <>
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
                <button type="submit" className="dashboard-btn-primary" disabled={isSubmitting} style={{ marginBottom: 0 }}>
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
              </form>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="🔍 Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #e0e7ff',
                borderRadius: '8px',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div className="dashboard-table-container">
            {loading ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading ingredients...</p>
            ) : filteredIngredients.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                {searchTerm ? 'No ingredients found' : 'No ingredients yet. Click "Add Ingredient" to get started!'}
              </p>
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

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #e0e7ff',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#6b7280'
          }}>
            <strong style={{ color: '#2563eb' }}>💡 Tip:</strong> These are the base ingredients available in your system. Assign them to cakes in the "Recipe Ingredients" tab.
            <br />
            <strong style={{ color: '#ef4444' }}>⚠️ Warning:</strong> Deleting an ingredient will remove it from all products that use it.
          </div>
        </>
      )}

      {/* ── Recipe Ingredients ── */}
      {activeSubTab === 'recipe' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <h2 style={{ margin: 0 }}>Recipe Ingredients</h2>
          </div>

          {/* Cake selector */}
          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Select a Cake to Edit</label>
            <select
              value={selectedCakeId}
              onChange={(e) => setSelectedCakeId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #e0e7ff',
                borderRadius: '8px',
                fontSize: '0.95rem',
                backgroundColor: 'white',
              }}
            >
              <option value="">-- Select a cake --</option>
              {(products || []).map(cake => (
                <option key={cake._id} value={cake._id}>{cake.name}</option>
              ))}
            </select>
          </div>

          {!selectedCakeId && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '12px',
              border: '2px dashed #e5e7eb',
            }}>
              <p style={{ fontSize: '2rem', margin: '0 0 10px 0' }}>🍰</p>
              <p style={{ margin: 0, fontSize: '1rem' }}>Select a cake above to manage its recipe ingredients</p>
            </div>
          )}

          {selectedCakeId && (
            <>
              {/* Cost summary */}
              <div style={{
                padding: '12px 20px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: '600', color: '#15803d' }}>Estimated Recipe Cost:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '700', color: '#15803d' }}>
                  ${totalRecipeCost.toFixed(2)}
                </span>
              </div>

              {/* Recipe table */}
              <div className="dashboard-table-container" style={{ marginBottom: '15px', overflowX: 'auto' }}>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th>Package Cost ($)</th>
                      <th>Package Qty</th>
                      <th>Qty per Cake</th>
                      <th>Total Qty</th>
                      <th>Cost / Cake</th>
                      <th style={{ textAlign: 'center' }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                          No recipe ingredients yet. Click "+ Add Ingredient" below.
                        </td>
                      </tr>
                    ) : (
                      recipeRows.map((row, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              value={row.ingredientId}
                              onChange={(e) => updateRecipeRow(index, 'ingredientId', e.target.value)}
                              style={{ width: '150px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                            >
                              <option value="">-- Select --</option>
                              {ingredients.map(ing => (
                                <option key={ing._id} value={ing._id} style={{ textTransform: 'capitalize' }}>{ing.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={row.totalCost}
                              onChange={(e) => updateRecipeRow(index, 'totalCost', e.target.value)}
                              style={{ width: '90px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="1000"
                              value={row.measure}
                              onChange={(e) => updateRecipeRow(index, 'measure', e.target.value)}
                              style={{ width: '90px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="250"
                              value={row.each}
                              onChange={(e) => updateRecipeRow(index, 'each', e.target.value)}
                              style={{ width: '90px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0"
                              value={row.totalEach}
                              onChange={(e) => updateRecipeRow(index, 'totalEach', e.target.value)}
                              style={{ width: '90px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '600', color: '#059669' }}>
                            {computeRowCost(row) !== null ? `$${computeRowCost(row)}` : '-'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              className="dashboard-btn-small delete"
                              onClick={() => removeRecipeRow(index)}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="dashboard-btn-secondary" onClick={addRecipeRow}>
                  + Add Ingredient
                </button>
                <button
                  className="dashboard-btn-primary"
                  onClick={handleSaveRecipe}
                  disabled={isSavingRecipe}
                >
                  {isSavingRecipe ? 'Saving...' : '💾 Save Recipe'}
                </button>
              </div>

              {/* Cost formula hint */}
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#fefce8',
                border: '1px solid #fef08a',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#713f12',
              }}>
                <strong>📐 How costs are calculated:</strong>
                <br />
                Cost per cake = (Package Cost ÷ Package Qty) × Qty per Cake
                <br />
                <span style={{ color: '#92400e' }}>Example: ($10 ÷ 1000) × 250 = $2.50 per cake</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardIngredients;
