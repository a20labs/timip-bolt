import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Star, TrendingUp, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useUserMode } from '../../hooks/useUserMode';
import { fanToArtistService, ConversionData } from '../../services/fanToArtistService';

interface BecomeArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BecomeArtistModal({ isOpen, onClose, onSuccess }: BecomeArtistModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ConversionData>({
    artistName: '',
    bio: '',
    genres: [],
    socialLinks: {},
  });

  const handleConvert = async () => {
    setLoading(true);
    try {
      await fanToArtistService.convertToArtist(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Conversion failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {step === 1 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Become an Artist
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Unlock your creative potential and start sharing your music with the world
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Keep Everything</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your fan history, follows, and playlists stay intact
                </p>
              </Card>
              <Card className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track your music performance and fan engagement
                </p>
              </Card>
              <Card className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Built-in Audience</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start with your existing fan connections
                </p>
              </Card>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Maybe Later
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Set Up Your Artist Profile
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Tell us about your music and identity
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Artist Name *
                </label>
                <Input
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                  placeholder="Your stage name or band name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell fans about your music and story..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instagram (optional)
                </label>
                <Input
                  value={formData.socialLinks?.instagram || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                  placeholder="@yourusername"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleConvert} 
                disabled={!formData.artistName || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Become an Artist'
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function BecomeArtistCTA() {
  const { canConvert } = useUserMode();
  const [showModal, setShowModal] = useState(false);

  if (!canConvert) return null;

  return (
    <>
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Ready to Share Your Music?</h3>
            <p className="text-purple-100 mb-4">
              Convert to an artist account and keep all your fan data
            </p>
            <Button 
              variant="secondary" 
              onClick={() => setShowModal(true)}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Become an Artist
            </Button>
          </div>
          <Music className="w-16 h-16 text-purple-200" />
        </div>
      </Card>

      <BecomeArtistModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          // Refresh the page to update navigation
          window.location.reload();
        }}
      />
    </>
  );
}
