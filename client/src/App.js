import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import { CurrencyProvider } from './context/CurrencyContext';
import SessionExpiredModal from './components/SessionExpiredModal';

// Pages
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import DashboardPage from './pages/Dashboard';
import DashboardLogin from './pages/DashboardLogin';
import RegisterPage from './pages/RegisterPage';
import SignInPage from './pages/SignInPage';

function App() {
  return (
    <CurrencyProvider>
      <Router>
        <SessionExpiredModal />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/dashboard-login" element={<DashboardLogin />} />
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </CurrencyProvider>
  );
}

export default App;
