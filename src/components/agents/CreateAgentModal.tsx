import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Bot, Upload, Crown, Image } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { v4 as uuidv4 } from 'uuid';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: any) => void;
  isPro: boolean;
  onUpgrade: () => void;
}

export function CreateAgentModal({ isOpen, onClose, onSave, isPro, onUpgrade }: CreateAgentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    persona: '',
    voice_id: 'eleven-labs-rachel',
    logic_level: 'MEDIUM',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [skills, setSkills] = useState<{ name: string; value: number }[]>([
    { name: '', value: 90 }
  ]);

  // Sample avatar and header images for selection
  const sampleAvatars = [
    'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600',
    'https://images.pexels.com/photos/3771807/pexels-photo-3771807.jpeg?auto=compress&cs=tinysrgb&w=600',
  ];

  const sampleHeaders = [
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/7149165/pexels-photo-7149165.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/3059748/pexels-photo-3059748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/3194519/pexels-photo-3194519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/5669602/pexels-photo-5669602.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  ];

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

  // Handle file selection for header
  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHeaderFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select sample avatar
  const selectSampleAvatar = (url: string) => {
    setAvatarPreview(url);
    setAvatarFile(null);
  };

  // Select sample header
  const selectSampleHeader = (url: string) => {
    setHeaderPreview(url);
    setHeaderFile(null);
  };

  // Add skill field
  const addSkill = () => {
    if (skills.length < 3) {
      setSkills([...skills, { name: '', value: 90 }]);
    }
  };

  // Update skill
  const updateSkill = (index: number, field: 'name' | 'value', value: string | number) => {
    const newSkills = [...skills];
    newSkills[index][field] = value;
    setSkills(newSkills);
  };

  // Remove skill
  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      const newSkills = [...skills];
      newSkills.splice(index, 1);
      setSkills(newSkills);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPro) {
      onUpgrade();
      return;
    }
    
    // Create new agent
    const newAgent = {
      id: uuidv4(),
      ...formData,
      avatarUrl: avatarPreview || sampleAvatars[0],
      headerUrl: headerPreview || sampleHeaders[0],
      skills: skills.filter(skill => skill.name.trim() !== ''),
      active: true,
      isCustom: true
    };
    
    onSave(newAgent);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Create Custom Agent
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!isPro && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                    Pro Feature
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Creating custom agents requires a Pro subscription. Upgrade now to unlock this feature.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Basic Information
            </h3>
            
            <Input
              label="Agent Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Marketing Guru"
              required
            />
            
            <Input
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g., Marketing Specialist"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what this agent does"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                required
              />
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Skills
              </h3>
              {skills.length < 3 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addSkill}
                >
                  Add Skill
                </Button>
              )}
            </div>
            
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    placeholder="Skill name"
                    required
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    value={skill.value}
                    onChange={(e) => updateSkill(index, 'value', parseInt(e.target.value))}
                    min={1}
                    max={100}
                    required
                  />
                </div>
                {skills.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeSkill(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Avatar Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Avatar Image
            </h3>
            
            {/* Sample avatars */}
            <div className="grid grid-cols-6 gap-2">
              {sampleAvatars.map((url, index) => (
                <div 
                  key={index}
                  className={`w-16 h-16 rounded-full overflow-hidden cursor-pointer border-2 ${
                    avatarPreview === url ? 'border-primary-500' : 'border-transparent'
                  }`}
                  onClick={() => selectSampleAvatar(url)}
                >
                  <img 
                    src={url} 
                    alt={`Sample avatar ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* Custom avatar upload */}
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
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Avatar (Optional)
                </label>
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Header Image Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Header Image
            </h3>
            
            {/* Sample headers */}
            <div className="grid grid-cols-3 gap-2">
              {sampleHeaders.map((url, index) => (
                <div 
                  key={index}
                  className={`h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${
                    headerPreview === url ? 'border-primary-500' : 'border-transparent'
                  }`}
                  onClick={() => selectSampleHeader(url)}
                >
                  <img 
                    src={url} 
                    alt={`Sample header ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* Custom header upload */}
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {headerPreview ? (
                  <img 
                    src={headerPreview} 
                    alt="Header preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Header (Optional)
                </label>
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleHeaderChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Advanced Settings
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Persona
              </label>
              <textarea
                value={formData.persona}
                onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                placeholder="Detailed description of the agent's personality and expertise"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voice
                </label>
                <select
                  value={formData.voice_id}
                  onChange={(e) => setFormData({ ...formData, voice_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="eleven-labs-rachel">Rachel (Female)</option>
                  <option value="eleven-labs-antoni">Antoni (Male)</option>
                  <option value="eleven-labs-bella">Bella (Female)</option>
                  <option value="eleven-labs-josh">Josh (Male)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logic Level
                </label>
                <select
                  value={formData.logic_level}
                  onChange={(e) => setFormData({ ...formData, logic_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="MAX">MAX - Highly analytical</option>
                  <option value="MEDIUM">MEDIUM - Balanced</option>
                  <option value="MIN">MIN - Creative, less constrained</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="submit" 
              className="w-full"
            >
              {isPro ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Agent
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Create
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}