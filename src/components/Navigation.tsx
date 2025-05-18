import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Book, Globe, ChevronDown, Menu, X } from 'lucide-react';

interface PortfolioLabels {
  portfolio_label: string;
  portfolio_label_native: string;
  native_language_label: string;
  native_language_label_native: string;
}

interface Page {
  id: string;
  title: string;
  title_native: string | null;
  slug: string;
  parent_id: string | null;
  order: number;
  only_for_admin: boolean;
}

interface NavItem extends Page {
  children: NavItem[];
}

export default function Navigation() {
  const [pages, setPages] = useState<NavItem[]>([]);
  const [labels, setLabels] = useState<PortfolioLabels>({
    portfolio_label: 'Portfolio',
    portfolio_label_native: 'Պորտֆել',
    native_language_label: 'Native',
    native_language_label_native: 'հայերեն'
  });
  const { user, signOut, language, setLanguage } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  useEffect(() => {
    console.log('Navigation: Initial mount, fetching pages...');
    fetchPages();
    fetchLabels();

    const channel = supabase
      .channel('pages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pages'
        },
        (payload) => {
          console.log('Navigation: Received real-time update:', payload);
          console.log('Navigation: Triggering page refresh...');
          fetchPages();
        }
      )
      .subscribe((status) => {
        console.log('Navigation: Subscription status:', status);
      });

    return () => {
      console.log('Navigation: Cleaning up subscription...');
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsLanguageDropdownOpen(false);
  }, [location.pathname]);

  const fetchLabels = async () => {
    const { data } = await supabase
      .from('portfolio_content')
      .select('portfolio_label, portfolio_label_native, native_language_label, native_language_label_native')
      .single();

    if (data) {
      setLabels(data);
    }
  };

  const fetchPages = async () => {
    console.log('Navigation: Fetching pages from Supabase...');
    let query = supabase
      .from('pages')
      .select('id, title, title_native, slug, parent_id, order, only_for_admin')
      .order('order', { ascending: true });

    if (!user) {
      query = query.eq('only_for_admin', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Navigation: Error fetching pages:', error);
      return;
    }

    if (data) {
      console.log('Navigation: Received pages data:', data);
      const tree = buildNavTree(data);
      console.log('Navigation: Built navigation tree:', tree);
      setPages(tree);
    }
  };

  const buildNavTree = (pages: Page[]): NavItem[] => {
    console.log('Navigation: Building nav tree from pages:', pages);
    const tree: NavItem[] = [];
    const lookup: Record<string, NavItem> = {};

    // First, create all nodes
    pages.forEach(page => {
      lookup[page.id] = { ...page, children: [] };
    });

    // Then, build the tree structure
    pages.forEach(page => {
      if (page.parent_id && lookup[page.parent_id]) {
        // Add to parent's children array, maintaining order
        const parent = lookup[page.parent_id];
        parent.children.push(lookup[page.id]);
        // Sort children by order
        parent.children.sort((a, b) => a.order - b.order);
      } else {
        tree.push(lookup[page.id]);
      }
    });

    // Sort root level pages by order
    tree.sort((a, b) => a.order - b.order);

    console.log('Navigation: Final nav tree:', tree);
    return tree;
  };

  const handleLanguageChange = (newLanguage: 'english' | 'native') => {
    setLanguage(newLanguage);
    setIsLanguageDropdownOpen(false);
  };

  const getTitle = (item: NavItem) => {
    if (language === 'native' && item.title_native) {
      return item.title_native;
    }
    return item.title;
  };

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => (
      <div key={item.id} className="relative group">
        <Link
          to={`/${item.slug}`}
          className={`flex items-center px-4 py-2 text-sm font-medium transition-colors duration-150 ${
            location.pathname === `/${item.slug}`
              ? 'text-blue-600'
              : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          {getTitle(item)}
          {item.children.length > 0 && (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </Link>
        
        {item.children.length > 0 && (
          <div className="hidden group-hover:block absolute left-0 mt-0 w-48 bg-white rounded-md shadow-lg z-50">
            {item.children.map(child => (
              <Link
                key={child.id}
                to={`/${child.slug}`}
                className={`block px-4 py-2 text-sm ${
                  location.pathname === `/${child.slug}`
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                {getTitle(child)}
              </Link>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16">
          {/* Logo and Dynamic Pages */}
          <div className="flex items-center flex-1">
            <Link to="/" className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 transition-colors duration-150 mr-8">
              <Book className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-semibold">
                {language === 'native' ? labels.portfolio_label_native : labels.portfolio_label}
              </span>
            </Link>
            
            {/* Dynamic Pages - Now on the left */}
            <div className="hidden md:flex items-center space-x-1">
              {renderNavItems(pages)}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Language Selector - Always visible */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-150"
              >
                <Globe className="h-5 w-5" />
                <span className="capitalize">
                  {language === 'native' ? labels.native_language_label_native : 'English'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleLanguageChange('english')}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        language === 'english'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageChange('native')}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        language === 'native'
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {labels.native_language_label}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {pages.map(item => (
            <div key={item.id}>
              <Link
                to={`/${item.slug}`}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === `/${item.slug}`
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {getTitle(item)}
              </Link>
              {item.children.length > 0 && (
                <div className="pl-4 space-y-1">
                  {item.children.map(child => (
                    <Link
                      key={child.id}
                      to={`/${child.slug}`}
                      className={`block px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === `/${child.slug}`
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {getTitle(child)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-gray-200 mt-4 pt-4">
            {/* Language Selector in Mobile Menu */}
            <div className="px-3 py-2">
              <button
                onClick={() => handleLanguageChange('english')}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md ${
                  language === 'english'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Globe className="h-5 w-5" />
                <span>English</span>
              </button>
              <button
                onClick={() => handleLanguageChange('native')}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md ${
                  language === 'native'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Globe className="h-5 w-5" />
                <span>{labels.native_language_label}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
