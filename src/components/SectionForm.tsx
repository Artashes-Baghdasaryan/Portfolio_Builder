import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { supabase } from '../../lib/supabase';
import slugify from 'slugify';
import {
  Bold,
  Italic,
  Code,
  Quote,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  RotateCcw,
  RotateCw,
  CodeSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  description: string;
  slug: string;
  content: any;
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
    className={`p-2 rounded hover:bg-gray-200 ${
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
    className={`px-2 py-1 rounded text-xs ${
      isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700'
    } hover:bg-blue-50`}
  >
    {size.charAt(0).toUpperCase() + size.slice(1)}
  </button>
);

export default function SectionForm() {
  const { pageId, sectionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    content: {},
    order: 0,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-2',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
    ],
    content: {},
    onSelectionUpdate: ({ editor }) => {
      const node = editor.state.selection.$anchor.parent;
      if (node.type.name === 'image') {
        setSelectedImage(node.attrs.src);
        // Get the image element and calculate aspect ratio
        const imgElement = document.querySelector(`img[src="${node.attrs.src}"]`) as HTMLImageElement;
        if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
          setImageAspectRatio(imgElement.naturalWidth / imgElement.naturalHeight);
        }
      } else {
        setSelectedImage(null);
        setImageAspectRatio(null);
      }
    },
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      setFormData(prev => ({
        ...prev,
        content,
      }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-4 min-h-[300px] focus:outline-none [&>*]:mb-2',
      },
    },
  });

  useEffect(() => {
    if (sectionId) {
      fetchSection();
    }
  }, [sectionId]);

  useEffect(() => {
    if (editor && formData.content) {
      try {
        if (typeof formData.content === 'string') {
          const parsedContent = JSON.parse(formData.content);
          editor.commands.setContent(parsedContent);
        } else {
          editor.commands.setContent(formData.content);
        }
      } catch (err) {
        console.error('Error setting editor content:', err);
      }
    }
  }, [formData.content, editor]);

  const fetchSection = async () => {
    const { data } = await supabase
      .from('sections')
      .select('*')
      .eq('id', sectionId)
      .single();

    if (data) {
      setFormData({
        title: data.title,
        description: data.description || '',
        slug: data.slug,
        content: data.content || {},
        order: data.order || 0,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && !sectionId
        ? { slug: slugify(value, { lower: true, strict: true }) }
        : {}),
    }));
  };

  const handleImageUpload = async () => {
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

          // Create a temporary image to get natural dimensions
          const img = new Image();
          img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            setImageAspectRatio(aspectRatio);
            
            editor?.chain().focus().setImage({ 
              src: publicUrl,
              width: '100%',
              height: 'auto',
              alignment: 'center'
            }).run();
          };
          img.src = publicUrl;
        }
      }
    };
    input.click();
  };

  const handleImageResize = (size: 'small' | 'medium' | 'large' | 'full') => {
    if (!selectedImage || !editor || !imageAspectRatio) return;

    const sizes = {
      small: '25%',
      medium: '50%',
      large: '75%',
      full: '100%'
    };

    const containerWidth = editor.view.dom.clientWidth;
    const width = sizes[size];
    const numericWidth = parseInt(width) * containerWidth / 100;
    const height = `${numericWidth / imageAspectRatio}px`;

    editor
      .chain()
      .focus()
      .updateAttributes('image', {
        width,
        height,
      })
      .run();
  };

  const handleImageAlignment = (alignment: 'left' | 'center' | 'right') => {
    if (!selectedImage || !editor) return;

    editor
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
      const { data: existingSections } = await supabase
        .from('sections')
        .select('order')
        .eq('page_id', pageId)
        .order('order', { ascending: false })
        .limit(1);

      const nextOrder = existingSections && existingSections.length > 0
        ? (existingSections[0].order || 0) + 1
        : 0;

      const content = editor?.getJSON();

      const sectionData = {
        ...formData,
        page_id: pageId,
        order: sectionId ? formData.order : nextOrder,
        content: content || {},
      };

      if (sectionId) {
        await supabase
          .from('sections')
          .update(sectionData)
          .eq('id', sectionId);
      } else {
        await supabase
          .from('sections')
          .insert([sectionData]);
      }

      navigate(`/admin/pages/${pageId}`);
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        {sectionId ? 'Edit Section' : 'Create New Section'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-50 border-b p-2 flex flex-wrap items-center gap-1">
              {/* Text Formatting */}
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

              <ToolbarDivider />

              {/* Headings */}
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

              {/* Lists */}
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

              {/* Block Formatting */}
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

              {/* History */}
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

              {/* Media */}
              <ToolbarButton
                onClick={handleImageUpload}
                title="Insert Image"
              >
                <ImageIcon className="h-4 w-4" />
              </ToolbarButton>

              {selectedImage && (
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
              className="prose prose-lg max-w-none p-4 min-h-[300px]"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => navigate(`/admin/pages/${pageId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
    </div>
  );
}