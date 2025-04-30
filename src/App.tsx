import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import AdminPanel from './pages/AdminPanel';
import PageView from './pages/PageView';
import LoginPage from './pages/LoginPage';
import Portfolio from './pages/Portfolio';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Portfolio />} />
              <Route path="/docs" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } />
              <Route path="/:pageSlug" element={<PageView />} />
              <Route path="/:pageSlug/sections/:sectionSlug" element={<PageView />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;