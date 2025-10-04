require('dotenv').config();
const mongoose = require('mongoose');
const UserActivityLog = require('./models/UserActivityLog');

// Connect to MongoDB with the same configuration as server.js
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanstreet', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createSampleActivities() {
  try {
    console.log('Creating sample activity logs for testing...');
    
    // You'll need to replace this with an actual user ID from your database
    const sampleUserId = '67171c4ee92570cbeb4fbd5b'; // Replace with real user ID
    
    const sampleActivities = [
      // Authentication Activities
      {
        userId: sampleUserId,
        action: 'login_page_view',
        category: 'authentication',
        details: { 
          pageName: 'Login Page',
          url: 'http://localhost:8080/login',
          pathname: '/login'
        },
        metadata: { deviceType: 'desktop', browser: 'Chrome' },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 35) // 35 minutes ago
      },
      {
        userId: sampleUserId,
        action: 'login',
        category: 'authentication',
        details: { ipAddress: '192.168.1.1', loginMethod: 'password' },
        metadata: { deviceType: 'desktop', browser: 'Chrome' },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      
      // Page Navigation Activities
      {
        userId: sampleUserId,
        action: 'dashboard_view',
        category: 'navigation',
        details: { 
          pageName: 'Dashboard',
          url: 'http://localhost:8080/dashboard',
          pathname: '/dashboard'
        },
        metadata: { deviceType: 'desktop', browser: 'Chrome' },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 28) // 28 minutes ago
      },
      {
        userId: sampleUserId,
        action: 'explore_page_view',
        category: 'navigation',
        details: { 
          pageName: 'Explore Page',
          url: 'http://localhost:8080/explore',
          pathname: '/explore'
        },
        metadata: { deviceType: 'desktop', browser: 'Chrome' },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 26) // 26 minutes ago
      },
      {
        userId: sampleUserId,
        action: 'issue_view',
        category: 'navigation',
        details: { 
          issueId: 'sample-issue-id',
          pageName: 'Issue Detail Page',
          url: 'http://localhost:8080/issues/sample-issue-id',
          pathname: '/issues/sample-issue-id'
        },
        metadata: { deviceType: 'desktop', browser: 'Chrome' },
        targetResource: {
          resourceType: 'issue',
          resourceId: new mongoose.Types.ObjectId(),
          resourceTitle: 'Sample Issue'
        },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 25) // 25 minutes ago
      },
      
      // User Actions
      {
        userId: sampleUserId,
        action: 'issue_vote_up',
        category: 'engagement',
        details: { voteType: 'up' },
        metadata: { deviceType: 'desktop', browser: 'Chrome' },
        targetResource: {
          resourceType: 'issue',
          resourceId: new mongoose.Types.ObjectId(),
          resourceTitle: 'Sample Issue'
        },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 20) // 20 minutes ago
      },
      {
        userId: sampleUserId,
        action: 'bookmarks_view',
        category: 'bookmark',
        details: { 
          pageName: 'Bookmarks Page',
          url: 'http://localhost:8080/bookmarks',
          pathname: '/bookmarks'
        },
        metadata: { deviceType: 'desktop', browser: 'Chrome' },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 18) // 18 minutes ago
      },
      {
        userId: sampleUserId,
        action: 'issue_bookmark',
        category: 'bookmark',
        details: { bookmarkAction: 'bookmark' },
        metadata: { deviceType: 'desktop', browser: 'Chrome' },
        targetResource: {
          resourceType: 'issue',
          resourceId: new mongoose.Types.ObjectId(),
          resourceTitle: 'Sample Issue'
        },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
      },
      {
        userId: sampleUserId,
        action: 'report_page_view',
        category: 'issue_management',
        details: { 
          pageName: 'Report Issue Page',
          url: 'http://localhost:8080/report',
          pathname: '/report'
        },
        metadata: { deviceType: 'desktop', browser: 'Chrome' },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 12) // 12 minutes ago
      },
      {
        userId: sampleUserId,
        action: 'download_activity',
        category: 'download',
        details: { downloadType: 'pdf' },
        metadata: { deviceType: 'desktop', browser: 'Chrome' },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 10) // 10 minutes ago
      },
      {
        userId: sampleUserId,
        action: 'map_view',
        category: 'navigation',
        details: { 
          pageName: 'Maps Page',
          url: 'http://localhost:8080/maps',
          pathname: '/maps'
        },
        metadata: { deviceType: 'mobile', browser: 'Safari' },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 8) // 8 minutes ago
      },
      {
        userId: sampleUserId,
        action: 'share_activity',
        category: 'share',
        details: { shareType: 'link' },
        metadata: { deviceType: 'mobile', browser: 'Safari' },
        isSuccessful: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
      }
    ];

    await UserActivityLog.insertMany(sampleActivities);
    console.log(`✅ Created ${sampleActivities.length} sample activity logs`);
    
    // Display what we created
    const count = await UserActivityLog.countDocuments({ userId: sampleUserId });
    console.log(`Total activities for user ${sampleUserId}: ${count}`);
    
    // Show breakdown by category
    const categories = await UserActivityLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(sampleUserId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nActivity breakdown by category:');
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} activities`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample activities:', error);
    process.exit(1);
  }
}

console.log('NOTE: Please update the sampleUserId variable with a real user ID from your database before running this script.');
console.log('You can find user IDs by checking your users collection in MongoDB.');
console.log('');

createSampleActivities();