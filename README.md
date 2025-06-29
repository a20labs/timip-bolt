# TIMIP - TruIndee Music Industry Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

TruIndee is a comprehensive music industry platform built for artists, labels, and music professionals. It provides everything needed to manage music catalogs, handle compliance requirements, run commerce operations, build communities, and analyze performance.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (optional - demo mode available)

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:a20labs/timip.git
   cd timip
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials (optional - works in demo mode)
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

### Demo Mode

The application works out of the box with mock data if no Supabase credentials are provided. Perfect for testing and development!

## 📋 Documentation

- **[User Roles & Permissions](USER_ROLES_PERMISSIONS.md)** - Complete guide to user roles and permission system
- **[Fan to Artist Conversion](FAN_TO_ARTIST_CONVERSION.md)** - Account conversion system design and implementation
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[Changelog](CHANGELOG.md)** - Version history and updates

## 🚀 Features

### Core Platform
- **Workspace Management**: Multi-user workspaces with role-based access control
- **Authentication**: Secure email-based authentication with magic links
- **Real-time Updates**: Live data synchronization across all features

### Music Catalog Management
- **Track Upload & Management**: Drag-and-drop file uploads with metadata management
- **Release Management**: Create and manage albums, EPs, and singles
- **ISRC Integration**: Automatic ISRC code assignment and management
- **File Processing**: Support for multiple audio formats with automatic processing

### Compliance Wizard
- **ISRC Registration**: Automated ISRC block registration with USISRC integration
- **UPC/Barcode Purchase**: Streamlined UPC code purchasing through GS1
- **EIN Registration**: Direct integration with IRS for business registration
- **Compliance Tracking**: Visual progress tracking and status management

### Commerce & NFTs
- **Product Management**: Create and manage physical and digital products
- **Order Processing**: Complete order management with Stripe integration
- **NFT Marketplace**: Mint and sell exclusive digital collectibles on Algorand
- **Revenue Tracking**: Comprehensive sales and revenue analytics

### Community Features
- **Social Feed**: Artist-fan interaction with posts, likes, and comments
- **Live Streaming**: Integrated live streaming capabilities
- **Fan Memberships**: Tiered membership system with exclusive content
- **Event Management**: Schedule and manage virtual events

### Analytics Dashboard
- **Performance Metrics**: Track streams, revenue, and engagement
- **Audience Insights**: Detailed demographic and geographic analytics
- **Campaign Management**: Monitor marketing campaign performance
- **Revenue Analytics**: Platform-specific revenue breakdown

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **Zustand** for state management
- **React Router** for navigation
- **Recharts** for data visualization

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** for live updates
- **Edge Functions** for serverless computing

### Integrations
- **Stripe** for payment processing
- **Algorand** for NFT minting
- **USISRC** for ISRC registration
- **GS1** for UPC code purchasing
- **Tavus** for personalized video generation

### Mobile & PWA
- **Progressive Web App** with offline support
- **Capacitor** for native mobile deployment
- **Responsive design** for all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account and project
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/truindee.git
   cd truindee
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations from `supabase/migrations/`
   - Update environment variables with your Supabase credentials

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Update with your actual values
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Access the application**
   - Open http://localhost:5173 in your browser
   - Use demo credentials: `artistdemo@truindee.com` or `fandemo@truindee.com`

## 📱 Mobile Development

### PWA Installation
The app automatically prompts for PWA installation on supported devices.

### Native Mobile (Capacitor)
```bash
# Add mobile platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android
```

## 🗄 Database Schema

The platform uses a comprehensive PostgreSQL schema with the following key tables:

- **workspaces**: Organization/artist workspaces
- **workspace_members**: User roles and permissions
- **tracks**: Music track metadata and files
- **releases**: Album/EP release information
- **products**: Commerce products (vinyl, merch, NFTs)
- **orders**: Purchase orders and fulfillment
- **posts**: Community posts and interactions
- **livestreams**: Live streaming events
- **memberships**: Fan membership tiers

All tables include Row Level Security (RLS) policies for secure multi-tenant access.

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Payment Processing
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Additional Integrations
TAVUS_API_KEY=your_tavus_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### ⚡ Quick Stripe Setup

**Option 1: Quick Start (Fastest)**
```bash
./scripts/stripe-quick-start.sh
```

**Option 2: Complete Setup (Recommended)**
```bash
./scripts/complete-stripe-setup.sh
```

