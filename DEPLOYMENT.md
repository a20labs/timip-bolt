# TIMIP Deployment Guide

## 🚀 Quick Deploy

### Vercel (Recommended)
```bash
# Deploy to Vercel
npx vercel --prod

# Or connect GitHub repo in Vercel dashboard
# https://vercel.com/new
```

### Netlify
```bash
# Deploy to Netlify
npm run build
npx netlify deploy --prod --dir=dist

# Or connect GitHub repo in Netlify dashboard
```

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy the dist/ folder to your hosting provider
```

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Copy and configure
cp .env.example .env

# Add your Supabase credentials (optional - demo mode works without)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Demo Mode
The application works out of the box with mock data if no Supabase credentials are provided.

## 📦 Production Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm run preview
```

## 🔍 Verification

After deployment, verify:
- ✅ Application loads successfully
- ✅ Logo displays correctly (12rem height on login)
- ✅ Navigation works properly
- ✅ Demo data loads in demo mode
- ✅ PWA features work (if enabled)

## 🌐 Repository

**GitHub:** https://github.com/a20labs/timip.git

## 📊 Features Available

- **Demo Mode:** Full functionality with mock data
- **PWA Support:** Offline capabilities and mobile optimization  
- **Responsive Design:** Works on all device sizes
- **Modern Stack:** React 18, TypeScript, Vite, Tailwind CSS
- **Clean Architecture:** Well-organized codebase with comprehensive documentation
