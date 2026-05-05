import React, { useState, useEffect } from 'react';
import api from '../services/httpServices';
import ImageCropper from '../components/ImageCropper';

const DashboardProducts = ({
  products,
  availableIngredients,
  categories,
  loading,
  message,
  onMessage,
  onDataChange
}) => {
  // ── List / Add-new state ──
  const [showAddForm, setShowAddForm]         = useState(false);
  const [newProduct, setNewProduct]           = useState({ name: '', description: '', price: '', category: '', image: '' });
  const [isAddSubmitting, setIsAddSubmitting] = useState(false);
  const [addImageFile, setAddImageFile]       = useState(null);
  const [addImagePreview, setAddImagePreview] = useState(null);
  const [isUploadingAddImage, setIsUploadingAddImage] = useState(false);
  const [searchTerm, setSearchTerm]           = useState('');
  const [filterCategory, setFilterCategory]   = useState('');

  // ── Manage-view state ──
  const [managingProduct, setManagingProduct] = useState(null);
  const [cakeForm, setCakeForm]               = useState({});
  const [cakeImageFile, setCakeImageFile]     = useState(null);
  const [cakeImagePreview, setCakeImagePreview] = useState(null);
  const [isUploadingCakeImage, setIsUploadingCakeImage] = useState(false);
  const [isSavingCake, setIsSavingCake]       = useState(false);
  const [recipeRows, setRecipeRows]           = useState([]);
  const [isSavingRecipe, setIsSavingRecipe]   = useState(false);

  // ── Image cropper state ──
  const [cropperSrc, setCropperSrc]         = useState(null);
  const [cropperFileName, setCropperFileName] = useState('');
  const [cropperTarget, setCropperTarget]   = useState(null); // 'add' | 'manage'

  const filteredProducts = products.filter((p) => {
    const matchesSearch   = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Initialize manage view whenever the managed cake ID changes
  useEffect(() => {
    if (!managingProduct) return;
    const latest = products.find(p => p._id === managingProduct._id) || managingProduct;
    setCakeForm({
      name:        latest.name        || '',
      description: latest.description || '',
      price:       latest.price       || '',
      category:    latest.category    || '',
      image:       latest.image       || ''
    });
    setCakeImageFile(null);
    setCakeImagePreview(latest.image || null);
    setRecipeRows((latest.ingredients || []).map(ri => ({
      ingredientId: ri.ingredientId?._id || ri.ingredientId || '',
      totalCost:    ri.totalCost  ?? '',
      measure:      ri.measure    ?? '',
      each:         ri.each       ?? '',
      totalEach:    ri.totalEach  ?? '',
    })));
  }, [managingProduct?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Category helper ──
  const categoryOptions = (categories || []).map(cat => (
    <option key={cat._id} value={cat.slug}>{cat.name}</option>
  ));

  // ── Image: open cropper ──
  const openCropper = (file, target) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      onMessage('Invalid file type. Please upload JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onMessage('File size exceeds 10MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropperSrc(reader.result);
      setCropperFileName(file.name);
      setCropperTarget(target);
    };
    reader.readAsDataURL(file);
  };

  const handleCropDone = (croppedFile) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (cropperTarget === 'add') {
        setAddImageFile(croppedFile);
        setAddImagePreview(reader.result);
      } else {
        setCakeImageFile(croppedFile);
        setCakeImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(croppedFile);
    setCropperSrc(null);
  };

  const handleCropCancel = () => setCropperSrc(null);

  // ── Upload helper ──
  const uploadImageFile = async (file, productId, setUploading) => {
    if (!file) return null;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      const response = await api.post(
        `/images/upload?resourceType=cakes&resourceId=${productId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (response.status === 201 && response.data.data) {
        return response.data.data.secure_url;
      }
    } catch (error) {
      onMessage('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
    return null;
  };

  // ── Add-new handlers ──
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setIsAddSubmitting(true);
      let imageUrl = newProduct.image;
      if (addImageFile) {
        imageUrl = await uploadImageFile(addImageFile, 'temp-' + Date.now(), setIsUploadingAddImage);
        if (!imageUrl) { setIsAddSubmitting(false); return; }
      }
      await api.post('/admin/cakes', { ...newProduct, image: imageUrl });
      onMessage('Product added successfully!');
      resetAddForm();
      onDataChange();
    } catch (error) {
      onMessage('Error saving product: ' + error.message);
    } finally {
      setIsAddSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setShowAddForm(false);
    setNewProduct({ name: '', description: '', price: '', category: '', image: '' });
    setAddImageFile(null);
    setAddImagePreview(null);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/cakes/${id}`);
        onMessage('Product deleted successfully!');
        onDataChange();
      } catch (error) {
        onMessage('Error deleting product: ' + error.message);
      }
    }
  };

  // ── Manage-view: cake details save ──
  const handleSaveCakeDetails = async (e) => {
    e.preventDefault();
    try {
      setIsSavingCake(true);
      let imageUrl = cakeForm.image;
      if (cakeImageFile) {
        imageUrl = await uploadImageFile(cakeImageFile, managingProduct._id, setIsUploadingCakeImage);
        if (!imageUrl) { setIsSavingCake(false); return; }
      }
      await api.put(`/admin/cakes/${managingProduct._id}`, { ...cakeForm, image: imageUrl });
      onMessage('Cake details updated successfully!');
      setCakeForm(f => ({ ...f, image: imageUrl }));
      setCakeImageFile(null);
      setCakeImagePreview(imageUrl);
      onDataChange();
    } catch (error) {
      onMessage('Error updating cake: ' + error.message);
    } finally {
      setIsSavingCake(false);
    }
  };

  // ── Manage-view: recipe ingredient handlers ──
  const addRecipeRow = () =>
    setRecipeRows([...recipeRows, { ingredientId: '', totalCost: '', measure: '', each: '', totalEach: '' }]);

  const removeRecipeRow = (index) =>
    setRecipeRows(recipeRows.filter((_, i) => i !== index));

  const updateRecipeRow = (index, field, value) => {
    const updated = [...recipeRows];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeRows(updated);
  };

  const handleSaveRecipe = async () => {
    for (const row of recipeRows) {
      if (!row.ingredientId || row.totalCost === '' || row.measure === '' || row.each === '' || row.totalEach === '') {
        onMessage('Please fill in all fields for each ingredient row');
        return;
      }
    }
    try {
      setIsSavingRecipe(true);
      await api.put('/admin/recipe-ingredients', {
        cakeId:      managingProduct._id,
        ingredients: recipeRows.map(row => ({
          ingredientId: row.ingredientId,
          totalCost:    parseFloat(row.totalCost),
          measure:      row.measure,
          each:         parseFloat(row.each),
          totalEach:    parseFloat(row.totalEach),
        }))
      });
      onMessage('Recipe ingredients saved successfully!');
      onDataChange();
    } catch (error) {
      onMessage('Error saving recipe: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const computeRowCost = (row) => {
    const tc = parseFloat(row.totalCost);
    const m  = parseFloat(row.measure);
    const e  = parseFloat(row.each);
    if (!isNaN(tc) && !isNaN(m) && !isNaN(e) && m > 0) return ((tc / m) * e).toFixed(2);
    return null;
  };

  const totalRecipeCost = recipeRows.reduce((sum, row) => {
    const c = parseFloat(computeRowCost(row));
    return isNaN(c) ? sum : sum + c;
  }, 0);

  // ── Shared image upload UI ──
  const renderImageUploader = (target, imageFile, imagePreview, existingUrl, disabled) => {
    const preview = imagePreview || existingUrl;
    return (
      <div className="img-uploader">
        <input
          type="file" accept="image/*"
          id={`${target}-image-input`}
          style={{ display: 'none' }}
          disabled={disabled}
          onChange={(e) => { const f = e.target.files[0]; if (f) { openCropper(f, target); e.target.value = ''; } }}
        />
        <div
          className="img-upload-zone"
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault(); e.stopPropagation();
            const f = e.dataTransfer.files[0];
            if (f && !disabled) openCropper(f, target);
          }}
        >
          <label htmlFor={`${target}-image-input`} className={`img-upload-trigger${disabled ? ' disabled' : ''}`}>
            {preview ? (
              <>
                <img src={preview} alt="Product" className="img-upload-preview" />
                <div className="img-upload-overlay"><span>Change Image</span></div>
              </>
            ) : (
              <div className="img-upload-empty">
                <div className="img-upload-plus">+</div>
                <div className="img-upload-cta">Upload Image</div>
                <div className="img-upload-sub">Click or drag &amp; drop<br />JPEG · PNG · WebP</div>
              </div>
            )}
          </label>
        </div>
        <div className="img-upload-meta">
          {imageFile ? (
            <>
              <span className="img-upload-filename">{imageFile.name}</span>
              <span className="img-upload-filesize">{(imageFile.size / 1024).toFixed(0)} KB · 800×800</span>
              <button
                type="button"
                className="img-upload-remove"
                onClick={() => {
                  if (target === 'add') { setAddImageFile(null); setAddImagePreview(null); }
                  else { setCakeImageFile(null); setCakeImagePreview(existingUrl || null); }
                }}
              >Remove</button>
            </>
          ) : (
            <span className="img-upload-hint">{existingUrl ? 'Hover image to replace' : 'No image selected'}</span>
          )}
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // MANAGE VIEW
  // ─────────────────────────────────────────────────────────────
  if (managingProduct) {
    return (
      <div className="dashboard-section">
        {cropperSrc && (
          <ImageCropper src={cropperSrc} fileName={cropperFileName} onCrop={handleCropDone} onCancel={handleCropCancel} />
        )}

        {/* Back header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button
            className="dashboard-btn-secondary"
            onClick={() => setManagingProduct(null)}
            style={{ padding: '8px 16px' }}
          >
            ← Back
          </button>
          <div>
            <h2 style={{ margin: 0, textTransform: 'capitalize' }}>{managingProduct.name}</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: 2 }}>
              Manage cake details and recipe ingredients
            </div>
          </div>
        </div>

        {/* ── Section 1: Cake Details ── */}
        <div className="dashboard-form" style={{ marginBottom: 28 }}>
          <h3>Cake Details</h3>
          <form onSubmit={handleSaveCakeDetails}>
            <div className="product-form-layout">
              <div className="product-form-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" value={cakeForm.name || ''} onChange={(e) => setCakeForm({ ...cakeForm, name: e.target.value })} required disabled={isSavingCake} />
                  </div>
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input type="number" step="0.01" value={cakeForm.price || ''} onChange={(e) => setCakeForm({ ...cakeForm, price: e.target.value })} required disabled={isSavingCake} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea value={cakeForm.description || ''} onChange={(e) => setCakeForm({ ...cakeForm, description: e.target.value })} required disabled={isSavingCake} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={cakeForm.category || ''} onChange={(e) => setCakeForm({ ...cakeForm, category: e.target.value })} disabled={isSavingCake}>
                    <option value="">— No category —</option>
                    {categoryOptions}
                  </select>
                  {(categories || []).length === 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--warm-gray)', marginTop: 4 }}>
                      No categories yet — create them in the Categories tab.
                    </div>
                  )}
                </div>
              </div>
              <div className="product-form-image">
                <div className="form-group">
                  <label>Product Image</label>
                  {renderImageUploader('manage', cakeImageFile, cakeImagePreview, cakeForm.image, isSavingCake)}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="dashboard-btn-primary" disabled={isSavingCake || isUploadingCakeImage}>
                {isSavingCake ? 'Saving...' : 'Save Details'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Section 2: Recipe Ingredients ── */}
        <div className="dashboard-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0 }}>Recipe Ingredients</h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--warm-gray)' }}>
              Est. Cost: <span style={{ fontWeight: 700, color: 'var(--charcoal)', fontSize: '1rem' }}>${totalRecipeCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="dashboard-table-container" style={{ marginBottom: 15, overflowX: 'auto' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Pkg Cost ($)</th>
                  <th>Pkg Qty</th>
                  <th>Qty / Cake</th>
                  <th>Total Qty</th>
                  <th>Cost / Cake</th>
                  <th style={{ textAlign: 'center' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {recipeRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                      No recipe ingredients yet — click "+ Add Ingredient" below.
                    </td>
                  </tr>
                ) : (
                  recipeRows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <select value={row.ingredientId} onChange={(e) => updateRecipeRow(index, 'ingredientId', e.target.value)}
                          style={{ width: 150, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' }}>
                          <option value="">-- Select --</option>
                          {availableIngredients.map(ing => (
                            <option key={ing._id} value={ing._id}>{ing.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input type="number" step="0.01" min="0" value={row.totalCost}
                          onChange={(e) => updateRecipeRow(index, 'totalCost', e.target.value)}
                          style={{ width: 90, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' }} />
                      </td>
                      <td>
                        <input type="number" step="0.01" min="0" value={row.measure}
                          onChange={(e) => updateRecipeRow(index, 'measure', e.target.value)}
                          style={{ width: 90, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' }} />
                      </td>
                      <td>
                        <input type="number" step="0.01" min="0" value={row.each}
                          onChange={(e) => updateRecipeRow(index, 'each', e.target.value)}
                          style={{ width: 90, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' }} />
                      </td>
                      <td>
                        <input type="number" step="0.01" min="0" value={row.totalEach}
                          onChange={(e) => updateRecipeRow(index, 'totalEach', e.target.value)}
                          style={{ width: 90, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.9rem' }} />
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: '#059669' }}>
                        {computeRowCost(row) !== null ? `$${computeRowCost(row)}` : '—'}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="dashboard-btn-small delete" onClick={() => removeRecipeRow(index)}>✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="dashboard-btn-secondary" onClick={addRecipeRow}>+ Add Ingredient</button>
            <button className="dashboard-btn-primary" onClick={handleSaveRecipe} disabled={isSavingRecipe}>
              {isSavingRecipe ? 'Saving...' : 'Save Recipe'}
            </button>
          </div>

          <div className="info-box blue" style={{ marginTop: 16 }}>
            Cost formula: (Package Cost ÷ Package Qty) × Qty per Cake — e.g. ($10 ÷ 1000g) × 250g = $2.50
          </div>
        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-section">
      {cropperSrc && (
        <ImageCropper src={cropperSrc} fileName={cropperFileName} onCrop={handleCropDone} onCancel={handleCropCancel} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0 }}>Manage Products</h2>
        <button
          className="dashboard-btn-primary"
          onClick={() => { if (showAddForm) resetAddForm(); else setShowAddForm(true); }}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add-new form */}
      {showAddForm && (
        <div className="dashboard-form" style={{ marginBottom: '25px' }}>
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="product-form-layout">
              <div className="product-form-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input type="text" placeholder="e.g., Chocolate Cake" value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required disabled={isAddSubmitting} />
                  </div>
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input type="number" step="0.01" placeholder="29.99" value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required disabled={isAddSubmitting} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea placeholder="Describe the product..." value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} required disabled={isAddSubmitting} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} disabled={isAddSubmitting}>
                    <option value="">— No category —</option>
                    {categoryOptions}
                  </select>
                  {(categories || []).length === 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--warm-gray)', marginTop: 4 }}>
                      No categories yet — create them in the Categories tab first.
                    </div>
                  )}
                </div>
              </div>
              <div className="product-form-image">
                <div className="form-group">
                  <label>Product Image</label>
                  {renderImageUploader('add', addImageFile, addImagePreview, null, isAddSubmitting)}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="dashboard-btn-primary"
                disabled={isAddSubmitting || isUploadingAddImage || !newProduct.name || !newProduct.price || !newProduct.description || !addImageFile}>
                {isAddSubmitting ? 'Saving...' : 'Add Product'}
              </button>
              <button type="button" className="dashboard-btn-secondary" onClick={resetAddForm} disabled={isAddSubmitting}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Filter */}
      <div className="table-toolbar" style={{ borderRadius: 'var(--r-lg)', marginBottom: 16 }}>
        <input type="text" className="table-search" placeholder="Search products…"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="table-filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {(categories || []).map(cat => (
            <option key={cat._id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="dashboard-table-container">
        {loading ? (
          <div className="table-empty">Loading products…</div>
        ) : filteredProducts.length === 0 ? (
          <div className="table-empty">
            <div className="table-empty-icon">🍰</div>
            {searchTerm || filterCategory ? 'No products found' : 'No products yet. Click "+ Add Product" to get started!'}
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Recipe Cost</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const recipeCost = (product.ingredients || []).reduce((sum, ri) => {
                  const c = (parseFloat(ri.totalCost) / parseFloat(ri.measure)) * parseFloat(ri.each);
                  return isNaN(c) ? sum : sum + c;
                }, 0);
                const cat = (categories || []).find(c => c.slug === product.category);
                return (
                  <tr key={product._id}>
                    <td>
                      <div className="td-with-thumb">
                        {product.image
                          ? <img src={product.image} alt={product.name} className="product-thumb" />
                          : <div className="product-thumb-placeholder" />
                        }
                        <span className="td-primary">{product.name}</span>
                      </div>
                    </td>
                    <td>
                      {cat ? (
                        <span style={{
                          display: 'inline-block', padding: '3px 12px', borderRadius: 20,
                          fontSize: '0.78rem', fontWeight: 600, color: '#fff',
                          background: cat.color || '#6366f1',
                        }}>{cat.name}</span>
                      ) : product.category ? (
                        <span className="badge badge-blue">{product.category.replace(/_/g, ' ')}</span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>—</span>
                      )}
                    </td>
                    <td className="td-primary">${parseFloat(product.price).toFixed(2)}</td>
                    <td className="td-muted">{recipeCost > 0 ? `$${recipeCost.toFixed(2)}` : '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="dashboard-btn-small edit" onClick={() => setManagingProduct(product)}>
                        Manage
                      </button>
                      <button className="dashboard-btn-small delete" onClick={() => handleDeleteProduct(product._id)} style={{ marginLeft: 6 }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary strip */}
      <div className="summary-strip summary-strip-3">
        <div className="summary-item">
          <div className="summary-item-value">{products.length}</div>
          <div className="summary-item-label">Total Products</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-value">{filteredProducts.length}</div>
          <div className="summary-item-label">Showing</div>
        </div>
        <div className="summary-item">
          <div className="summary-item-value">
            ${products.length > 0
              ? (products.reduce((s, p) => s + parseFloat(p.price), 0) / products.length).toFixed(2)
              : '0.00'}
          </div>
          <div className="summary-item-label">Avg Price</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardProducts;
