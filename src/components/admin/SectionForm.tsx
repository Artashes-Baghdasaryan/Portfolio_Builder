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
  Upload,
  X,
} from 'lucide-react';

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

export default function SectionForm() {
  const { pageId, sectionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    title_native: '',
    description_native: '',
    slug: '',
    content: {},
    content_native: {},
    order: 0,
    show_in_main_page: false,
    image_url: '',
  });
  const [selectedImage, setSelectedImage] = useState<{ src: string | null; editor: 'main' | 'native' }>({ src: null, editor: 'main' });
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);

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
        content,
      }));
      requestAnimationFrame(() => {
        editor.commands.setTextSelection({ from, to });
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-6 min-h-[300px] focus:outline-none',
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
        content_native: content,
      }));
      requestAnimationFrame(() => {
        editor.commands.setTextSelection({ from, to });
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-6 min-h-[300px] focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (sectionId) {
      fetchSection();
    }
  }, [sectionId]);

  useEffect(() => {
    if (!sectionId) {
      fetchLastOrder();
    }
  }, []);

  const fetchLastOrder = async () => {
    const { data } = await supabase
      .from('sections')
      .select('order')
      .eq('page_id', pageId)
      .order('order', { ascending: false })
      .limit(1);

    const lastOrder = data?.[0]?.order ?? -1;
    setFormData(prev => ({
      ...prev,
      order: lastOrder + 1
    }));
  };

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

  useEffect(() => {
    if (editorNative && formData.content_native) {
      try {
        if (typeof formData.content_native === 'string') {
          const parsedContent = JSON.parse(formData.content_native);
          editorNative.commands.setContent(parsedContent);
        } else {
          editorNative.commands.setContent(formData.content_native);
        }
      } catch (err) {
        console.error('Error setting native editor content:', err);
      }
    }
  }, [formData.content_native, editorNative]);

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
        title_native: data.title_native || '',
        description_native: data.description_native || '',
        slug: data.slug,
        content: data.content || {},
        content_native: data.content_native || {},
        order: data.order || 0,
        show_in_main_page: data.show_in_main_page || false,
        image_url: data.image_url || '',
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'order' ? parseInt(value) || 0 : value),
      ...(name === 'title' && !sectionId
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

  const handleSectionImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
          setLoading(true);
          const { data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file);

          if (error) {
            console.error('Error uploading image:', error);
            return;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

          setFormData(prev => ({
            ...prev,
            image_url: publicUrl
          }));
        } catch (err) {
          console.error('Error handling image upload:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  const handleRemoveSectionImage = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }));
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
      const contentNative = editorNative?.getJSON();

      const sectionData = {
        ...formData,
        page_id: pageId,
        order: sectionId ? formData.order : nextOrder,
        content: content || {},
        content_native: contentNative || {},
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Image
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {formData.image_url ? (
              <div className="relative">
                <img
                  src={formData.image_url}
                  alt="Section"
                  className="h-32 w-auto rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveSectionImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSectionImageUpload}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Image
              </button>
            )}
          </div>
        </div>

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
          <label htmlFor="title_native" className="block text-sm font-medium text-gray-700">
            Title (Native)
          </label>
          <input
            id="title_native"
            type="text"
            name="title_native"
            value={formData.title_native}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
          <label htmlFor="description_native" className="block text-sm font-medium text-gray-700">
            Description (Native)
          </label>
          <textarea
            id="description_native"
            name="description_native"
            value={formData.description_native}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700">
            Order
          </label>
          <input
            id="order"
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            min="0"
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="show_in_main_page"
            name="show_in_main_page"
            checked={formData.show_in_main_page}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="show_in_main_page" className="ml-2 block text-sm text-gray-700">
            Show in main page
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
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
              className="prose prose-lg max-w-none p-4 min-h-[300px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content (Native)
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
