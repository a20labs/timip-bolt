# TIMIP User Roles and Permissions

This document outlines the user role hierarchy and permission system in the TIMIP platform.

## User Role Hierarchy

### 1. **Super Admin** (`superadmin`)
- **Level**: 100 (Highest)
- **Badge**: 🛡️ "ADMIN" 
- **Icon**: Shield (Amber gradient)
- **Description**: System-wide administrative access

**Permissions:**
- ✅ Full system access
- ✅ Manage all workspaces
- ✅ Manage all users and roles
- ✅ Access admin dashboard
- ✅ View system analytics
- ✅ Manage feature flags
- ✅ System configuration
- ✅ Database access
- ✅ Audit log access

### 2. **Account Owner** (`admin` + `is_account_owner: true`)
- **Level**: 95
- **Badge**: 👑 "Account Owner"
- **Icon**: Crown (Amber gradient)  
- **Description**: Workspace owner with billing and management rights

**Permissions:**
- ✅ Manage workspace settings
- ✅ Manage workspace users
- ✅ Invite new users
- ✅ Manage billing and subscriptions
- ✅ Delete account
- ✅ Manage roles within workspace
- ✅ View workspace analytics
- ✅ Manage integrations
- ✅ Access compliance tools
- ✅ Access admin features within workspace

### 3. **Administrator** (`admin`)
- **Level**: 90
- **Badge**: "Administrator"
- **Icon**: Shield (Primary gradient)
- **Description**: Workspace admin without billing rights

**Permissions:**
- ✅ Manage workspace users
- ✅ Invite new users
- ✅ View workspace analytics
- ✅ Manage integrations
- ✅ Access compliance tools
- ✅ Content moderation
- ❌ Manage billing
- ❌ Delete account
- ❌ Manage account owner role

### 4. **Moderator** (`moderator`)
- **Level**: 70
- **Badge**: "Moderator"
- **Description**: Content moderation and community management

**Permissions:**
- ✅ All Fan permissions (inherited)
- ✅ Moderate user content
- ✅ Manage community posts
- ✅ Handle user reports
- ✅ Basic user management
- ❌ Workspace settings
- ❌ Billing access

### 5. **Artist** (`artist`)
- **Level**: 60
- **Badge**: "Artist"
- **Description**: Content creator with publishing rights

**Permissions:**
- ✅ Upload and manage releases
- ✅ Access catalog management
- ✅ View release analytics
- ✅ Manage artist profile
- ✅ Access commerce tools
- ✅ Manage fan interactions
- ✅ Create and join communities
- ✅ Access AI team features
- ✅ Phone dialer access (if enabled)
- ✅ **Retain all Fan capabilities when converted**
- ❌ Workspace administration
- ❌ User management

### 6. **Fan** (`fan`)
- **Level**: 30 (Base level)
- **Badge**: "Fan"
- **Description**: Consumer with discovery and interaction rights

**Permissions:**
- ✅ Browse catalog
- ✅ Stream content
- ✅ Manage personal library
- ✅ Join communities
- ✅ Follow artists
- ✅ Purchase content
- ✅ Manage personal profile
- ✅ Basic messaging
- ✅ **Convert to Artist account (preserving fan data)**
- ❌ Upload content
- ❌ Access analytics
- ❌ Administrative functions

## Account Conversion System

### Fan → Artist Conversion
- **Process**: Fans can upgrade to Artist accounts while preserving all fan data
- **Data Preservation**: Purchase history, social connections, playlists maintained
- **Dual Capabilities**: Converted artists retain full fan functionality
- **Mode Switching**: Toggle between Fan and Artist views in UI
- **Workspace Creation**: Artist workspace created upon conversion
- **Billing**: Artist subscription required for advanced features

### Conversion Benefits
- **Seamless Transition**: No data loss during conversion
- **Lower Barrier**: Easier path for fans to start creating
- **Social Continuity**: Maintain fan relationships and history
- **Platform Growth**: Encourages content creation from engaged users

## Permission Categories

### Workspace Management
- **Super Admin**: Full access to all workspaces
- **Account Owner**: Full access to owned workspace
- **Administrator**: Management access to assigned workspace
- **Others**: No workspace management access

### User Management
- **Super Admin**: Manage all users system-wide
- **Account Owner**: Manage users in workspace + billing
- **Administrator**: Manage users in workspace (no billing)
- **Moderator**: Limited user management (content-related)
- **Others**: Manage own profile only

### Content Management
- **Super Admin**: All content access
- **Account Owner/Admin**: Workspace content management
- **Moderator**: Content moderation rights
- **Artist**: Create and manage own content
- **Fan**: View and consume content

### Financial/Billing
- **Super Admin**: System billing overview
- **Account Owner**: Full billing management
- **Others**: No billing access

### Analytics & Reporting
- **Super Admin**: System-wide analytics
- **Account Owner/Admin**: Workspace analytics
- **Artist**: Own content analytics
- **Others**: Personal usage only

## Demo Accounts

### Default Demo Users
- **admin@truindee.com**: Super Admin
- **artistdemo@truindee.com**: Artist (Demo Artist)
- **fandemo@truindee.com**: Fan (Demo Fan)

### First User Logic
- First user to register becomes Account Owner with admin role
- Subsequent users get their selected role (artist/fan)
- Account Owner status is determined by `is_account_owner: true` flag

## Navigation & UI Behavior

### Role-Based Routing
- **Super Admin**: Routes to Admin Dashboard by default
- **All Others**: Route to user Dashboard
- **Unauthenticated**: Route to Landing Page

### Sign Out Behavior
- All users are redirected to Landing Page after sign out
- Session and state are completely cleared
- No cached authentication data remains

### Feature Access
- Phone Dialer: Available to Artists (feature flag controlled)
- Admin Dashboard: Super Admin and Account Owners only
- Analytics: Admin+ roles only
- User Management: Admin+ roles only
- Billing: Account Owner only

## Subscription Tiers

### Free Tier
- Basic fan functionality
- Limited artist features
- No advanced analytics

### Paid Tiers
- Enhanced artist tools
- Advanced analytics
- Priority support
- Extended storage

## Security Notes

- Role elevation requires Account Owner or Super Admin approval
- Billing access is restricted to Account Owner only
- System roles (superadmin) cannot be assigned by regular admins
- All role changes are logged in audit trail
- Account deletion requires Account Owner authentication

## Implementation Files

- **Auth Store**: `/src/stores/authStore.ts`
- **User Registration**: `/src/services/userRegistrationService.ts`
- **Permission Service**: `/src/services/pamService.ts`
- **Role Components**: `/src/components/admin/PermissionMatrix.tsx`
- **Navigation Logic**: `/src/hooks/useNavigation.ts`
- **Database Schema**: `/supabase/migrations/` (various role/permission files)

---

*Last Updated: January 2025*
*For technical questions, refer to the codebase or contact the development team.*
