import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Page {
  id: string;
  title: string;
  description: string;
  slug: string;
  only_for_admin: boolean;
}

export default function HomePage() {
  const [pages, setPages] = useState<Page[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchPages();
  }, [user]);

  const fetchPages = async () => {
    let query = supabase
      .from('pages')
      .select('id, title, description, slug, only_for_admin')
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (!user) {
      query = query.eq('only_for_admin', false);
    }

    const { data } = await query;

    if (data) {
      setPages(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Documentation
        </h1>
        <p className="text-xl text-gray-600">
          Find comprehensive guides and documentation to help you get started.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {pages.map((page) => (
          <Link
            key={page.id}
            to={`/${page.slug}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {page.title}
                  </h2>
                  {page.only_for_admin && (
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      Admin Only
                    </span>
                  )}
                </div>
                {page.description && (
                  <p className="text-gray-600 mb-4">{page.description}</p>
                )}
                <div className="flex items-center text-blue-600">
                  <span>Read more</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}