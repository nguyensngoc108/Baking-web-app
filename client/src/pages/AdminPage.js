import React, { useState, useEffect } from 'react';
import '../styles/AdminPage.css';
import authService from '../services/authService'; 

const AdminPage = () => {
  const [signatureCake, setSignatureCake] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Chocolate',
    ingredients: '',
    servings: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
    //  connect to backend to fetch existing signature cake data if needed

    }
  }, [isLoggedIn]);




  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      
      const response = await authService.adminLogin(email, password);
      
      if (response.data.token) {
        authService.saveToken(response.data.token);
        setIsLoggedIn(true);
        setEmail('');
        setPassword('');
        setMessage('');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignatureCake((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMessage('Cake updated successfully!');
      console.log('Cake data:', signatureCake);
      
      // Reset form
      setSignatureCake({
        name: '',
        description: '',
        price: '',
        image: '',
        category: 'Chocolate',
        ingredients: '',
        servings: '',
      });
    } catch (error) {
      setMessage('Error saving cake: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        <div className="admin-login">
          <h1>Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Enter Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
          </form>
          {message && <p className="error-message">{message}</p>}
          <a href="/" className="back-link">← Back to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <nav className="admin-nav">
        <a href="/" className="admin-nav-home">← Home</a>
      </nav>
      <div className="admin-panel">
        <h1>Admin Panel - Signature Cake</h1>
        <p className="subtitle">Set or update this week's signature cake</p>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Cake Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Chocolate Delight"
              value={signatureCake.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe your cake..."
              value={signatureCake.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                name="price"
                placeholder="29.99"
                step="0.01"
                value={signatureCake.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={signatureCake.category} onChange={handleChange}>
                <option value="Chocolate">Chocolate</option>
                <option value="Vanilla">Vanilla</option>
                <option value="Fruit">Fruit</option>
                <option value="Special">Special</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              name="image"
              placeholder="https://example.com/cake.jpg"
              value={signatureCake.image}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ingredients (comma separated)</label>
              <input
                type="text"
                name="ingredients"
                placeholder="flour, eggs, sugar, butter"
                value={signatureCake.ingredients}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Servings</label>
              <input
                type="number"
                name="servings"
                placeholder="8"
                value={signatureCake.servings}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Saving...' : signatureCake._id ? 'Update Cake' : 'Set Signature Cake'}
          </button>
        </form>

        {message && <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}

        <button className="logout-btn" onClick={() => {
          authService.logout();
          setIsLoggedIn(false);
        }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
