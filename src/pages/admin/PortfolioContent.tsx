import React, { useEffect, useState } from 'react';
import { 
  Github, Mail, Globe, Linkedin, Twitter, ExternalLink, BookOpen, Code, Server, 
  Briefcase, GraduationCap, FileStackIcon as StackIcon, Award, Newspaper, ShoppingBag, 
  FileText, FileCode2, Youtube, Facebook, Instagram, Video, MessageCircle, Plus, Trash2,
  Upload, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface QuickStat {
  icon: string;
  text: string;
  text_native: string;
  color: string;
  order: number;
}

interface PortfolioContent {
  id: string;
  image_url: string;
  name: string;
  name_native: string | null;
  title: string;
  title_native: string | null;
  bio: string;
  bio_native: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  email: string | null;
  google_scholar_url: string | null;
  stackoverflow_url: string | null;
  orcid_url: string | null;
  medium_url: string | null;
  gumroad_url: string | null;
  substack_url: string | null;
  dev_to_url: string | null;
  hashnode_url: string | null;
  youtube_url: string | null;
  personal_website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  vk_url: string | null;
  years_of_experience: number;
  featured_projects_title: string;
  featured_projects_title_native: string | null;
  contact_title: string;
  contact_title_native: string | null;
  contact_text: string;
  contact_text_native: string | null;
  quick_stats_title: string;
  quick_stats_title_native: string;
  quick_stats: QuickStat[];
}

const availableIcons = [
  { name: 'Code', component: Code },
  { name: 'Server', component: Server },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Award', component: Award },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'Globe', component: Globe },
  { name: 'FileText', component: FileText }
];

const availableColors = [
  { name: 'blue', class: 'bg-blue-50 text-blue-600' },
  { name: 'green', class: 'bg-green-50 text-green-600' },
  { name: 'purple', class: 'bg-purple-50 text-purple-600' },
  { name: 'orange', class: 'bg-orange-50 text-orange-600' },
  { name: 'red', class: 'bg-red-50 text-red-600' },
  { name: 'indigo', class: 'bg-indigo-50 text-indigo-600' },
  { name: 'pink', class: 'bg-pink-50 text-pink-600' },
  { name: 'yellow', class: 'bg-yellow-50 text-yellow-600' }
];

const defaultFormData = {
  image_url: '',
  name: '',
  name_native: '',
  title: '',
  title_native: '',
  bio: '',
  bio_native: '',
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
  email: '',
  google_scholar_url: '',
  stackoverflow_url: '',
  orcid_url: '',
  medium_url: '',
  gumroad_url: '',
  substack_url: '',
  dev_to_url: '',
  hashnode_url: '',
  youtube_url: '',
  personal_website_url: '',
  facebook_url: '',
  instagram_url: '',
  tiktok_url: '',
  vk_url: '',
  years_of_experience: 0,
  featured_projects_title: 'Featured Projects',
  featured_projects_title_native: 'Ընտրված նախագծեր',
  contact_title: "Let's Work Together",
  contact_title_native: 'Եկեք աշխատենք միասին',
  contact_text: "I'm always interested in hearing about new projects and opportunities. Whether you have a question or just want to say hi, feel free to reach out!",
  contact_text_native: 'Ես միշտ հետաքրքրված եմ նոր նախագծերի և հնարավորությունների մասին լսելով: Անկախ նրանից, թե հարց ունեք, թե պարզապես ցանկանում եք բարևել, ազատ զգացեք կապվել ինձ հետ:',
  portfolio_label: 'Portfolio',
  portfolio_label_native: 'Պորտֆել',
  native_language_label: 'Native',
  native_language_label_native: 'հայերեն',
  quick_stats_title: 'Quick Stats',
  quick_stats_title_native: 'Արագ վիճակագրություն',
  quick_stats: [] as QuickStat[],
};

export default function PortfolioContent() {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchPortfolioContent();
  }, []);

  const fetchPortfolioContent = async () => {
    const { data } = await supabase
      .from('portfolio_content')
      .select('*')
      .single();

    if (data) {
      setContent(data);
      const formattedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === null ? '' : value])
      );
      setFormData(formattedData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseInt(value) || 0) : value,
    }));
  };

  const handleQuickStatChange = (index: number, field: keyof QuickStat, value: string) => {
    setFormData(prev => {
      const newQuickStats = [...prev.quick_stats];
      newQuickStats[index] = {
        ...newQuickStats[index],
        [field]: value
      };
      return {
        ...prev,
        quick_stats: newQuickStats
      };
    });
  };

  const addQuickStat = () => {
    if (formData.quick_stats.length >= 8) {
      alert('Maximum 8 quick stats allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      quick_stats: [
        ...prev.quick_stats,
        {
          icon: 'Award',
          text: 'New Stat',
          text_native: 'Նոր վիճակագրություն',
          color: 'blue',
          order: prev.quick_stats.length
        }
      ]
    }));
  };

  const removeQuickStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quick_stats: prev.quick_stats
        .filter((_, i) => i !== index)
        .map((stat, i) => ({ ...stat, order: i }))
    }));
  };

  const handleImageUpload = async () => {
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

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      );

      if (content) {
        await supabase
          .from('portfolio_content')
          .update(dataToSubmit)
          .eq('id', content.id);
      } else {
        await supabase
          .from('portfolio_content')
          .insert([dataToSubmit]);
      }

      await fetchPortfolioContent();
    } catch (error) {
      console.error('Error saving portfolio content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Portfolio Content
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {formData.image_url ? (
              <div className="relative">
                <img
                  src={formData.image_url}
                  alt="Profile"
                  className="h-32 w-32 rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleImageUpload}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Image
              </button>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name (English)
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name (Native)
            </label>
            <input
              type="text"
              name="name_native"
              value={formData.name_native}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title (English)
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
              Years of Experience
            </label>
            <input
              type="number"
              name="years_of_experience"
              value={formData.years_of_experience}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bio (English)
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bio (Native)
          </label>
          <textarea
            name="bio_native"
            value={formData.bio_native}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Featured Projects Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Featured Projects Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Featured Projects Title (English)
              </label>
              <input
                type="text"
                name="featured_projects_title"
                value={formData.featured_projects_title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Featured Projects Title (Native)
              </label>
              <input
                type="text"
                name="featured_projects_title_native"
                value={formData.featured_projects_title_native}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Contact Section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Title (English)
              </label>
              <input
                type="text"
                name="contact_title"
                value={formData.contact_title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Title (Native)
              </label>
              <input
                type="text"
                name="contact_title_native"
                value={formData.contact_title_native}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Contact Text (English)
              </label>
              <textarea
                name="contact_text"
                value={formData.contact_text}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Contact Text (Native)
              </label>
              <textarea
                name="contact_text_native"
                value={formData.contact_text_native}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Navigation Labels Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Navigation Labels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Portfolio Label (English)
              </label>
              <input
                type="text"
                name="portfolio_label"
                value={formData.portfolio_label}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Portfolio Label (Native)
              </label>
              <input
                type="text"
                name="portfolio_label_native"
                value={formData.portfolio_label_native}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Native Language Label (English)
              </label>
              <input
                type="text"
                name="native_language_label"
                value={formData.native_language_label}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Native Language Label (Native)
              </label>
              <input
                type="text"
                name="native_language_label_native"
                value={formData.native_language_label_native}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Quick Stats Section</h3>
            <button
              type="button"
              onClick={addQuickStat}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              <Plus className="h-4 w-4" />
              Add Stat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quick Stats Title (English)
              </label>
              <input
                type="text"
                name="quick_stats_title"
                value={formData.quick_stats_title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quick Stats Title (Native)
              </label>
              <input
                type="text"
                name="quick_stats_title_native"
                value={formData.quick_stats_title_native}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            {formData.quick_stats.map((stat, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Stat #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeQuickStat(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Icon</label>
                    <select
                      value={stat.icon}
                      onChange={(e) => handleQuickStatChange(index, 'icon', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {availableIcons.map(icon => (
                        <option key={icon.name} value={icon.name}>{icon.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Color</label>
                    <select
                      value={stat.color}
                      onChange={(e) => handleQuickStatChange(index, 'color', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {availableColors.map(color => (
                        <option key={color.name} value={color.name}>{color.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Text (English)</label>
                    <input
                      type="text"
                      value={stat.text}
                      onChange={(e) => handleQuickStatChange(index, 'text', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Text (Native)</label>
                    <input
                      type="text"
                      value={stat.text_native}
                      onChange={(e) => handleQuickStatChange(index, 'text_native', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <div className="text-sm text-gray-500">Preview:</div>
                  <div className="mt-2 flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border transition-transform hover:translate-x-1">
                    <div className={`p-2 ${availableColors.find(c => c.name === stat.color)?.class || 'bg-blue-50 text-blue-600'} rounded-lg`}>
                      {React.createElement(
                        availableIcons.find(i => i.name === stat.icon)?.component || Award,
                        { className: "h-5 w-5" }
                      )}
                    </div>
                    <span className="text-gray-700 font-medium">{stat.text}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Personal Website
              </label>
              <input
                type="url"
                name="personal_website_url"
                value={formData.personal_website_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                GitHub
              </label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                LinkedIn
              </label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter
              </label>
              <input
                type="url"
                name="twitter_url"
                value={formData.twitter_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://twitter.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Google Scholar
              </label>
              <input
                type="url"
                name="google_scholar_url"
                value={formData.google_scholar_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://scholar.google.com/citations"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stack Overflow
              </label>
              <input
                type="url"
                name="stackoverflow_url"
                value={formData.stackoverflow_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://stackoverflow.com/users/id"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ORCID
              </label>
              <input
                type="url"
                name="orcid_url"
                value={formData.orcid_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://orcid.org/0000-0000-0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Medium
              </label>
              <input
                type="url"
                
                name="medium_url"
                value={formData.medium_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://medium.com/@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gumroad
              </label>
              <input
                type="url"
                name="gumroad_url"
                value={formData.gumroad_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://username.gumroad.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Substack
              </label>
              <input
                type="url"
                name="substack_url"
                value={formData.substack_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://username.substack.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                DEV Community
              </label>
              <input
                type="url"
                name="dev_to_url"
                value={formData.dev_to_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://dev.to/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hashnode
              </label>
              <input
                type="url"
                name="hashnode_url"
                value={formData.hashnode_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://hashnode.com/@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                YouTube
              </label>
              <input
                type="url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://youtube.com/@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Facebook
              </label>
              <input
                type="url"
                name="facebook_url"
                value={formData.facebook_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://facebook.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <input
                type="url"
                name="instagram_url"
                value={formData.instagram_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://instagram.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                TikTok
              </label>
              <input
                type="url"
                name="tiktok_url"
                value={formData.tiktok_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://tiktok.com/@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                VKontakte
              </label>
              <input
                type="url"
                name="vk_url"
                value={formData.vk_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://vk.com/username"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
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
