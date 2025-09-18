// async function testIssueModel(user) {
//   console.log('\n🧪 Testing Issue model...');
//   try {
//     const Issue = require('./models/Issue');
    
//     // Clean up any existing test issues
//     await Issue.deleteMany({ title: TEST_ISSUE.title });
    
//     // Create test issue with simple address format
//     const issueData = {
//       ...TEST_ISSUE,
//       reportedBy: user._id
//     };
    
//     const issue = new Issue(issueData);
    
//     await issue.save();
//     console.log('✅ Issue created successfully:', issue._id);
    
//     // Verify issue can be retrieved
//     const foundIssue = await Issue.findById(issue._id).populate('reportedBy');
//     console.log('✅ Issue retrieval works:', foundIssue.title);
//     console.log('✅ Issue address:', foundIssue.address);
//     console.log('✅ Issue populated user:', foundIssue.reportedBy.username);
    
//     return issue;
//   } catch (error) {
//     console.error('❌ Issue model test failed:', error.message);
//     throw error;
//   }
// }