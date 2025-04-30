import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Page {
  id: string;
  title: string;
  description: string;
  title_native: string | null;
  description_native: string | null;
  only_for_admin: boolean;
}

interface Section {
  id: string;
  title: string;
  description: string;
  title_native: string | null;
  description_native: string | null;
  content: any;
  content_native: any;
  slug: string;
  order: number;
  image_url: string | null;
}

const ViewImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          style: `width: ${attributes.width};`,
        }),
      },
      height: {
        default: 'auto',
        renderHTML: attributes => ({
          style: `height: ${attributes.height};`,
        }),
      },
      alignment: {
        default: 'center',
        renderHTML: attributes => ({
          style: `display: block; margin: ${
            attributes.alignment === 'center' ? '0 auto' : '0'
          }; float: ${attributes.alignment === 'center' ? 'none' : attributes.alignment};`,
        }),
      },
    };
  },
});

const parseContent = (content: string | null): any => {
  if (!content) return null;
  
  try {
    return JSON.parse(content);
  } catch (err) {
    // If parsing fails, create a simple paragraph with the text content
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: content
            }
          ]
        }
      ]
    };
  }
};

const createViewEditor = () => {
  return useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      ViewImage.configure({
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
    ],
    content: {},
    editable: false,
  });
};

export default function PageView() {
  const { pageSlug, sectionSlug } = useParams();
  const navigate = useNavigate();
  const { language, user } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mainEditor = createViewEditor();
  const pageDescriptionEditor = createViewEditor();
  const sectionDescriptionEditor = createViewEditor();

  useEffect(() => {
    if (currentSection && mainEditor) {
      try {
        const content = language === 'native' && currentSection.content_native
          ? currentSection.content_native
          : currentSection.content;
        
        const contentToSet = typeof content === 'string'
          ? JSON.parse(content)
          : content;
        
        mainEditor.commands.setContent(contentToSet);
      } catch (err) {
        console.error('Error setting viewer content:', err);
      }
    }
  }, [currentSection, mainEditor, language]);

  useEffect(() => {
    if (page && pageDescriptionEditor) {
      try {
        const description = language === 'native' && page.description_native
          ? page.description_native
          : page.description;

        const contentToSet = parseContent(description);
        if (contentToSet) {
          pageDescriptionEditor.commands.setContent(contentToSet);
        }
      } catch (err) {
        console.error('Error setting description content:', err);
      }
    }
  }, [page, pageDescriptionEditor, language]);

  useEffect(() => {
    if (!pageSlug) {
      navigate('/');
      return;
    }
    fetchPage();
  }, [pageSlug, navigate]);

  useEffect(() => {
    if (page?.id) {
      if (sectionSlug) {
        fetchSection();
      } else {
        fetchSections();
      }
    }
  }, [page?.id, sectionSlug]);

  // Add effect to update section description when language changes
  useEffect(() => {
    if (currentSection && sectionDescriptionEditor) {
      const description = language === 'native' && currentSection.description_native
        ? currentSection.description_native
        : currentSection.description;

      const contentToSet = parseContent(description);
      if (contentToSet) {
        sectionDescriptionEditor.commands.setContent(contentToSet);
      }
    }
  }, [currentSection, sectionDescriptionEditor, language]);

  const fetchPage = async () => {
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', pageSlug)
        .maybeSingle();

      if (pageError) throw pageError;

      if (pageData) {
        if (pageData.only_for_admin && !user) {
          navigate('/login');
          return;
        }
        setPage(pageData);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error fetching page:', err);
      setError('Failed to load page');
    }
  };

  const fetchSections = async () => {
    if (!page?.id) return;

    try {
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('page_id', page.id)
        .order('order', { ascending: true });

      if (sectionsError) throw sectionsError;

      if (sectionsData) {
        setSections(sectionsData);
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const fetchSection = async () => {
    if (!page?.id || !sectionSlug) return;

    try {
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .select('*')
        .eq('page_id', page.id)
        .eq('slug', sectionSlug)
        .single();

      if (sectionError) throw sectionError;

      if (sectionData) {
        setCurrentSection(sectionData);
      } else {
        navigate(`/${pageSlug}`);
      }
    } catch (err) {
      console.error('Error fetching section:', err);
      setError('Failed to load section');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (item: { title: string; title_native: string | null }) => {
    return language === 'native' && item.title_native ? item.title_native : item.title;
  };

  const getDescription = (item: { description: string; description_native: string | null }) => {
    return language === 'native' && item.description_native ? item.description_native : item.description;
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-600">Page not found</div>
      </div>
    );
  }

  if (sectionSlug && currentSection) {
    return (
      <div className="max-w-[70rem] mx-auto">
        <Link
          to={`/${pageSlug}`}
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {getTitle(page)}</span>
        </Link>

        <article className="bg-white rounded-lg shadow-md p-8">
          <header className="mb-8">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {getTitle(currentSection)}
              </h1>
              {page.only_for_admin && (
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  Admin Only
                </span>
              )}
            </div>
            {currentSection.description && (
              <div className="prose prose-lg max-w-none mt-4">
                <EditorContent editor={sectionDescriptionEditor} />
              </div>
            )}
          </header>

          {currentSection.image_url && (
            <div className="mb-8">
              <img
                src={currentSection.image_url}
                alt={getTitle(currentSection)}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {mainEditor && <EditorContent editor={mainEditor} />}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-[70rem] mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-900">{getTitle(page)}</h1>
          {page.only_for_admin && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
              Admin Only
            </span>
          )}
        </div>
        {page.description && (
          <div className="prose prose-lg max-w-none mt-4">
            <EditorContent editor={pageDescriptionEditor} />
          </div>
        )}
      </header>

      <div className="grid gap-6">
        {sections.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No sections found</p>
        ) : (
          sections.map((section) => (
            <Link
              key={section.id}
              to={`/${pageSlug}/sections/${section.slug}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {section.image_url && (
                  <div className="md:w-1/3 flex-shrink-0">
                    <img
                      src={section.image_url}
                      alt={getTitle(section)}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                )}
                <div className={`p-6 ${section.image_url ? 'md:w-2/3' : 'w-full'}`}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {getTitle(section)}
                  </h2>
                  {section.description && (
                    <p className="text-gray-600">{getDescription(section)}</p>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}