import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Music, 
  Shield, 
  Users, 
  BarChart3, 
  ShoppingBag, 
  CheckCircle, 
  Bot, 
  ArrowRight, 
  ArrowLeft,
  Target
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Footer } from '../components/ui/Footer';

const heroSlides = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Your Complete Music Industry Platform',
    subtitle: 'Everything you need to create, distribute, and monetize your music'
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'AI-Powered Music Management',
    subtitle: 'Meet your AI team: PAM, LegalBot, and CreativeMuse'
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1600',
    title: 'Grow Your Fan Base',
    subtitle: 'Connect with listeners, sell merch, and build your community'
  }
];

const features = [
  {
    icon: Music,
    title: 'Catalog Management',
    description: 'Store, organize, and manage your entire music catalog in one place with powerful metadata tools.'
  },
  {
    icon: Shield,
    title: 'Rights Management',
    description: 'Protect your intellectual property with integrated copyright, ISRC, and UPC management.'
  },
  {
    icon: Users,
    title: 'Fan Community',
    description: 'Build and engage with your fan base through exclusive content and direct communication.'
  },
  {
    icon: ShoppingBag,
    title: 'Commerce Platform',
    description: 'Sell merchandise, music, and digital collectibles directly to your fans.'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track performance, revenue, and fan engagement across all platforms in real-time.'
  },
  {
    icon: Bot,
    title: 'AI Assistance',
    description: 'Get help with career planning, legal matters, and creative inspiration from your AI team.'
  }
];

const testimonials = [
  {
    quote: "TruIndee has completely transformed how I manage my music career. The all-in-one platform saves me hours every week.",
    author: "Sarah James",
    role: "Independent Artist"
  },
  {
    quote: "The AI team is like having a manager, lawyer, and creative director available 24/7. As an independent artist, this is a game-changer.",
    author: "Mike Chen",
    role: "Producer & DJ"
  },
  {
    quote: "We've integrated TruIndee across our entire label roster. The analytics and rights management tools alone are worth the investment.",
    author: "Taylor Wilson",
    role: "Label Manager"
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '30-day trial',
    description: 'Perfect for getting started',
    features: [
      '5 track uploads',
      'Basic analytics',
      'Fan messaging',
      'Community access'
    ],
    highlighted: false
  },
  {
    name: 'Pro Artist',
    price: '$59.99/mo',
    description: 'For serious artists',
    features: [
      'Unlimited uploads',
      'Advanced analytics',
      'Revenue tracking',
      'Priority support',
      'Custom branding'
    ],
    highlighted: true
  },
  {
    name: 'Indee Label',
    price: '$249.99/mo',
    description: 'For labels and collectives',
    features: [
      'Multi-artist management',
      'White-label platform',
      'Advanced reporting',
      'API access',
      'Dedicated support'
    ],
    highlighted: false
  }
];

