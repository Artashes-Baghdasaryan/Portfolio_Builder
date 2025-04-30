# Documentation Website with Portfolio

A full-featured documentation and portfolio website built with React, TypeScript, and Supabase. The project supports bilingual content (English and Native language), rich text editing, image management, and admin authentication.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Typography plugin
- **Rich Text Editor**: TipTap
- **Database & Auth**: Supabase
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Build Tool**: Vite

## Project Structure

```
├── src/
│   ├── components/         # Reusable components
│   │   ├── admin/         # Admin-specific components
│   │   └── ...
│   ├── contexts/          # React contexts (Auth)
│   ├── lib/              # Utility functions and configurations
│   ├── pages/            # Page components
│   └── main.tsx          # Application entry point
├── supabase/
│   └── migrations/       # Database migrations
└── public/              # Static assets
```

## Key Features

- **Bilingual Support**: All content can be managed in two languages
- **Rich Text Editor**: Full-featured WYSIWYG editor with image support
- **Admin Panel**: Secure admin interface for content management
- **Portfolio Section**: Customizable portfolio with social links
- **Hierarchical Documentation**: Support for nested pages and sections
- **Image Management**: Built-in image upload and management
- **Responsive Design**: Mobile-friendly interface

## Getting Started

1. **Prerequisites**
   - Node.js 18 or higher
   - npm or yarn
   - Supabase account

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Installation**
   ```bash
   npm install
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the migration from `supabase/migrations/`
   - Set up storage bucket named 'images' in Supabase

5. **Development**
   ```bash
   npm run dev
   ```

## Deployment Guide

1. **Database Setup**
   - Create a new Supabase project
   - Go to SQL editor and run the migration from `supabase/migrations/`
   - Create a storage bucket named 'images'
   - Enable Row Level Security (RLS)
   - Set up email authentication in Authentication settings

2. **Environment Configuration**
   - Get your Supabase URL and anon key from project settings
   - Configure these in your deployment platform

3. **Build Process**
   ```bash
   npm run build
   ```
   This creates a `dist` directory with optimized assets.

4. **Deployment Options**

   a. **Netlify**:
   - Connect your repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables

   b. **Vercel**:
   - Import your repository
   - Build command will be auto-detected
   - Add environment variables

   c. **Manual Deployment**:
   - Build the project
   - Deploy the `dist` directory to any static hosting service

5. **Post-Deployment**
   - Create an admin user through Supabase Authentication
   - Test the admin login functionality
   - Verify image uploads are working

## Architecture

### Frontend Architecture

- **Context-based State Management**: Uses React Context for auth state
- **Component Hierarchy**: Modular components with clear separation of concerns
- **Route Protection**: Admin routes are protected via AuthProvider
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Database Schema

- **Pages**: Main documentation pages with hierarchical structure
- **Sections**: Content sections within pages
- **Portfolio Content**: Custom portfolio information and social links

### Security

- Row Level Security (RLS) policies protect data
- Admin authentication required for content management
- Secure image upload handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License