# Cloudinary Integration - Image Upload Migration

## Overview
This migration replaces the local file storage system (Multer) with Cloudinary cloud storage for handling image uploads in the CleanStreet application.

## Changes Made

### 1. Updated Dependencies
- Added `cloudinary: ^2.5.1` to package.json
- Kept `multer` for handling multipart form data (but now using memory storage)

### 2. New Files Created

#### `backend/utils/cloudinary.js`
- Central Cloudinary configuration and utility functions
- Functions included:
  - `uploadImage(buffer, folder, options)` - General image upload
  - `uploadAvatar(buffer)` - Avatar upload with face-focused cropping (200x200)
  - `uploadIssueImage(buffer)` - Issue image upload optimized for issues (800x600)
  - `deleteImage(publicId)` - Delete images from Cloudinary

#### `backend/test-cloudinary.js`
- Test script to verify Cloudinary integration
- Can be run to test the configuration

### 3. Modified Files

#### `backend/middleware/upload.js`
**Before:** Used disk storage with local file paths
**After:** Uses memory storage and integrates with Cloudinary utilities

#### `backend/routes/issues.js`
**Before:** Saved local file paths in database
**After:** Uploads images to Cloudinary and saves secure URLs in database

#### `backend/routes/upload.js`
**Before:** Empty file
**After:** Complete upload API endpoints:
- `POST /api/upload/image` - Single image upload
- `POST /api/upload/images` - Multiple images upload  
- `POST /api/upload/avatar` - Avatar upload with specific transformations
- `DELETE /api/upload/image/:publicId` - Delete image by public ID

#### `backend/server.js`
**Before:** Served static files from local uploads folder
**After:** Removed static file serving, added upload routes

## Configuration Details

### Cloudinary Settings (Hardcoded as requested)
```javascript
cloud_name: 'doiho5wlh'
api_key: '479196295749123'
api_secret: 'rXOdnxA0oNTxxuB4fl92TkCsO5o'
```

### Image Transformations
- **General Images:** Max 1000x1000px, auto quality
- **Avatars:** 200x200px, face-focused cropping
- **Issue Images:** Max 800x600px, optimized for issue reporting

### Folder Structure in Cloudinary
- `cleanstreet/general/` - General uploads
- `cleanstreet/avatars/` - User profile pictures
- `cleanstreet/issues/` - Issue report images
- `cleanstreet/test/` - Test uploads

## API Endpoints

### Issue Creation (Updated)
`POST /api/issues/`
- Still accepts `images` field with multiple files
- Now uploads to Cloudinary instead of local storage
- Stores Cloudinary secure URLs in database

### New Upload Endpoints
- `POST /api/upload/image` - Single image
- `POST /api/upload/images` - Multiple images
- `POST /api/upload/avatar` - Profile avatar
- `DELETE /api/upload/image/:publicId` - Delete image

## Benefits
1. **Scalability:** No local storage limitations
2. **Performance:** Optimized image delivery via CDN
3. **Automatic Optimization:** Smart compression and format selection
4. **Transformations:** Real-time image resizing and cropping
5. **Reliability:** Cloud storage with backup and redundancy

## Migration Notes
- Existing local images in `/uploads/images/` will still be accessible but new uploads go to Cloudinary
- Database entries will now contain Cloudinary URLs instead of local file paths
- No changes needed on the frontend - the API endpoints remain the same

## Testing
Run the test script to verify integration:
```bash
node backend/test-cloudinary.js
```

## Next Steps (Recommended)
1. Move Cloudinary credentials to environment variables
2. Set up automated cleanup of unused images
3. Implement image compression settings based on use case
4. Add image metadata tracking (upload timestamp, user, etc.)