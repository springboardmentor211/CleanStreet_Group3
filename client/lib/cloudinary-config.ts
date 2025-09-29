// Cloudinary Configuration for Client-side operations
// These are safe to expose on the client side for unsigned uploads
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'doiho5wlh',
  uploadPreset: 'unsigned_preset', // You would need to create this in Cloudinary dashboard
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '479196295749123' // Safe to expose for client-side operations
};

// API Secret should NEVER be exposed on client side
// The API secret (rXOdnxA0oNTxxuB4fl92TkCsO5o) stays on backend only

// Base URLs for Cloudinary
export const CLOUDINARY_URLS = {
  baseUrl: `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}`,
  uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`
};

// Helper function to generate Cloudinary URLs
export const getCloudinaryUrl = (publicId: string, transformations?: string) => {
  const baseUrl = CLOUDINARY_URLS.baseUrl;
  const transformPart = transformations ? `/${transformations}` : '';
  return `${baseUrl}/image/upload${transformPart}/${publicId}`;
};

// Common transformation presets
export const TRANSFORMATIONS = {
  avatar: 'w_200,h_200,c_fill,g_face,q_auto:good',
  thumbnail: 'w_150,h_150,c_fit,q_auto:good',
  medium: 'w_500,h_500,c_limit,q_auto:good',
  large: 'w_1000,h_1000,c_limit,q_auto:good'
};