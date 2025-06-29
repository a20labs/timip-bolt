import { useNavigate } from 'react-router-dom';
import { Star, Music, Download, CheckCircle, Search, Bell, User, ArrowLeft, Shield, Zap, Heart, Play, Users, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function FanLanding() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  const handleSignIn = () => {
    navigate('/auth?mode=signin');
  };

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
            <span className="text-sm font-medium text-white/80">for Fans</span>
          </div>

          <div className="flex items-center gap-4">
            <Search className="w-6 h-6 text-white/70 hover:text-white transition-colors cursor-pointer" />
            <Bell className="w-6 h-6 text-white/70 hover:text-white transition-colors cursor-pointer" />
            <User 
              className="w-6 h-6 text-white/70 hover:text-white transition-colors cursor-pointer" 
              onClick={handleSignIn}
            />
            <button 
              onClick={handleGetStarted}
              className="bg-[#35A764] hover:bg-[#2a8a54] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 px-6 md:px-20 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            {/* Left Content */}
            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Personalize Your{' '}
                  <span className="text-[#35A764]">Music</span>{' '}
                  Experience
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl">
                  Discover your next favorite song with our AI-powered recommendations. 
                  Create playlists that match your mood and connect with artists you love.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleGetStarted}
                  className="bg-[#35A764] hover:bg-[#2a8a54] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  Start Listening Now
                </button>
                <button 
                  className="border border-white/30 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center gap-3"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Visual - Cross Pattern */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-96 h-96">
                {/* Cross Pattern Background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Vertical bar */}
                  <div className="absolute w-16 h-80 bg-gradient-to-b from-[#35A764] to-purple-500 rounded-full"></div>
                  {/* Horizontal bar */}
                  <div className="absolute w-80 h-16 bg-gradient-to-r from-[#35A764] to-purple-500 rounded-full"></div>
                </div>
                
                {/* Floating Album Covers */}
                <div className="absolute top-8 left-8 w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center transform rotate-12">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-8 right-8 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center transform -rotate-12">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-8 left-8 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center transform -rotate-12">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center transform rotate-12">
                  <Music className="w-8 h-8 text-white" />
                </div>
                
                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="w-10 h-10 text-[#35A764] ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl md:text-4xl font-bold">50M+</div>
              <div className="text-sm md:text-base opacity-90">Songs Available</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold">10M+</div>
              <div className="text-sm md:text-base opacity-90">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold">500K+</div>
              <div className="text-sm md:text-base opacity-90">Artists</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold">1M+</div>
              <div className="text-sm md:text-base opacity-90">Playlists</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Music Section */}
      <section className="py-20 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Album Visual */}
            <div className="flex-1">
              <div className="relative">
                <div className="w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Music className="w-20 h-20 mx-auto mb-4" />
                      <div className="text-2xl font-bold">Music Experience</div>
                    </div>
                  </div>
                  {/* Vinyl record effect */}
                  <div className="absolute inset-8 border-4 border-white/30 rounded-full"></div>
                  <div className="absolute inset-16 border-2 border-white/20 rounded-full"></div>
                  <div className="absolute inset-20 bg-black/40 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold">
                  About <span className="text-[#35A764]">Music</span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Music is the universal language that connects hearts and souls. 
                  Our platform brings you closer to the artists you love and helps 
                  you discover new sounds that resonate with your unique taste.
                </p>
                <p className="text-lg text-gray-400">
                  With our advanced AI technology, we curate personalized playlists 
                  that evolve with your preferences, ensuring every listening 
                  session is a journey of discovery.
                </p>
              </div>
              
              <button className="bg-[#35A764] hover:bg-[#2a8a54] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-6 md:px-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Why Choose <span className="text-[#35A764]">TruIndee</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience music like never before with our cutting-edge features designed for true music lovers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#35A764]/50 transition-all duration-300">
              <div className="w-16 h-16 bg-[#35A764] rounded-2xl flex items-center justify-center mb-6">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">High Quality Audio</h3>
              <p className="text-gray-300">
                Experience crystal-clear sound with our lossless audio streaming technology.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#35A764]/50 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Recommendations</h3>
              <p className="text-gray-300">
                Our smart algorithm learns your taste and suggests perfect tracks.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#35A764]/50 transition-all duration-300">
              <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Social Features</h3>
              <p className="text-gray-300">
                Connect with friends, share playlists, and discover music together.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#35A764]/50 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure & Private</h3>
              <p className="text-gray-300">
                Your data is protected with industry-leading security measures.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#35A764]/50 transition-all duration-300">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Offline Listening</h3>
              <p className="text-gray-300">
                Download your favorite tracks and enjoy music anywhere, anytime.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-[#35A764]/50 transition-all duration-300">
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Loved by Millions</h3>
              <p className="text-gray-300">
                Join millions of satisfied users who trust TruIndee for their music needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Music Section */}
      <section className="py-20 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Popular <span className="text-[#35A764]">Music</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover trending tracks and timeless classics loved by our community.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "Pop Hits", gradient: "from-pink-500 to-rose-500" },
              { name: "Rock Classics", gradient: "from-red-500 to-orange-500" },
              { name: "Jazz Vibes", gradient: "from-blue-500 to-purple-500" },
              { name: "Electronic", gradient: "from-cyan-500 to-blue-500" },
              { name: "Hip Hop", gradient: "from-purple-500 to-pink-500" },
              { name: "Indie Mix", gradient: "from-green-500 to-teal-500" }
            ].map((genre, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`aspect-square bg-gradient-to-br ${genre.gradient} rounded-3xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <Music className="w-12 h-12 text-white relative z-10" />
                </div>
                <h3 className="text-center font-semibold text-lg">{genre.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Reviews Section */}
      <section className="py-20 px-6 md:px-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              What Our <span className="text-[#35A764]">Users</span> Say
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Read testimonials from music lovers around the world who've made TruIndee their go-to platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                name: "Sarah Johnson", 
                role: "Music Enthusiast", 
                rating: 5,
                text: "TruIndee has completely transformed how I discover music. The AI recommendations are spot-on!",
                gradient: "from-pink-500 to-purple-500"
              },
              { 
                name: "Mike Chen", 
                role: "Playlist Curator", 
                rating: 5,
                text: "The social features are amazing. I love sharing playlists with friends and discovering new artists.",
                gradient: "from-blue-500 to-cyan-500"
              },
              { 
                name: "Emma Davis", 
                role: "Casual Listener", 
                rating: 4,
                text: "Great audio quality and offline features. Perfect for my daily commute and workouts.",
                gradient: "from-green-500 to-teal-500"
              }
            ].map((review, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${review.gradient} rounded-full flex items-center justify-center mr-4`}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{review.name}</h4>
                    <p className="text-gray-400">{review.role}</p>
                    <div className="flex mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-[#EB9A17] text-[#EB9A17]' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Mobile Mockup */}
            <div className="flex-1">
              <div className="relative max-w-sm mx-auto">
                <div className="w-80 h-[640px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-6 border-8 border-gray-700">
                  <div className="w-full h-full bg-[#141418] rounded-[2rem] p-6 flex flex-col">
                    {/* Phone Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-6 h-6 bg-[#35A764] rounded-full"></div>
                      <div className="text-white font-bold">TruIndee</div>
                      <User className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Now Playing */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-6">
                      <div className="text-white text-center">
                        <Music className="w-12 h-12 mx-auto mb-2" />
                        <div className="font-bold">Now Playing</div>
                        <div className="text-sm opacity-80">Your Favorite Song</div>
                      </div>
                    </div>
                    
                    {/* Playlist */}
                    <div className="space-y-3 flex-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                          <div className={`w-10 h-10 bg-gradient-to-br from-blue-${500 + i*100} to-purple-${500 + i*100} rounded-lg`}></div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">Track {i}</div>
                            <div className="text-gray-400 text-xs">Artist Name</div>
                          </div>
                          <Play className="w-4 h-4 text-[#35A764]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold">
                  Take Your Music <span className="text-[#35A764]">Anywhere</span>
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  Download our mobile app and enjoy your favorite music on the go. 
                  Available for iOS and Android with all the features you love.
                </p>
                <ul className="space-y-4 text-lg text-gray-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[#35A764]" />
                    Offline listening capabilities
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[#35A764]" />
                    Cross-device synchronization
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[#35A764]" />
                    Enhanced mobile controls
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-[#35A764]" />
                    Background playback
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-black text-white px-6 py-3 rounded-xl border border-white/20 flex items-center gap-3 hover:bg-gray-900 transition-colors">
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="font-bold">App Store</div>
                  </div>
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-xl border border-white/20 flex items-center gap-3 hover:bg-gray-900 transition-colors">
                  <Smartphone className="w-6 h-6" />
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="font-bold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/truindee-logo.svg" 
                  alt="TruIndee" 
                  className="w-8 h-8"
                />
                <h3 className="text-2xl font-bold text-white">TruIndee</h3>
              </div>
              <p className="text-gray-400">
                Discover, collect, and share music like never before with our AI-powered platform.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Product</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-[#35A764] transition-colors">Features</a>
                <a href="#" className="block hover:text-[#35A764] transition-colors">Pricing</a>
                <a href="#" className="block hover:text-[#35A764] transition-colors">Mobile App</a>
                <a href="#" className="block hover:text-[#35A764] transition-colors">API</a>
              </div>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Company</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-[#35A764] transition-colors">About Us</a>
                <a href="#" className="block hover:text-[#35A764] transition-colors">Careers</a>
                <a href="#" className="block hover:text-[#35A764] transition-colors">Contact</a>
                <a href="#" className="block hover:text-[#35A764] transition-colors">Blog</a>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Legal</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-[#35A764] transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-[#35A764] transition-colors">Terms of Service</a>
                <a href="#" className="block hover:text-[#35A764] transition-colors">Cookie Policy</a>
                <a href="#" className="block hover:text-[#35A764] transition-colors">DMCA</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400">© 2024 TruIndee. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-[#35A764] transition-colors">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-[#35A764] transition-colors">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-[#35A764] transition-colors">Instagram</a>
                <a href="#" className="text-gray-400 hover:text-[#35A764] transition-colors">YouTube</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
