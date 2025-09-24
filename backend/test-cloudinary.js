const { uploadImage, uploadAvatar, uploadIssueImage, deleteImage } = require('./utils/cloudinary');
const fs = require('fs');
const path = require('path');

// Test function to verify Cloudinary integration
async function testCloudinaryIntegration() {
  console.log('Testing Cloudinary integration...');
  
  try {
    // Check if we have any existing images in uploads folder to test with
    const uploadsPath = path.join(__dirname, 'uploads', 'images');
    
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath);
      const imageFiles = files.filter(file => 
        file.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)
      );
      
      if (imageFiles.length > 0) {
        const testImagePath = path.join(uploadsPath, imageFiles[0]);
        const imageBuffer = fs.readFileSync(testImagePath);
        
        console.log(`Testing with image: ${imageFiles[0]}`);
        
        // Test general image upload
        const result = await uploadImage(imageBuffer, 'cleanstreet/test');
        console.log('✅ General image upload successful:');
        console.log(`   URL: ${result.secure_url}`);
        console.log(`   Public ID: ${result.public_id}`);
        
        // Test deleting the uploaded image
        const deleteResult = await deleteImage(result.public_id);
        console.log('✅ Image deletion successful:', deleteResult.result);
        
      } else {
        console.log('ℹ️  No image files found in uploads folder for testing');
      }
    } else {
      console.log('ℹ️  No uploads folder found');
    }
    
    console.log('\n✅ Cloudinary configuration appears to be working!');
    console.log('📋 Available functions:');
    console.log('   - uploadImage(buffer, folder, options)');
    console.log('   - uploadAvatar(buffer)');
    console.log('   - uploadIssueImage(buffer)');
    console.log('   - deleteImage(publicId)');
    
  } catch (error) {
    console.error('❌ Cloudinary integration test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testCloudinaryIntegration();
}

module.exports = testCloudinaryIntegration;