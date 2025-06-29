import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Music, Heart, Mic, Headphones, ArrowRight, Users, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function UserTypeLanding() {
  const navigate = useNavigate();
  const [hoveredType, setHoveredType] = useState<'fan' | 'artist' | null>(null);

  const handleTypeSelection = (type: 'fan' | 'artist') => {
    navigate(`/${type}-landing`);
  };

  return (
    <div className="min-h-screen bg-[#141418] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-sm z-50 border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/TruIndee-Horz-Logo.png" 
              alt="TruIndee" 
              className="h-8 w-auto"
            />
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-[#35A764] bg-clip-text text-transparent"
            >
              Welcome to TruIndee
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-[#F0F0F1] mb-8"
            >
              Your gateway to the music industry
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-[#B7B7B6] max-w-2xl mx-auto"
            >
              Choose your path and discover how TruIndee can transform your music experience
            </motion.p>
          </div>

          {/* Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Fan/Collector Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              onHoverStart={() => setHoveredType('fan')}
              onHoverEnd={() => setHoveredType(null)}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                hoveredType === 'fan' 
                  ? 'border-[#35A764] bg-[#35A764]/10 scale-105' 
                  : 'border-white/30 bg-white/5 hover:border-[#35A764]/50'
              }`}
              onClick={() => handleTypeSelection('fan')}
            >
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  hoveredType === 'fan' 
                    ? 'bg-[#35A764]' 
                    : 'bg-[#35A764]/80'
                }`}>
                  <Heart className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold mb-4">Music Collector</h2>
                <p className="text-[#F0F0F1] mb-6 text-lg">
                  For fans who love discovering, collecting, and supporting artists
                </p>
                
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3 text-[#FEFEFE]">
                    <Headphones className="w-5 h-5 text-[#35A764]" />
                    <span>Discover new music and artists</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#FEFEFE]">
                    <Users className="w-5 h-5 text-[#35A764]" />
                    <span>Connect with fan communities</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#FEFEFE]">
                    <Music className="w-5 h-5 text-[#35A764]" />
                    <span>Build your music library</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-[#35A764] hover:bg-[#2a8a54] text-white border-0"
                >
                  I'm a Music Fan
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              {hoveredType === 'fan' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-[#35A764]/20 rounded-2xl pointer-events-none"
                />
              )}
            </motion.div>

            {/* Artist/Creator Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              onHoverStart={() => setHoveredType('artist')}
              onHoverEnd={() => setHoveredType(null)}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                hoveredType === 'artist' 
                  ? 'border-[#35A764] bg-[#35A764]/10 scale-105' 
                  : 'border-white/30 bg-white/5 hover:border-[#35A764]/50'
              }`}
              onClick={() => handleTypeSelection('artist')}
            >
              <div className="text-center">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  hoveredType === 'artist' 
                    ? 'bg-[#35A764]' 
                    : 'bg-[#35A764]/80'
                }`}>
                  <Mic className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold mb-4">Music Creator</h2>
                <p className="text-[#F0F0F1] mb-6 text-lg">
                  For artists ready to share their music with the world
                </p>
                
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-3 text-[#FEFEFE]">
                    <Music className="w-5 h-5 text-[#35A764]" />
                    <span>Upload and manage your catalog</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#FEFEFE]">
                    <BarChart3 className="w-5 h-5 text-[#35A764]" />
                    <span>Track performance analytics</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#FEFEFE]">
                    <Users className="w-5 h-5 text-[#35A764]" />
                    <span>Build and engage your fanbase</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-[#35A764] hover:bg-[#2a8a54] text-white border-0"
                >
                  I'm an Artist
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              
              {hoveredType === 'artist' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-[#35A764]/20 rounded-2xl pointer-events-none"
                />
              )}
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-center mt-16 mb-16"
          >
            <p className="text-purple-300 mb-4">
              Not sure which path is right for you?
            </p>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-[#F0F0F1] border-white/30 hover:bg-[#35A764]/10"
            >
              Learn More About TruIndee
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
