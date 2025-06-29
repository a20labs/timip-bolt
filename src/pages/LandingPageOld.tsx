import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Shield, Users, BarChart3, ShoppingBag, CheckCircle, Bot, Crown, ArrowRight, Info, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/ui/Footer';
import { useStripe } from '../hooks/useStripe';
import { supabase } from '../lib/supabase';
import { products } from '../stripe-config';

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

export function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate(); 
  const { createCheckoutSession, isLoading, error } = useStripe();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Regular sign in function
  const handleSignIn = () => {
    navigate('/auth');
  };

  // Handle subscription selection
  const handleSubscribe = useCallback(async (planName: string) => {
    setLoadingPlan(planName);
    
    try {
      // Check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // User not authenticated, store the plan they want and redirect to auth
        localStorage.setItem('pendingSubscription', planName);
        navigate(`/auth?return_to=${encodeURIComponent('/subscription?plan=' + encodeURIComponent(planName))}`);
        return;
      }

      // Find the corresponding product in stripe-config
      const product = products.find(p => p.name === planName);
      if (!product) {
        console.error('Product not found:', planName);
        return;
      }

      // For the free starter plan, redirect to subscription page instead of Stripe
      if (product.price === 0) {
        navigate('/subscription?plan=' + encodeURIComponent(planName));
        return;
      }

      // For Contact Sales (Indee Label), redirect to subscription page
      if (planName === 'Indee Label') {
        navigate('/subscription?plan=' + encodeURIComponent(planName));
        return;
      }

      // Create Stripe checkout session for paid plans
      await createCheckoutSession(
        product.priceId, 
        product.mode, 
        '/settings?checkout=success'
      );
    } catch (error) {
      console.error('Error during subscription process:', error);
    } finally {
      setLoadingPlan(null);
    }
  }, [navigate, createCheckoutSession, setLoadingPlan]);

  // Check for pending subscription from localStorage (after auth redirect)
  useEffect(() => {
    const pendingSubscription = localStorage.getItem('pendingSubscription');
    if (pendingSubscription) {
      localStorage.removeItem('pendingSubscription');
      // Auto-trigger the subscription flow
      setTimeout(() => {
        handleSubscribe(pendingSubscription);
      }, 1000); // Give the page time to load
    }
  }, [handleSubscribe]);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-dark-950/80 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <img 
              src="/TruIndee-Horz-Logo.png" 
              alt="TruIndee Logo" 
              className="h-12"
            />
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Pricing</a>
          </nav>
          
          <Button onClick={handleSignIn}>
            Sign In
          </Button>
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
              <Button size="lg" onClick={handleSignIn}>
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
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-dark-900">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose the plan that's right for your career stage
            </p>
          </div>
          
          {/* Stripe Error Display */}
          {error && (
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-red-600 dark:text-red-400">
                    <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">Payment Error</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((tier, index) => {
              const isCurrentlyLoading = loadingPlan === tier.name;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`
                    bg-white dark:bg-dark-800 p-8 rounded-xl shadow-sm 
                    ${tier.highlighted ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}
                    relative
                  `}
                >
                  {tier.highlighted && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {tier.name}
                  </h3> 
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">${tier.price}</span>
                    {tier.price > 0 && <span className="text-gray-600 dark:text-gray-400">/month</span>}
                    {tier.name === 'Starter' && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        30-day trial, then converts to Pro Artist
                      </p>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span> 
                      </li>
                    ))}
                    {tier.name === 'Starter' && (
                      <li className="flex items-start gap-2 text-gray-500">
                        <Info className="w-5 h-5 text-orange-500 mt-0.5" />
                        <span>Converts to Pro Artist after 30 days</span>
                      </li>
                    )}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={tier.highlighted ? 'primary' : 'outline'}
                    onClick={() => handleSubscribe(tier.name)}
                    disabled={isCurrentlyLoading || isLoading}
                  >
                    {isCurrentlyLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {tier.name === 'Pro Artist' && <Crown className="w-4 h-4 mr-2" />}
                        {tier.name === 'Starter' ? '30-Day Trial' : 
                         tier.name === 'Pro Artist' ? 'Go Pro' : 
                         'Go Indee'}
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
          
          {/* Demo Button for Pricing Section */}
          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              Want to see TruIndee in action first?
            </p>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/auth')}
              className="mx-auto"
            >
              See Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-700 text-white">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Music Career?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-6">
            Join thousands of artists who are taking control of their music business with TruIndee
          </p>
          <div className="flex gap-4 flex-wrap justify-center mb-6">
            <Button 
              size="lg" 
              className="bg-white text-[#1c1c1c] hover:bg-white/90"
              onClick={() => handleSubscribe('Starter')}
              disabled={isLoading || loadingPlan === 'Starter'}
            >
              {loadingPlan === 'Starter' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Start Your 30-Day Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white"
              onClick={() => navigate('/subscription')}
            >
              View Plans
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white"
              onClick={() => navigate('/auth')}
            >
              See Demo
            </Button>
          </div>
          <p className="text-sm text-white/70 max-w-2xl mx-auto">
            Start with a 30-day trial. After your trial period, your account will automatically convert to the Pro Artist plan at $59.99/month unless canceled.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;