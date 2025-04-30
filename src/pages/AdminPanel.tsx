import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, FileText, Plus, User } from 'lucide-react';
import PageList from '../components/admin/PageList';
import PageForm from '../components/admin/PageForm';
import SectionForm from '../components/admin/SectionForm';
import PortfolioContent from './admin/PortfolioContent';

export default function AdminPanel() {
  const location = useLocation();
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <Link
          to="/admin/pages/new"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>New Page</span>
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <nav className="bg-white rounded-lg shadow-md p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/admin'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/pages"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    location.pathname.startsWith('/admin/pages')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                  <span>Pages</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/portfolio"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                    location.pathname === '/admin/portfolio'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Portfolio</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="col-span-9">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="pages" element={<PageList />} />
              <Route path="pages/new" element={<PageForm />} />
              <Route path="pages/:id" element={<PageForm />} />
              <Route path="pages/:pageId/sections/new" element={<SectionForm />} />
              <Route path="pages/:pageId/sections/:sectionId" element={<SectionForm />} />
              <Route path="portfolio" element={<PortfolioContent />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
      <p className="text-gray-600">
        Welcome to the admin panel. Use the navigation menu to manage your documentation.
      </p>
    </div>
  );
}