import React, { useEffect, useState } from 'react';
import { 
  Github, Mail, Globe, Linkedin, Twitter, ExternalLink, BookOpen, Code, Server, 
  Briefcase, GraduationCap, FileStackIcon as StackIcon, Award, Newspaper, ShoppingBag, 
  FileText, FileCode2, Youtube, Facebook, Instagram, Video, MessageCircle 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Section {
  id: string;
  title: string;
  description: string;
  title_native: string | null;
  description_native: string | null;
  show_in_main_page: boolean;
  page_id: string;
  slug: string;
  image_url: string | null;
  page: {
    slug: string;
  };
}

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
  quick_stats: QuickStat[];
  quick_stats_title: string;
  quick_stats_title_native: string | null;
}

const iconComponents: { [key: string]: React.ComponentType<any> } = {
  Code,
  Server,
  BookOpen,
  Briefcase,
  Award,
  GraduationCap,
  Globe,
  FileText
};

const colorClasses: { [key: string]: string } = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  pink: 'bg-pink-50 text-pink-600',
  yellow: 'bg-yellow-50 text-yellow-600'
};

export default function Portfolio() {
  const [featuredSections, setFeaturedSections] = useState<Section[]>([]);
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const { language } = useAuth();

  useEffect(() => {
    fetchFeaturedSections();
    fetchPortfolioContent();
  }, [language]);

  const fetchFeaturedSections = async () => {
    const { data, error } = await supabase
      .from('sections')
      .select(`
        id,
        title,
        description,
        title_native,
        description_native,
        show_in_main_page,
        page_id,
        slug,
        image_url,
        page:page_id (
          slug
        )
      `)
      .eq('show_in_main_page', true)
      .order('order', { ascending: true });

    if (error) {
      return;
    }

    if (data) {
      setFeaturedSections(data);
    }
  };

  const fetchPortfolioContent = async () => {
    const { data } = await supabase
      .from('portfolio_content')
      .select('*')
      .single();

    if (data) {
      setContent(data);
    }
  };

  const getTitle = (item: { title: string; title_native: string | null }) => {
    return language === 'native' && item.title_native ? item.title_native : item.title;
  };

  const getDescription = (item: { description: string; description_native: string | null }) => {
    return language === 'native' && item.description_native ? item.description_native : item.description;
  };

  const getName = (item: { name: string; name_native: string | null }) => {
    return language === 'native' && item.name_native ? item.name_native : item.name;
  };

  const getBio = (item: { bio: string; bio_native: string | null }) => {
    return language === 'native' && item.bio_native ? item.bio_native : item.bio;
  };

  const getQuickStatText = (stat: QuickStat) => {
    return language === 'native' ? stat.text_native : stat.text;
  };

  if (!content) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <section className="mb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 flex flex-col items-center space-y-6 md:sticky md:top-24">
            <div className="w-full flex justify-center">
              <img
                src={content.image_url}
                alt={getName(content)}
                className="w-48 h-48 rounded-full object-cover shadow-lg ring-4 ring-blue-50"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              {content.personal_website_url && (
                <a href={content.personal_website_url} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Globe className="h-5 w-5" />
                  <span>Website</span>
                </a>
              )}
              {content.email && (
                <a href={`mailto:${content.email}`}
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </a>
              )}
              {content.github_url && (
                <a href={content.github_url} target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Github className="h-5 w-5" />
                  <span>GitHub</span>
                </a>
              )}
              {content.linkedin_url && (
                <a href={content.linkedin_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Linkedin className="h-5 w-5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {content.twitter_url && (
                <a href={content.twitter_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Twitter className="h-5 w-5" />
                  <span>Twitter</span>
                </a>
              )}
              {content.facebook_url && (
                <a href={content.facebook_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Facebook className="h-5 w-5" />
                  <span>Facebook</span>
                </a>
              )}
              {content.instagram_url && (
                <a href={content.instagram_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Instagram className="h-5 w-5" />
                  <span>Instagram</span>
                </a>
              )}
              {content.tiktok_url && (
                <a href={content.tiktok_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Video className="h-5 w-5" />
                  <span>TikTok</span>
                </a>
              )}
              {content.vk_url && (
                <a href={content.vk_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span>VK</span>
                </a>
              )}
              {content.google_scholar_url && (
                <a href={content.google_scholar_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <GraduationCap className="h-5 w-5" />
                  <span>Scholar</span>
                </a>
              )}
              {content.stackoverflow_url && (
                <a href={content.stackoverflow_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <StackIcon className="h-5 w-5" />
                  <span>Stack Overflow</span>
                </a>
              )}
              {content.orcid_url && (
                <a href={content.orcid_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Award className="h-5 w-5" />
                  <span>ORCID</span>
                </a>
              )}
              {content.medium_url && (
                <a href={content.medium_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Newspaper className="h-5 w-5" />
                  <span>Medium</span>
                </a>
              )}
              {content.gumroad_url && (
                <a href={content.gumroad_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Gumroad</span>
                </a>
              )}
              {content.substack_url && (
                <a href={content.substack_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <FileText className="h-5 w-5" />
                  <span>Substack</span>
                </a>
              )}
              {content.dev_to_url && (
                <a href={content.dev_to_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <FileCode2 className="h-5 w-5" />
                  <span>DEV</span>
                </a>
              )}
              {content.hashnode_url && (
                <a href={content.hashnode_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <FileText className="h-5 w-5" />
                  <span>Hashnode</span>
                </a>
              )}
              {content.youtube_url && (
                <a href={content.youtube_url} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Youtube className="h-5 w-5" />
                  <span>YouTube</span>
                </a>
              )}
            </div>
            
            <div className="w-full bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 shadow-md border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-6 flex items-center">
                <Award className="h-5 w-5 text-blue-600 mr-2" />
                <span>
                  {language === 'native' ? content.quick_stats_title_native : content.quick_stats_title}
                </span>
              </h3>
              <div className="space-y-4">
                {content.quick_stats.map((stat, index) => {
                  const IconComponent = iconComponents[stat.icon] || Award;
                  const colorClass = colorClasses[stat.color] || 'bg-blue-50 text-blue-600';
                  
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-blue-50 transition-transform hover:translate-x-1">
                      <div className={`p-2 ${colorClass} rounded-lg`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {getQuickStatText(stat)}
                        {stat.text.toLowerCase().includes('experience') && content.years_of_experience 
                          ? `${content.years_of_experience}+ ` 
                          : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="md:col-span-8 space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                {getName(content)}
              </h1>
              <p className="text-xl text-gray-600">
                {getTitle(content)}
              </p>
              <p className="text-gray-600">
                {getBio(content)}
              </p>
            </div>

            {featuredSections.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {language === 'native' && content.featured_projects_title_native
                    ? content.featured_projects_title_native
                    : content.featured_projects_title}
                </h2>
                <div className="space-y-6">
                  {featuredSections.map((section) => (
                    <Link
                      key={section.id}
                      to={`/${section.page.slug}/sections/${section.slug}`}
                      className="block bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
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
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {getTitle(section)}
                            </h3>
                            <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                          {section.description && (
                            <p className="text-gray-600 mt-2">{getDescription(section)}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-8 shadow-lg text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Mail className="h-6 w-6 mr-2 opacity-75" />
                  {language === 'native' && content.contact_title_native
                    ? content.contact_title_native
                    : content.contact_title}
                </h2>
                <p className="text-blue-100 mb-6 text-lg">
                  {language === 'native' && content.contact_text_native
                    ? content.contact_text_native
                    : content.contact_text}
                </p>
                {content.email && (
                  <a
                    href={`mailto:${content.email}`}
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    <span className="font-medium">{language === 'native' ? 'Կապվել' : 'Get in Touch'}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
