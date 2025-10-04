const mongoose = require('mongoose');
const UserActivityLog = require('./models/UserActivityLog');
require('dotenv').config();

/**
 * Migration script to add category field to existing activity logs
 * This should be run once after deploying the new activity logging system
 */

const actionToCategoryMapping = {
  // Authentication Activities
  'login': 'authentication',
  'logout': 'authentication', 
  'register': 'authentication',
  'password_reset': 'authentication',
  'password_change': 'authentication',
  
  // Issue Activities
  'issue_create': 'issue_management',
  'issue_view': 'navigation',
  'issue_edit': 'issue_management', 
  'issue_delete': 'issue_management',
  'issue_vote_up': 'engagement',
  'issue_vote_down': 'engagement',
  'issue_comment': 'engagement',
  'issue_bookmark': 'bookmark',
  'issue_unbookmark': 'bookmark',
  'issue_bookmark_toggle': 'bookmark',
  
  // Content Interaction Activities
  'download_activity': 'download',
  'share_activity': 'share', 
  'like_activity': 'engagement',
  'dislike_activity': 'engagement',
  
  // Profile Activities
  'profile_view': 'profile',
  'profile_edit': 'profile',
  'profile_photo_upload': 'profile',
  
  // Content Activities
  'download_pdf': 'download',
  'share_issue': 'share',
  'search_performed': 'navigation',
  'map_view': 'navigation',
  'location_search': 'navigation',
  
  // Admin Activities
  'admin_dashboard_view': 'admin',
  'admin_user_view': 'admin',
  'admin_user_profile_view': 'admin',
  'admin_user_block': 'admin',
  'admin_user_unblock': 'admin',
  'admin_issue_status_change': 'admin',
  'admin_analytics_export': 'admin',
  
  // General Navigation
  'page_view': 'navigation',
  'session_start': 'authentication',
  'session_end': 'authentication',
  'api_request': 'navigation'
};

async function migrateActivityLogs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanstreet', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    console.log('Starting activity log migration...');

    // Count total logs without category
    const totalLogs = await UserActivityLog.countDocuments({ 
      category: { $exists: false } 
    });
    console.log(`Found ${totalLogs} activity logs without category`);

    if (totalLogs === 0) {
      console.log('No activity logs need migration');
      return;
    }

    let migratedCount = 0;
    let unknownActions = new Set();

    // Process in batches to avoid memory issues
    const batchSize = 100;
    let skip = 0;

    while (skip < totalLogs) {
      const logs = await UserActivityLog.find({ 
        category: { $exists: false } 
      })
      .limit(batchSize)
      .skip(skip);

      if (logs.length === 0) break;

      // Update each log with appropriate category
      for (const log of logs) {
        const category = actionToCategoryMapping[log.action];
        
        if (category) {
          log.category = category;
          await log.save();
          migratedCount++;
        } else {
          unknownActions.add(log.action);
          // Set default category for unknown actions
          log.category = 'navigation';
          await log.save();
          migratedCount++;
        }
      }

      skip += batchSize;
      console.log(`Migrated ${migratedCount}/${totalLogs} logs...`);
    }

    console.log(`Migration completed! Updated ${migratedCount} activity logs`);
    
    if (unknownActions.size > 0) {
      console.log('Unknown actions found (assigned to navigation category):');
      Array.from(unknownActions).forEach(action => console.log(`  - ${action}`));
    }

    // Verify migration
    const remainingLogs = await UserActivityLog.countDocuments({ 
      category: { $exists: false } 
    });
    
    if (remainingLogs === 0) {
      console.log('✅ All activity logs now have categories');
    } else {
      console.log(`⚠️  ${remainingLogs} logs still missing categories`);
    }

    // Show category distribution
    const categoryStats = await UserActivityLog.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\nCategory distribution:');
    categoryStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateActivityLogs()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateActivityLogs };