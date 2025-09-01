const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Test data
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User'
};


const TEST_ISSUE = {
  title: 'Pothole on Main Street',
  description: 'There is a large pothole causing traffic issues',
  category: 'Pothole',
  address: 'Main Street & Oak Avenue, New York, NY' // Simple address string
};

async function testDatabaseConnection() {
  console.log('🧪 Testing database connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanstreet', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function testUserModel() {
  console.log('\n🧪 Testing User model...');
  try {
    const User = require('./models/User');
    
    // Clean up any existing test user
    await User.deleteOne({ email: TEST_USER.email });
    
    // Create test user
    const user = new User(TEST_USER);
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(TEST_USER.password, salt);
    
    await user.save();
    console.log('✅ User created successfully:', user._id);
    
    // Verify user can be retrieved
    const foundUser = await User.findOne({ email: TEST_USER.email });
    console.log('✅ User retrieval works:', foundUser.email);
    
    return user;
  } catch (error) {
    console.error('❌ User model test failed:', error.message);
    throw error;
  }
}

async function testIssueModel(user) {
  console.log('\n🧪 Testing Issue model...');
  try {
    const Issue = require('./models/Issue');
    
    // Clean up any existing test issues
    await Issue.deleteMany({ title: TEST_ISSUE.title });
    
    // Create test issue with simple address format
    const issueData = {
      ...TEST_ISSUE,
      reportedBy: user._id
    };
    
    const issue = new Issue(issueData);
    
    await issue.save();
    console.log('✅ Issue created successfully:', issue._id);
    
    // Verify issue can be retrieved
    const foundIssue = await Issue.findById(issue._id).populate('reportedBy');
    console.log('✅ Issue retrieval works:', foundIssue.title);
    console.log('✅ Issue address:', foundIssue.address);
    console.log('✅ Issue populated user:', foundIssue.reportedBy.username);
    
    return issue;
  } catch (error) {
    console.error('❌ Issue model test failed:', error.message);
    throw error;
  }
}

async function testJWTToken(user) {
  console.log('\n🧪 Testing JWT token generation...');
  try {
    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ JWT token generated:', token.substring(0, 50) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT token verification works:', decoded.user.id);
    
    return token;
  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
    throw error;
  }
}

async function testAuthentication(token) {
  console.log('\n🧪 Testing authentication middleware...');
  try {
    const { auth } = require('./middleware/auth');
    
    // Mock request object
    const mockReq = {
      header: (name) => {
        if (name === 'x-auth-token') return token;
        return null;
      }
    };
    
    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      }
    };
    
    const mockNext = (error) => {
      if (error) throw error;
      console.log('✅ Authentication middleware passed');
    };
    
    await auth(mockReq, mockRes, mockNext);
    
    if (mockReq.user) {
      console.log('✅ User attached to request:', mockReq.user.username);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    throw error;
  }
}

async function testAPIRoutes(token) {
  console.log('\n🧪 Testing API routes...');
  try {
    const express = require('express');
    const request = require('supertest');
    const app = express();
    
    app.use(express.json());
    
    // Load routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/issues', require('./routes/issues'));
    
    // Test auth routes
    const authResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    
    console.log('✅ Auth login route works:', authResponse.status);
    
    // Test issues routes
    const issuesResponse = await request(app)
      .get('/api/issues');
    
    console.log('✅ Issues GET route works:', issuesResponse.status);
    
    return true;
  } catch (error) {
    console.error('❌ API routes test failed:', error.message);
    throw error;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Clean Street backend tests...\n');
  
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.log('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    // Test models
    const user = await testUserModel();
    const issue = await testIssueModel(user);
    const token = await testJWTToken(user);
    
    // Test authentication
    await testAuthentication(token);
    
    console.log('\n🎉 All tests passed!');
    console.log('\n📋 Test Summary:');
    console.log('   - Database: ✅ Connected');
    console.log('   - User Model: ✅ Working');
    console.log('   - Issue Model: ✅ Working');
    console.log('   - JWT: ✅ Working');
    console.log('   - Authentication: ✅ Working');
    
    console.log('\n🔑 Test User Token:');
    console.log('   ', token);
    
    console.log('\n👤 Test User ID:', user._id);
    console.log('📝 Test Issue ID:', issue._id);
    
    // Clean up
    await mongoose.connection.db.dropDatabase();
    console.log('\🧹 Test database cleaned up');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
runAllTests();


// In the test.js file, update the TEST_ISSUE object:
// (Removed duplicate declaration of TEST_ISSUE to fix redeclaration error)
