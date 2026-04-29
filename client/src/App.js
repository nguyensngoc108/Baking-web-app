import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/Dashboard';
import DashboardLogin from './pages/DashboardLogin';
import RegisterPage from './pages/RegisterPage';
import SignInPage from './pages/SignInPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/dashboard-login" element={<DashboardLogin />} />
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;