**Option 3: Manual Setup**
1. Copy `.env.local.template` to `.env.local`
2. Add your Stripe keys from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
3. Deploy Edge Functions: `supabase functions deploy stripe-checkout stripe-webhook`
4. Create products in Stripe Dashboard with these exact price IDs:
   - Starter: `price_1RdyvG4fVYS0vpWMUUyTvf9q`
   - Pro Artist: `price_1Rdyc84fVYS0vpWMPcMIkqbP`
   - Indie Label: `price_1RdyfT4fVYS0vpWMgeGm7yJQ`

### Stripe Integration
TIMIP includes full Stripe integration for subscription billing:

- **Subscription Plans**: 
  - Starter (Free): 5 tracks, basic features
  - Pro Artist ($59.99/month): Unlimited tracks, advanced analytics
  - Indie Label ($249.99/month): Everything + white-labeling
- **Secure Checkout**: Stripe Checkout with redirect flow
- **Webhook Processing**: Real-time subscription status updates
- **Billing Management**: Customer portal for subscription management

**📚 Detailed Documentation:**
- Complete Setup: `STRIPE_COMPLETE_SETUP.md`
- Integration Guide: `STRIPE_INTEGRATION_GUIDE.md`
- Deployment Checklist: `STRIPE_DEPLOYMENT_CHECKLIST.md`

### Supabase Edge Functions
The platform includes several edge functions for external integrations:
- `stripe-checkout`: Secure Stripe checkout session creation
- `stripe-webhook`: Webhook processing for subscription updates
- `isrc-block`: ISRC registration with USISRC
- `gs1-purchase`: UPC code purchasing
- `nft-mint`: Algorand NFT minting
- `tavus-generate`: Personalized video generation

## 🎯 Demo Accounts

For testing and demonstration:
- **Artist Account**: `artistdemo@truindee.com`
- **Fan Account**: `fandemo@truindee.com`
- **Password**: Available in demo mode

## 🏗 Architecture

### Frontend Architecture
- **Component-based**: Modular React components with TypeScript
- **State Management**: Zustand for global state, React Query for server state
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router with protected routes
- **Forms**: React Hook Form with validation

### Backend Architecture
- **Serverless**: Supabase edge functions for business logic
- **Database**: PostgreSQL with RLS for security
- **Real-time**: WebSocket connections for live updates
- **File Storage**: Supabase Storage for media files
- **Authentication**: Supabase Auth with magic links

### Security
- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **CORS Protection**: Proper cross-origin request handling
- **Input Validation**: Server-side validation for all inputs

## 🚀 Deployment

### Web Deployment (Netlify)
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Database Deployment
```bash
# Apply migrations to production
supabase db push --linked
```

### Edge Functions Deployment
```bash
# Deploy all edge functions
supabase functions deploy
```

## 🔧 Supabase CLI

The project includes the Supabase CLI as a dev dependency for easier development and deployment.

### CLI Commands
```bash
# Use the local CLI via npm script
npm run supabase -- --version

# Deploy functions
npm run supabase -- functions deploy stripe-checkout

# Push database changes
npm run supabase -- db push --linked

# List functions
npm run supabase -- functions list
```

### Updating the CLI
The CLI is installed as a dev dependency and will be automatically updated when you run:
```bash
npm install
```

To manually update to the latest version:
```bash
npm update supabase --save-dev
```

### CLI Version
Current version: 2.26.9 (latest)

### TypeScript Configuration
- **Version**: 5.4.5 (stable, compatible with Deno Edge Functions)
- **Deno Support**: Edge Functions in `supabase/functions/` use Deno runtime
- **VS Code**: Configured with Deno support for Edge Functions directory

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests (Cypress)
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Bundle Size**: Optimized with code splitting
- **Caching**: Aggressive caching for static assets
- **CDN**: Global content delivery network
- **Image Optimization**: Automatic image compression and resizing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.truindee.com](https://docs.truindee.com)
- **Discord**: [Join our community](https://discord.gg/truindee)
- **Email**: support@truindee.com
- **GitHub Issues**: [Report bugs](https://github.com/truindee/truindee/issues)

## 🎵 Built for Musicians, by Musicians

TruIndee was created to solve real problems in the music industry. From independent artists to major labels, our platform provides the tools needed to succeed in today's digital music landscape.

---

**Built with ❤️ using [Bolt.new](https://bolt.new)**

*This project was created as part of the Bolt.new hackathon, showcasing the power of AI-assisted development for complex, production-ready applications.*