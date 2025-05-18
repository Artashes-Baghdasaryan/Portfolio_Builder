import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link2 from '@tiptap/extension-link';
import { supabase } from '../../lib/supabase';
import slugify from 'slugify';
import { Plus, Edit, Trash2, ChevronRight, Bold, Italic, Code, Quote, Image as ImageIcon, Heading1, Heading2, Heading3, List, ListOrdered, Minus, RotateCcw, RotateCw, CodeSquare, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  description: string;
  title_native: string | null;
  description_native: string | null;
  slug: string;
  parent_id: string | null;
  order: number;
  only_for_admin: boolean;
}

interface Section {
  id: string;
  title: string;
  description: string;
  slug: string;
  order: number;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, isActive, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-200 transition-colors duration-150 ${
      isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-700'
    }`}
    title={title}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px h-6 bg-gray-300 mx-1" />
);

const ImageResizeButton: React.FC<{
  size: 'small' | 'medium' | 'large' | 'full';
  isActive: boolean;
  onClick: () => void;
}> = ({ size, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-2 py-1 rounded text-xs transition-colors duration-150 ${
      isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700'
    } hover:bg-blue-50`}
  >
    {size.charAt(0).toUpperCase() + size.slice(1)}
  </button>
);

const setLink = (editor: any) => {
  const previousUrl = editor.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);

  if (url === null) {
    return;
  }

  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

export default function PageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedImage, setSelectedImage] = useState<{ src: string | null; editor: 'main' | 'native' }>({ src: null, editor: 'main' });
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    title_native: '',
    description_native: '',
    slug: '',
    parent_id: '',
    order: 0,
    only_for_admin: false,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg transition-all duration-200',
        },
      }),
      Link2.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: {},
    onSelectionUpdate: ({ editor }) => {
      const node = editor.state.selection.$anchor.parent;
      if (node.type.name === 'image') {
        setSelectedImage({ src: node.attrs.src, editor: 'main' });
        const imgElement = document.querySelector(`img[src="${node.attrs.src}"]`) as HTMLImageElement;
        if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
          setImageAspectRatio(imgElement.naturalWidth / imgElement.naturalHeight);
        }
      } else if (selectedImage.editor === 'main') {
        setSelectedImage({ src: null, editor: 'main' });
        setImageAspectRatio(null);
      }
    },
    onUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const content = editor.getJSON();
      setFormData(prev => ({
        ...prev,
        description: JSON.stringify(content),
      }));
      requestAnimationFrame(() => {
        editor.commands.setTextSelection({ from, to });
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-6 min-h-[200px] focus:outline-none',
      },
    },
  });

  const editorNative = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg transition-all duration-200',
        },
      }),
      Link2.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: {},
    onSelectionUpdate: ({ editor }) => {
      const node = editor.state.selection.$anchor.parent;
      if (node.type.name === 'image') {
        setSelectedImage({ src: node.attrs.src, editor: 'native' });
        const imgElement = document.querySelector(`img[src="${node.attrs.src}"]`) as HTMLImageElement;
        if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
          setImageAspectRatio(imgElement.naturalWidth / imgElement.naturalHeight);
        }
      } else if (selectedImage.editor === 'native') {
        setSelectedImage({ src: null, editor: 'native' });
        setImageAspectRatio(null);
      }
    },
    onUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const content = editor.getJSON();
      setFormData(prev => ({
        ...prev,
        description_native: JSON.stringify(content),
      }));
      requestAnimationFrame(() => {
        editor.commands.setTextSelection({ from, to });
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-6 min-h-[200px] focus:outline-none',
      },
    },
  });

  useEffect(() => {
    fetchPages();
    if (id) {
      fetchPage();
      fetchSections();
    }
  }, [id]);

  const fetchPages = async () => {
    const { data } = await supabase
      .from('pages')
      .select('id, title')
      .order('title');

    if (data) {
      setPages(data);
    }
  };

  const fetchPage = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching page:', error);
      return;
    }

    if (data) {
      setFormData({
        title: data.title,
        description: data.description || '',
        title_native: data.title_native || '',
        description_native: data.description_native || '',
        slug: data.slug,
        parent_id: data.parent_id || '',
        order: data.order || 0,
        only_for_admin: data.only_for_admin || false,
      });
    }
  };

  const fetchSections = async () => {
    const { data } = await supabase
      .from('sections')
      .select('*')
      .eq('page_id', id)
      .order('order');

    if (data) {
      setSections(data);
    }
  };

  useEffect(() => {
    if (editor && formData.description) {
      try {
        const parsedContent = JSON.parse(formData.description);
        editor.commands.setContent(parsedContent);
      } catch (err) {
        console.error('Error setting editor content:', err);
        editor.commands.setContent(formData.description);
      }
    }
  }, [formData.description, editor]);

  useEffect(() => {
    if (editorNative && formData.description_native) {
      try {
        const parsedContent = JSON.parse(formData.description_native);
        editorNative.commands.setContent(parsedContent);
      } catch (err) {
        console.error('Error setting native editor content:', err);
        editorNative.commands.setContent(formData.description_native);
      }
    }
  }, [formData.description_native, editorNative]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'order' ? parseInt(value) || 0 : value),
      ...(name === 'title' && !id
        ? { slug: slugify(value, { lower: true, strict: true }) }
        : {}),
    }));
  };

  const handleImageUpload = async (targetEditor: 'main' | 'native') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async () => {
      if (input.files?.length) {
        for (const file of Array.from(input.files)) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file);

          if (error) {
            console.error('Error uploading image:', error);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          const tempImage = document.createElement('img');
          tempImage.onload = () => {
            const aspectRatio = tempImage.naturalWidth / tempImage.naturalHeight;
            setImageAspectRatio(aspectRatio);
            
            const targetEditorInstance = targetEditor === 'main' ? editor : editorNative;
            targetEditorInstance?.chain().focus().setImage({ 
              src: publicUrl,
              width: '100%',
              height: 'auto',
              alignment: 'center'
            }).run();
          };
          tempImage.src = publicUrl;
        }
      }
    };
    input.click();
  };

  const handleImageResize = (size: 'small' | 'medium' | 'large' | 'full') => {
    if (!selectedImage.src || !imageAspectRatio) return;

    const sizes = {
      small: '25%',
      medium: '50%',
      large: '75%',
      full: '100%'
    };

    const targetEditor = selectedImage.editor === 'main' ? editor : editorNative;
    if (!targetEditor) return;

    const containerWidth = targetEditor.view.dom.clientWidth;
    const width = sizes[size];
    const numericWidth = parseInt(width) * containerWidth / 100;
    const height = `${numericWidth / imageAspectRatio}px`;

    targetEditor
      .chain()
      .focus()
      .updateAttributes('image', {
        width,
        height,
      })
      .run();
  };

  const handleImageAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedImage.src) return;

    const targetEditor = selectedImage.editor === 'main' ? editor : editorNative;
    if (!targetEditor) return;

    targetEditor
      .chain()
      .focus()
      .updateAttributes('image', {
        alignment,
      })
      .run();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        title: formData.title,
        description: editor?.getJSON() ? JSON.stringify(editor.getJSON()) : null,
        title_native: formData.title_native || null,
        description_native: editorNative?.getJSON() ? JSON.stringify(editorNative.getJSON()) : null,
        slug: formData.slug,
        parent_id: formData.parent_id || null,
        order: formData.order,
        only_for_admin: formData.only_for_admin,
      };

      if (id) {
        const { error } = await supabase
          .from('pages')
          .update(updateData)
          .eq('id', id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('pages')
          .insert([updateData]);

        if (error) {
          throw error;
        }
      }
      
      navigate('/admin/pages');
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) {
      return;
    }

    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', sectionId);

    if (error) {
      console.error('Error deleting section:', error);
      return;
    }

    setSections(sections.filter(section => section.id !== sectionId));
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {id ? 'Edit Page' : 'Create New Page'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-50 border-b p-2 flex flex-wrap items-center gap-1">
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                isActive={editor?.isActive('bold')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                isActive={editor?.isActive('italic')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => setLink(editor)}
                isActive={editor?.isActive('link')}
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor?.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor?.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor?.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                isActive={editor?.isActive('bulletList')}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                isActive={editor?.isActive('orderedList')}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                isActive={editor?.isActive('blockquote')}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                isActive={editor?.isActive('codeBlock')}
                title="Code Block"
              >
                <CodeSquare className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
              >
                <Minus className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                onClick={() => editor?.chain().focus().undo().run()}
                title="Undo"
              >
                <RotateCcw className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor?.chain().focus().redo().run()}
                title="Redo"
              >
                <RotateCw className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                onClick={() => handleImageUpload('main')}
                title="Insert Image"
              >
                <ImageIcon className="h-4 w-4" />
              </ToolbarButton>

              {selectedImage.src && selectedImage.editor === 'main' && (
                <>
                  <ToolbarDivider />
                  <div className="flex items-center space-x-1">
                    <ToolbarButton
                      onClick={() => handleImageAlignment('left')}
                      title="Align Left"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() => handleImageAlignment('center')}
                      title="Align Center"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() => handleImageAlignment('right')}
                      title="Align Right"
                    >
                      <AlignRight className="h-4 w-4" />
                    </ToolbarButton>
                  </div>

                  <ToolbarDivider />
                  <div className="flex items-center space-x-1">
                    <ImageResizeButton
                      size="small"
                      isActive={false}
                      onClick={() => handleImageResize('small')}
                    />
                    <ImageResizeButton
                      size="medium"
                      isActive={false}
                      onClick={() => handleImageResize('medium')}
                    />
                    <ImageResizeButton
                      size="large"
                      isActive={false}
                      onClick={() => handleImageResize('large')}
                    />
                    <ImageResizeButton
                      size="full"
                      isActive={false}
                      onClick={() => handleImageResize('full')}
                    />
                  </div>
                </>
              )}
            </div>

            <EditorContent
              editor={editor}
              className="prose prose-lg max-w-none p-4 min-h-[200px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title (Native)
          </label>
          <input
            type="text"
            name="title_native"
            value={formData.title_native}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description (Native)
          </label>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-50 border-b p-2 flex flex-wrap items-center gap-1">
              <ToolbarButton
                onClick={() => editorNative?.chain().focus().toggleBold().run()}
                isActive={editorNative?.isActive('bold')}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editorNative?.chain().focus().toggleItalic().run()}
                isActive={editorNative?.isActive('italic')}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => setLink(editorNative)}
                isActive={editorNative?.isActive('link')}
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                onClick={() => editorNative?.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editorNative?.isActive('heading', { level: 1 })}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editorNative?.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editorNative?.isActive('heading', { level: 2 })}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editorNative?.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editorNative?.isActive('heading', { level: 3 })}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                onClick={() => editorNative?.chain().focus().toggleBulletList().run()}
                isActive={editorNative?.isActive('bulletList')}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editorNative?.chain().focus().toggleOrderedList().run()}
                isActive={editorNative?.isActive('orderedList')}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                onClick={() => editorNative?.chain().focus().toggleBlockquote().run()}
                isActive={editorNative?.isActive('blockquote')}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editorNative?.chain().focus().toggleCodeBlock().run()}
                isActive={editorNative?.isActive('codeBlock')}
                title="Code Block"
              >
                <CodeSquare className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editorNative?.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
              >
                <Minus className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                onClick={() => editorNative?.chain().focus().undo().run()}
                title="Undo"
              >
                <RotateCcw className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editorNative?.chain().focus().redo().run()}
                title="Redo"
              >
                <RotateCw className="h-4 w-4" />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton
                onClick={() => handleImageUpload('native')}
                title="Insert Image"
              >
                <ImageIcon className="h-4 w-4" />
              </ToolbarButton>

              {selectedImage.src && selectedImage.editor === 'native' && (
                <>
                  <ToolbarDivider />
                  <div className="flex items-center space-x-1">
                    <ToolbarButton
                      onClick={() => handleImageAlignment('left')}
                      title="Align Left"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() => handleImageAlignment('center')}
                      title="Align Center"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                      onClick={() => handleImageAlignment('right')}
                      title="Align Right"
                    >
                      <AlignRight className="h-4 w-4" />
                    </ToolbarButton>
                  </div>

                  <ToolbarDivider />
                  <div className="flex items-center space-x-1">
                    <ImageResizeButton
                      size="small"
                      isActive={false}
                      onClick={() => handleImageResize('small')}
                    />
                    <ImageResizeButton
                      size="medium"
                      isActive={false}
                      onClick={() => handleImageResize('medium')}
                    />
                    <ImageResizeButton
                      size="large"
                      isActive={false}
                      onClick={() => handleImageResize('large')}
                    />
                    <ImageResizeButton
                      size="full"
                      isActive={false}
                      onClick={() => handleImageResize('full')}
                    />
                  </div>
                </>
              )}
            </div>

            <EditorContent
              editor={editorNative}
              className="prose prose-lg max-w-none p-4 min-h-[200px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Order
          </label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Parent Page
          </label>
          <select
            name="parent_id"
            value={formData.parent_id}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">No parent</option>
            {pages
              .filter(page => page.id !== id)
              .map(page => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="only_for_admin"
            name="only_for_admin"
            checked={formData.only_for_admin}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="only_for_admin" className="ml-2 block text-sm text-gray-700">
            Only visible to admin users
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/pages')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>

      {id && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Sections</h3>
            <Link
              to={`/admin/pages/${id}/sections/new`}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              <span>Add Section</span>
            </Link>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {section.title}
                      </div>
                      {section.description && (
                        <div className="text-sm text-gray-500">
                          {section.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{section.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link
                          to={`/admin/pages/${id}/sections/${section.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/${formData.slug}/${section.slug}`}
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
      )}
    </div>
  );
}
