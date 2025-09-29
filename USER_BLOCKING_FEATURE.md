# User Blocking Feature Implementation

## Overview
This document outlines the implementation of the user blocking feature that allows administrators to block users who make miscellaneous reports, and automatically soft-delete their issues from public view.

## Backend Changes

### 1. Database Schema Updates

#### User Model (`backend/models/User.js`)
- Added `isBlocked` field (Boolean, default: false)
- Added `blockedAt` field (Date)
- Added `blockedBy` field (ObjectId reference to User)
- Added `blockReason` field (String, max 500 characters)

#### Issue Model (`backend/models/Issue.js`)
- Added `isDeleted` field (Boolean, default: false)
- Added `deletedAt` field (Date)
- Added `deletedBy` field (ObjectId reference to User)

### 2. Admin Controller (`backend/controllers/adminController.js`)
Added new functions:
- `blockUser(req, res)` - Block/unblock users and soft delete their issues
- `getUserDetails(req, res)` - Get detailed user info with block status
- `getBlockedUsers(req, res)` - Get all blocked users

### 3. Admin Routes (`backend/routes/admin.js`)
Added new routes:
- `PUT /admin/users/:userId/block` - Block/unblock a user
- `GET /admin/users/:userId/details` - Get user details
- `GET /admin/users/blocked` - Get all blocked users

### 4. Issues Routes (`backend/routes/issues.js`)
Updated all issue queries to exclude soft-deleted issues:
- Added `isDeleted: { $ne: true }` filter to all public issue queries
- Updated stats calculations to exclude soft-deleted issues
- Prevents blocked users' issues from appearing in public lists

## Frontend Changes

### 1. API Layer (`client/lib/api.ts`)
Added new admin API functions:
- `blockUser(userId, block, reason)` - Block/unblock user
- `getUserDetails(userId)` - Get user details with stats
- `getBlockedUsers()` - Get all blocked users

### 2. Admin Dashboard (`client/pages/AdminDashboard.tsx`)
Enhanced with blocking functionality:

#### New UI Components:
- Block/Unblock buttons for each user
- Block confirmation dialog with reason input
- Blocked Users tab with dedicated view
- Updated stats to show blocked user count

#### New State Management:
- `blockingUserId` - Track which user is being processed
- `showBlockDialog` - Control dialog visibility
- `selectedUser` - Store user being blocked
- `blockReason` - Store block reason

#### New Functions:
- `handleBlockUser()` - Handle block/unblock operations
- `openBlockDialog()` - Open block confirmation dialog

### 3. UI Enhancements:
- Added blocked status badges
- Added block/unblock action buttons
- Added dedicated blocked users tab
- Added warning dialog with block implications
- Added loading states for block operations

## Feature Flow

### Blocking a User:
1. Admin clicks "Block User" button on any regular user
2. Confirmation dialog opens with reason input field
3. Admin enters block reason and confirms
4. Backend:
   - Sets user.isBlocked = true
   - Records blockedAt, blockedBy, blockReason
   - Soft deletes all user's issues (isDeleted = true)
5. Frontend refreshes data and shows success

### Unblocking a User:
1. Admin clicks "Unblock" button on blocked user
2. Backend:
   - Sets user.isBlocked = false
   - Clears block metadata
   - Optionally restores soft-deleted issues
3. Frontend refreshes data

### Public Impact:
- Blocked users' issues no longer appear in:
  - Public issue lists
  - Search results
  - Statistics calculations
  - Dashboard displays
- Users can still log in but their reports are hidden

## Security Features
- Only admins can block/unblock users
- Cannot block other admin users
- All block actions are logged with timestamp and admin info
- Soft delete preserves data for potential restoration

## Database Queries
All public issue queries now include:
```javascript
{ isDeleted: { $ne: true } }
```

Admin queries can still access all issues including soft-deleted ones for management purposes.

## User Interface
- Clear visual indicators for blocked status
- Confirmation dialogs prevent accidental blocks
- Bulk actions for efficient management
- Reason tracking for accountability
- Loading states for better UX

## Future Enhancements
1. Bulk block/unblock operations
2. Automated blocking based on report patterns
3. Block duration/temporary blocks
4. Email notifications to blocked users
5. Appeal process for blocked users
6. Block history/audit logs