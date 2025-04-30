import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Edit, Trash2, ChevronRight } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  description: string;
  slug: string;
  created_at: string;
  order: number;
}

export default function PageList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pages:', error);
      return;
    }

    setPages(data || []);
    setLoading(false);
  };

  const deletePageAndSubpages = async (pageId: string) => {
    try {
      // Get all subpages recursively
      const subpages = await getSubpagesRecursively(pageId);
      const allPageIds = [pageId, ...subpages.map(p => p.id)];

      // Delete all pages (cascade will handle sections)
      const { error } = await supabase
        .from('pages')
        .delete()
        .in('id', allPageIds);

      if (error) {
        throw error;
      }

      // Update local state
      setPages(pages.filter(page => !allPageIds.includes(page.id)));
    } catch (error) {
      console.error('Error deleting page and subpages:', error);
    }
  };

  const getSubpagesRecursively = async (pageId: string): Promise<Page[]> => {
    const subpages: Page[] = [];
    
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('parent_id', pageId);

    if (error) {
      console.error('Error fetching subpages:', error);
      return subpages;
    }

    if (data) {
      subpages.push(...data);
      // Get subpages of subpages
      for (const subpage of data) {
        const childPages = await getSubpagesRecursively(subpage.id);
        subpages.push(...childPages);
      }
    }

    return subpages;
  };

  const deletePage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this page? This will also delete all subpages and their sections.')) {
      return;
    }

    await deletePageAndSubpages(id);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pages</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{page.order}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {page.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{page.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {new Date(page.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <Link
                      to={`/admin/pages/${page.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deletePage(page.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/${page.slug}`}
                      target="_blank"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}