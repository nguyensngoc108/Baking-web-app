import React, { useState } from 'react';
import api from '../services/httpServices';

const DashboardProducts = ({ 
  products, 
  availableIngredients, 
  loading, 
  message, 
  onMessage, 
  onDataChange 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Birthday_Cakes',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Validate and process image file
  const processImageFile = (file) => {
    if (file) {
      // Validate file
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        onMessage('Invalid file type. Please upload JPEG, PNG, WebP, or GIF.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        onMessage('File size exceeds 5MB limit.');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processImageFile(file);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // Clear selected file
  const handleClearImageFile = () => {
    setImageFile(null);
    setImagePreview(editingProduct?.image || null);
  };

  // Upload image to server
  const handleImageUpload = async (productId) => {
    if (!imageFile) {
      onMessage('No image selected for upload');
      return null;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post(
        `/images/upload?resourceType=cakes&resourceId=${productId || 'temp'}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201 && response.data.data) {
        const imageUrl = response.data.data.secure_url;
        setNewProduct({ ...newProduct, image: imageUrl });
        setImageFile(null);
        onMessage('Image uploaded successfully!');
        return imageUrl;
      }
    } catch (error) {
      onMessage('Error uploading image: ' + error.message);
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      let productImageUrl = newProduct.image;

      // Upload image if a new file was selected
      if (imageFile) {
        // For new products, we need to create first, then upload
        // For edited products, use existing ID
        const tempId = editingProduct?._id || 'temp-' + Date.now();
        productImageUrl = await handleImageUpload(tempId);
        if (!productImageUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      const productData = {
        ...newProduct,
        image: productImageUrl,
      };

      if (editingProduct) {
        await api.put(`/admin/cakes/${editingProduct._id}`, productData);
        onMessage('Product updated successfully!');
      } else {
        await api.post('/admin/cakes', productData);
        onMessage('Product added successfully!');
      }
      resetForm();
      onDataChange();
    } catch (error) {
      onMessage('Error saving product: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image
    });
    setImagePreview(product.image);
    setImageFile(null);
    setShowAddForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setIsSubmitting(true);
        await api.delete(`/admin/cakes/${id}`);
        onMessage('Product deleted successfully!');
        onDataChange();
      } catch (error) {
        onMessage('Error deleting product: ' + error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: 'Birthday_Cakes',
      image: ''
    });
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <div className="dashboard-section">
      {/* Header with Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0 }}>Manage Products</h2>
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
          {showAddForm ? '✕ Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Add/Edit Product Form - Hidden by Default */}
      {showAddForm && (
        <div className="dashboard-form" style={{ marginBottom: '25px', backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb' }}>
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleAddProduct}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Chocolate Cake"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="29.99"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                placeholder="Describe the product..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="Birthday_Cakes">Birthday Cakes</option>
                  <option value="Wedding_Cakes">Wedding Cakes</option>
                  <option value="Anniversary_Cakes">Anniversary Cakes</option>
                  <option value="Graduation_Cakes">Graduation Cakes</option>
                  <option value="Custom_Cakes">Custom Cakes</option>
                  <option value="Seasonal_Cakes">Seasonal Cakes</option>
                </select>
              </div>
            </div>

            {/* Modern Image Upload Section */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '15px', fontWeight: '600', color: '#111827' }}>
                Product Image {!imageFile && !newProduct.image ? '*' : '(Optional to replace)'}
              </label>

              {/* Display Current Image if Editing */}
              {editingProduct && newProduct.image && !imageFile && (
                <div style={{
                  marginBottom: '15px',
                  padding: '15px',
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #86efac',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 10px 0', color: '#15803d', fontSize: '0.9rem', fontWeight: '500' }}>
                    ✓ Current Image
                  </p>
                  <img
                    src={newProduct.image}
                    alt="Current Product"
                    style={{
                      maxWidth: '220px',
                      maxHeight: '220px',
                      borderRadius: '8px',
                      border: '2px solid #dcfce7',
                      objectFit: 'cover'
                    }}
                  />
                  <p style={{ margin: '10px 0 0 0', color: '#65a30d', fontSize: '0.85rem' }}>
                    Select a new image below to replace it
                  </p>
                </div>
              )}

              {/* Drag and Drop Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed #2563eb',
                  borderRadius: '10px',
                  padding: '30px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f0f9ff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting || isUploadingImage}
                  style={{
                    display: 'none',
                    cursor: 'pointer'
                  }}
                  id="image-file-input"
                />
                
                <label
                  htmlFor="image-file-input"
                  style={{
                    cursor: 'pointer',
                    display: 'block'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📸</div>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#2563eb'
                  }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{
                    margin: '0',
                    fontSize: '0.85rem',
                    color: '#6b7280'
                  }}>
                    JPEG, PNG, WebP, or GIF (Max 5MB)
                  </p>
                </label>
              </div>

              {/* New Image Preview */}
              {imageFile && (
                <div style={{
                  marginTop: '15px',
                  padding: '15px',
                  backgroundColor: '#fef3c7',
                  border: '2px solid #fbbf24',
                  borderRadius: '10px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '0.9rem', fontWeight: '500' }}>
                    📤 New Image Selected
                  </p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: '220px',
                      maxHeight: '220px',
                      borderRadius: '8px',
                      border: '2px solid #fcd34d',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ margin: '5px 0', color: '#92400e', fontSize: '0.85rem' }}>
                      📁 File: {imageFile.name}
                    </p>
                    <p style={{ margin: '5px 0', color: '#92400e', fontSize: '0.85rem' }}>
                      💾 Size: {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearImageFile}
                    disabled={isSubmitting || isUploadingImage}
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isSubmitting || isUploadingImage ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      opacity: isSubmitting || isUploadingImage ? 0.6 : 1
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="dashboard-btn-primary"
                disabled={isSubmitting || isUploadingImage || (!newProduct.name || !newProduct.price || !newProduct.description || (!newProduct.image && !imageFile))}
              >
                {isSubmitting ? 'Saving...' : isUploadingImage ? 'Uploading Image...' : editingProduct ? 'Update Product' : 'Add Product'}
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

          <div style={{
            marginTop: '15px',
            padding: '12px',
            backgroundColor: '#dbeafe',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            fontSize: '0.9rem',
            color: '#1e40af'
          }}>
            <strong>💡 Tips:</strong>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Images are automatically uploaded to Cloudinary and organized by product</li>
              <li>Supported formats: JPEG, PNG, WebP, GIF (Max 5MB)</li>
              <li>To manage recipe ingredients, visit the "Ingredients" tab</li>
            </ul>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '2px solid #e0e7ff',
            borderRadius: '8px',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease'
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '10px 15px',
            border: '2px solid #e0e7ff',
            borderRadius: '8px',
            fontSize: '0.95rem',
            backgroundColor: 'white'
          }}
        >
          <option value="">All Categories</option>
          <option value="Birthday_Cakes">Birthday Cakes</option>
          <option value="Wedding_Cakes">Wedding Cakes</option>
          <option value="Anniversary_Cakes">Anniversary Cakes</option>
          <option value="Graduation_Cakes">Graduation Cakes</option>
          <option value="Custom_Cakes">Custom Cakes</option>
          <option value="Seasonal_Cakes">Seasonal Cakes</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="dashboard-table-container">
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
            {searchTerm || filterCategory ? 'No products found' : 'No products yet. Click "Add Product" to get started!'}
          </p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Product Name</th>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '12%' }}>Price</th>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ textAlign: 'center', width: '18%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td style={{ fontWeight: '600', color: '#2563eb' }}>{product.name}</td>
                  <td>{product.category?.replace('_', ' ')}</td>
                  <td style={{ fontWeight: '600' }}>${parseFloat(product.price).toFixed(2)}</td>
                  <td style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    {product.description.substring(0, 60)}...
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="dashboard-btn-small edit"
                      onClick={() => handleEditProduct(product)}
                      disabled={isSubmitting}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="dashboard-btn-small delete"
                      onClick={() => handleDeleteProduct(product._id)}
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

      {/* Summary Cards */}
      <div style={{
        marginTop: '20px',
        padding: '15px 20px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #e0e7ff',
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '20px',
        textAlign: 'center'
      }}>
        <div>
          <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '0.9rem' }}>Total Products</p>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#2563eb' }}>{products.length}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '0.9rem' }}>Showing</p>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#2563eb' }}>{filteredProducts.length}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '0.9rem' }}>Avg Price</p>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: '#2563eb' }}>
            ${products.length > 0 ? (products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardProducts;
