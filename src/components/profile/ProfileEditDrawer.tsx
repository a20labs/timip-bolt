import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Save, Trash2, Camera } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  user_id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  role: 'ARTIST' | 'FAN' | 'EDU' | 'ADMIN';
  workspace_id: string | null;
  created_at: string;
}

interface ProfileEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export function ProfileEditDrawer({ isOpen, onClose, profile }: ProfileEditDrawerProps) {
  const [formData, setFormData] = useState({
    handle: profile.handle,
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    banner_url: profile.banner_url || '',
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [bannerPreview, setBannerPreview] = useState<string | null>(profile.banner_url);
  
  const queryClient = useQueryClient();

  // Handle file selection for avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file selection for banner
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload file to Supabase Storage
  const uploadFile = async (file: File, path: string): Promise<string> => {
    // In a real app, this would upload to Supabase Storage
    // For demo purposes, we'll just return a mock URL
    console.log(`Uploading ${file.name} to ${path}`);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a mock URL
    return URL.createObjectURL(file);
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      // In a real app, this would call Supabase to update the profile
      console.log('Updating profile with data:', data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { ...profile, ...data };
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile', profile.handle], updatedProfile);
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let avatarUrl = formData.avatar_url;
    let bannerUrl = formData.banner_url;
    
    try {
      // Upload avatar if changed
      if (avatarFile) {
        avatarUrl = await uploadFile(
          avatarFile, 
          `avatars/${profile.id}/${avatarFile.name}`
        );
      }
      
      // Upload banner if changed
      if (bannerFile) {
        bannerUrl = await uploadFile(
          bannerFile,
          `banners/${profile.id}/${bannerFile.name}`
        );
      }
      
      // Update profile
      updateProfileMutation.mutate({
        ...formData,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 h-full overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Profile
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Banner Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Banner Image
            </label>
            <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {bannerPreview ? (
                <img 
                  src={bannerPreview} 
                  alt="Banner preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm font-medium">
                  Change Banner
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleBannerChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-1 rounded-full">
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload a profile picture. Square images work best.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Recommended: 400x400px, max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Handle */}
          <Input
            label="Username"
            value={formData.handle}
            onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
            placeholder="username"
            required
            pattern="^[a-zA-Z0-9_]{3,20}$"
            error={
              formData.handle.match(/^[a-zA-Z0-9_]{3,20}$/) 
                ? undefined 
                : "Username must be 3-20 characters and can only contain letters, numbers, and underscores"
            }
          />

          {/* Display Name */}
          <Input
            label="Display Name"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="Your name"
          />

          {/* Bio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>

          {/* Social Links (for Artists) */}
          {profile.role === 'ARTIST' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Social Links
              </label>
              <div className="space-y-3">
                <Input
                  placeholder="Spotify profile URL"
                  type="url"
                />
                <Input
                  placeholder="Apple Music artist URL"
                  type="url"
                />
                <Input
                  placeholder="Instagram username"
                />
              </div>
            </div>
          )}

          {/* Location */}
          <Input
            label="Location"
            placeholder="City, Country"
          />

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="submit" 
              className="w-full"
              loading={updateProfileMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}