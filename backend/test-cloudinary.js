const { uploadIssueImage } = require('./utils/cloudinary');
const fs = require('fs');
const path = require('path');

// Test Cloudinary upload
async function testCloudinaryUpload() {
  try {
    console.log('Testing Cloudinary upload...');
    
    // Check if there are any test images
    const uploadsDir = path.join(__dirname, 'uploads', 'images');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      if (files.length > 0) {
        const testFile = path.join(uploadsDir, files[0]);
        const buffer = fs.readFileSync(testFile);
        
        console.log(`Uploading test file: ${files[0]}`);
        const result = await uploadIssueImage(buffer);
        console.log('Upload successful!');
        console.log('Cloudinary URL:', result.secure_url);
        console.log('Public ID:', result.public_id);
        return result;
      }
    }
    
    console.log('No test images found in uploads directory');
    return null;
  } catch (error) {
    console.error('Cloudinary upload test failed:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testCloudinaryUpload()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCloudinaryUpload };