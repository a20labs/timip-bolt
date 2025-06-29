# Fan to Artist Account Conversion Design

## User Experience Flow

### 1. **Discovery Phase**
- Fan users see "Become an Artist" prompts in strategic locations
- Showcase artist features in fan dashboard (with upgrade prompts)
- Success stories of fans who became artists

### 2. **Conversion Process**
```
Fan Account → Account Type Selection → Artist Profile Setup → Feature Unlocking
```

### 3. **Dual Mode Operation**
- Users can toggle between "Fan View" and "Artist View"
- Preserved fan activity (playlists, follows, purchases)
- Enhanced artist capabilities (upload, analytics, commerce)

## Technical Implementation

### Role Enhancement System
```typescript
interface UserRole {
  primary: 'fan' | 'artist' | 'admin' | 'superadmin';
  capabilities: ('fan' | 'artist' | 'moderator')[];
  workspace_id?: string;
  artist_profile_id?: string;
}

// Example converted user
{
  primary: 'artist',
  capabilities: ['fan', 'artist'],
  workspace_id: 'ws_123',
  artist_profile_id: 'artist_456'
}
```

### Navigation System
- **Fan Mode**: Library, Store, Community, Following
- **Artist Mode**: Dashboard, Catalog, Releases, Analytics, Commerce
- **Toggle Switch**: Quick mode switching in header

### Permission Model
- All fan permissions remain active
- Artist permissions added on top
- Workspace created upon conversion
- Billing tied to artist capabilities

## Database Schema Updates

### Users Table Enhancement
```sql
ALTER TABLE users ADD COLUMN capabilities TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN primary_role TEXT DEFAULT 'fan';
ALTER TABLE users ADD COLUMN artist_profile_id UUID REFERENCES artist_profiles(id);
```

### Artist Profiles Table
```sql
CREATE TABLE artist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  artist_name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  conversion_date TIMESTAMP DEFAULT NOW(),
  -- Artist-specific fields
);
```

## UI/UX Considerations

### Header Mode Toggle
```tsx
{user.capabilities.includes('artist') && (
  <ToggleSwitch 
    modes={['Fan', 'Artist']} 
    currentMode={currentMode}
    onChange={setMode}
  />
)}
```

### Progressive Disclosure
- Fan users see artist features as "locked" with clear upgrade path
- Conversion flow prominently placed but not intrusive
- Artist features highlighted with success stories

### Data Continuity
- Fan activity preserved and visible in artist mode
- Social connections maintained
- Purchase history accessible in both modes

## Benefits of This Approach

### For Users
1. **No Lost Data**: Keep all fan history, follows, playlists
2. **Gradual Transition**: Can ease into artist features
3. **Dual Identity**: Remain a fan while creating
4. **Social Preservation**: Don't lose fan connections

### For Platform
1. **Higher Conversion Rates**: Lower friction to become artist
2. **Retained Engagement**: Fans don't abandon platform to create
3. **Network Effects**: Artists with fan history have built-in audience
4. **Revenue Growth**: More artists = more subscription potential

### For Community
1. **Authentic Artists**: Artists who started as fans understand community
2. **Better Curation**: Artist-fans know what fans want
3. **Platform Loyalty**: Deeper investment in ecosystem

## Migration Strategy

### Phase 1: Current State
- Maintain existing fan/artist separation
- Add "Become an Artist" CTAs for fans

### Phase 2: Conversion System
- Implement role enhancement system
- Add artist profile creation flow
- Enable dual-mode navigation

### Phase 3: Optimization
- A/B test conversion flows
- Optimize onboarding experience
- Add advanced artist tools

## Metrics to Track

### Conversion Metrics
- Fan → Artist conversion rate
- Time from account creation to conversion
- Retention after conversion

### Engagement Metrics
- Artist feature usage by converted users
- Fan activity retention post-conversion
- Revenue per converted user

### Success Indicators
- Increased artist signups
- Higher platform engagement
- More content creation
- Revenue growth

---

This approach aligns with modern platform design principles and music industry user behavior patterns.