export function ArtistLanding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate(); 

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#141418] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-sm z-50 border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <img 
              src="/TruIndee-Horz-Logo.png" 
              alt="TruIndee" 
              className="h-8 w-auto"
            />
            <span className="text-sm font-medium text-white/80">for Artists</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              className="text-white/70 hover:text-[#35A764] transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Features
            </a>
            <a 
              href="#testimonials" 
              className="text-white/70 hover:text-[#35A764] transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Testimonials
            </a>
            <a 
              href="#pricing" 
              className="text-white/70 hover:text-[#35A764] transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Pricing
            </a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth?type=artist')}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/auth?type=artist&signup=true')}
              className="bg-[#35A764] hover:bg-[#2a8a54] text-white"
            >
              Start Creating
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Slideshow */}
      <section className="relative min-h-screen pt-24 flex items-center overflow-hidden">
        {/* Bolt.new Badge */}
        <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer">
          <img
            src="/black_circle_360x360.png"
            alt="Powered by Bolt.new"
            className="absolute top-20 right-6 w-24 h-24 z-20"
          />
        </a>
        
        {/* Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            <motion.div
              key={heroSlides[currentSlide].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-black/40 z-10"></div>
              <img 
                src={heroSlides[currentSlide].image} 
                alt={heroSlides[currentSlide].title} 
                className="object-cover w-full h-full"
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-white' : 'bg-white/40'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto max-w-7xl px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              key={heroSlides[currentSlide].id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {heroSlides[currentSlide].subtitle}
              </p>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate('/auth?type=artist&signup=true')}>
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 ml-2" /> 
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white"
                onClick={() => navigate('/auth')}
              >
                See Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-dark-900">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              TruIndee brings together all the tools artists and labels need in one integrated platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-dark-800 p-8 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl w-12 h-12 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div> 
      </section>

      {/* Testimonial Section */}
      <section id="testimonials" className="py-20 bg-primary-900 text-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Artists & Labels
            </h2>
            <p className="text-xl text-primary-200 max-w-3xl mx-auto">
              Join thousands of music professionals who are transforming their careers with TruIndee
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-primary-800/50 p-8 rounded-xl backdrop-blur-sm"
              >
                <div className="mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-lg mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-primary-300 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TruIndee Section */}
      <section className="py-20 bg-white dark:bg-dark-950">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Artists Choose TruIndee
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All-in-One Solution</h3>
                    <p className="text-gray-600 dark:text-gray-400">Everything you need to run your music business in one place, eliminating the need for multiple disconnected tools.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Assistance</h3>
                    <p className="text-gray-600 dark:text-gray-400">Access expert guidance on demand with our AI team members who specialize in different aspects of the music business.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Built for Artists</h3>
                    <p className="text-gray-600 dark:text-gray-400">Designed by musicians for musicians, with a focus on streamlining the complexities of the music industry.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Grow Your Revenue</h3>
                    <p className="text-gray-600 dark:text-gray-400">Multiple monetization channels in one platform, from streaming to merchandise to NFTs.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img src="https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Artist dashboard" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg mt-8">
                <img src="https://images.pexels.com/photos/7149165/pexels-photo-7149165.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Mobile app" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg">
                <img src="https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg?auto=compress&cs=tinysrgb&w=600" alt="AI integration" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square overflow-hidden rounded-lg mt-8">
                <img src="https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Analytics" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">Choose Your Plan</h2>
            <p className="text-xl text-purple-200">Start free, upgrade as you grow</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className={`p-8 ${
                  plan.highlighted 
                    ? 'bg-gradient-to-b from-blue-500/20 to-purple-500/20 border-blue-400 scale-105' 
                    : 'bg-white/5 border-white/10'
                }`}>
                  {plan.highlighted && (
                    <div className="bg-[#35A764] text-white text-center py-2 px-4 rounded-lg mb-4 font-semibold">
                      Most Popular
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-blue-300 mb-2">{plan.price}</div>
                    <p className="text-purple-200 mb-6">{plan.description}</p>
                    
                    <ul className="space-y-3 mb-8 text-left">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-purple-100">
                          <Target className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        plan.highlighted
                          ? 'bg-[#35A764] hover:bg-[#2a8a54]'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      onClick={() => navigate(`/auth?type=artist&signup=true&plan=${plan.name.toLowerCase()}`)}
                    >
                      {plan.name === 'Starter' ? 'Start Trial' : 
                       plan.name === 'Pro Artist' ? 'Go Pro' :
                       plan.name === 'Indee Label' ? 'Go Indee' : 'Get Started'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Launch Your Music Career?
            </h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Join thousands of artists who are already building their music careers with TruIndee
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                onClick={() => navigate('/auth?type=artist&signup=true&plan=starter')}
                className="bg-[#35A764] hover:bg-[#2a8a54] text-lg px-8 py-4"
              >
                Start Creating Today
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
              <p className="text-purple-300 text-sm">
                30-day trial • Credit/Debit Card Required
              </p>
            </div>
            <p className="text-purple-400 text-xs mt-2">
              Cancel anytime in billing settings
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ArtistLanding;