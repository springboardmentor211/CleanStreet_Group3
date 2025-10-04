import React, { createContext, useContext, useState, useEffect } from 'react';

// Language type definition
export type Language = 'en' | 'hi';

// Translation keys interface
interface Translations {
  // Navigation & Common
  dashboard: string;
  login: string;
  register: string;
  logout: string;
  profile: string;
  settings: string;
  admin: string;
  welcome: string;
  
  // Main Navigation
  viewComplaints: string;
  bookmarks: string;
  issueMap: string;
  myBookmarks: string;
  communityReports: string;
  
  // Welcome Page
  cleanStreet: string;
  buildingBetterCommunities: string;
  reportCommunityIssues: string;
  reportIssuesDescription: string;
  trackProgress: string;
  trackProgressDescription: string;
  engageWithCommunity: string;
  engageWithCommunityDescription: string;
  gettingStartedDescription: string;
  startReportingIssues: string;
  goToDashboard: string;
  viewCommunityReports: string;
  copyrightText: string;
  makeOurCity: string;
  cleanAndSafe: string;
  joinThousandsDescription: string;
  communityDriven: string;
  communityDrivenDesc: string;
  easyReporting: string;
  easyReportingDesc: string;
  trackProgressCard: string;
  trackProgressCardDesc: string;
  
  // Dashboard
  welcomeBackUser: string;
  quickActions: string;
  reportIssue: string;
  viewIssues: string;
  recentActivity: string;
  totalIssues: string;
  open: string;
  inProgress: string;
  resolved: string;
  loadingRecentIssues: string;
  reportNewIssue: string;
  myRecentIssues: string;
  noRecentIssuesFound: string;
  startByReportingIssue: string;
  viewAllComplaints: string;
  categoryLabel: string;
  statusLabel: string;
  
  // Issue Status
  openStatus: string;
  inProgressStatus: string;
  resolvedStatus: string;
  
  // Bookmarks Page
  issuesYouSaved: string;
  noBookmarksYet: string;
  noBookmarksDescription: string;
  browseIssues: string;
  bookmarkRemoved: string;
  issue: string;
  issues: string;
  issuesSaved: string;
  
  // Issue Details
  reportedBy: string;
  reportedByCommunity: string;
  anonymousUser: string;
  adminView: string;
  communityEngagement: string;
  support: string;
  dispute: string;
  comments: string;
  addComment: string;
  postComment: string;
  loadingComments: string;
  noCommentsYet: string;
  beFirstToComment: string;
  
  // Actions & Buttons
  save: string;
  saved: string;
  download: string;
  share: string;
  vote: string;
  bookmark: string;
  removeBookmark: string;
  bookmarkIssue: string;
  refresh: string;
  loading: string;
  
  // Forms & Authentication
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  confirmPassword: string;
  signUp: string;
  signIn: string;
  forgotPassword: string;
  resetPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  createAccount: string;
  creatingAccount: string;
  
  // Issue Reporting
  issueTitle: string;
  category: string;
  priority: string;
  description: string;
  address: string;
  location: string;
  attachImages: string;
  submitReport: string;
  
  // Categories
  pothole: string;
  garbage: string;
  streetlight: string;
  water: string;
  other: string;
  
  // Priority Levels
  low: string;
  medium: string;
  high: string;
  critical: string;
  
  // Admin
  totalUsers: string;
  recentRegistrations: string;
  userManagement: string;
  issueManagement: string;
  blockUser: string;
  unblockUser: string;
  viewProfile: string;
  
  // Messages & Notifications
  failedToCopyLink: string;
  failedToBookmark: string;
  failedToGeneratePDF: string;
  pleaseLoginToBookmark: string;
  pleaseLoginToVote: string;
  generatingPDF: string;
  downloadIssueReport: string;
  
  // Profile & Security
  securitySettings: string;
  changePassword: string;
  updateProfile: string;
  personalInformation: string;
  
  // Pagination & Navigation
  previous: string;
  next: string;
  page: string;
  of: string;
  
  // Error Messages
  somethingWentWrong: string;
  pageNotFound: string;
  registrationFailed: string;
  passwordsDoNotMatch: string;
  invalidResetLink: string;
  errorResettingPassword: string;
  loginFailed: string;
  authFailed: string;
  
  // Placeholders
  enterUsername: string;
  enterFullName: string;
  enterEmail: string;
  enterPhoneNumber: string;
  enterPassword: string;
  confirmNewPasswordPlaceholder: string;
  searchPlaceholder: string;
  enterReasonForBlocking: string;
  
  // Report Page - Missing translations
  reportACivicIssue: string;
  helpKeepCommunityClean: string;
  issueDetails: string;
  briefDescriptionPlaceholder: string;
  selectCategory: string;
  selectPriority: string;
  nearbyLandmark: string;
  optional: string;
  nearbyLandmarkPlaceholder: string;
  enterStreetAddress: string;
  addressSearchInstructions: string;
  describeIssueDetail: string;
  locationOnMap: string;
  selectedLocation: string;
  photosOptional: string;
  clickToUpload: string;
  uploadPhotosDesc: string;
  fileTypes: string;
  clearForm: string;
  
  // Priority levels with descriptions
  lowPriority: string;
  mediumPriority: string;
  highPriority: string;
  criticalPriority: string;
  
  // Auth Page - Missing translations  
  welcomeBack: string;
  joinOurCommunity: string;
  pleaseSignIn: string;
  createYourAccount: string;
  fillAllFields: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  
  // Auth Page Features
  reportIssues: string;
  reportIssuesDesc: string;
  communityDrivenTitle: string;
  trackProgressTitle: string;
  trackProgressDesc: string;
  motivationalQuote: string;
  rememberMe: string;
  backToHome: string;
  
  // How We Work Section
  howWeWork: string;
  howWeWorkDescription: string;
  step1: string;
  step2: string;
  step3: string;
  reportIssuesStep: string;
  reportIssuesStepDesc: string;
  weTakeAction: string;
  weTakeActionDesc: string;
  trackProgressStep: string;
  trackProgressStepDesc: string;
  
  // Dynamic content mapping for backend data
  dynamicCategories: {
    pothole: string;
    garbage: string;
    streetlight: string;
    water: string;
    other: string;
  };
  
  dynamicStatuses: {
    open: string;
    'in-progress': string;
    resolved: string;
  };
  
  dynamicPriorities: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
}

// Translation data
const translations: Record<Language, Translations> = {
  en: {
    // Navigation & Common
    dashboard: 'Dashboard',
    login: 'Login',
    register: 'Register', 
    logout: 'Logout',
    profile: 'Profile',
    settings: 'Settings',
    admin: 'Admin',
    welcome: 'Welcome',
    
    // Main Navigation
    viewComplaints: 'View Complaints',
    bookmarks: 'Bookmarks',
    issueMap: 'Issue Map',
    myBookmarks: 'My Bookmarks',
    communityReports: 'Community Reports',
    
    // Welcome Page
    cleanStreet: 'Clean Street',
    buildingBetterCommunities: 'Building better communities together',
    reportCommunityIssues: 'Report Community Issues',
    reportIssuesDescription: 'Easily report potholes, garbage, streetlights, and other civic issues in your neighborhood',
    trackProgress: 'Track Progress',
    trackProgressDescription: 'Monitor the status of reported issues and see how your community is improving',
    engageWithCommunity: 'Engage with Community',
    engageWithCommunityDescription: 'Vote, comment, and collaborate with neighbors to solve local problems together',
    gettingStartedDescription: 'Join thousands of citizens making their communities cleaner and safer.',
    startReportingIssues: 'Start Reporting Issues',
    goToDashboard: 'Go to Dashboard',
    viewCommunityReports: 'View Community Reports',
    copyrightText: '© 2025 Clean Street. Building better communities together.',
    makeOurCity: 'Make Our City',
    cleanAndSafe: 'Clean & Safe',
    joinThousandsDescription: 'Join thousands of citizens reporting issues and working together to improve our community. From potholes to streetlights, your voice matters.',
    communityDriven: 'Community Driven',
    communityDrivenDesc: 'Join thousands of active citizens making a difference',
    easyReporting: 'Easy Reporting',
    easyReportingDesc: 'Report issues quickly with location and photo upload',
    trackProgressCard: 'Track Progress',
    trackProgressCardDesc: 'See real-time updates on reported issues',
    
    // Dashboard
    welcomeBackUser: 'Welcome back',
    quickActions: 'Quick Actions',
    reportIssue: 'Report Issue',
    viewIssues: 'View Issues',
    recentActivity: 'Recent Activity',
    totalIssues: 'Total Issues',
    open: 'Open',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    loadingRecentIssues: 'Loading your recent issues...',
    reportNewIssue: 'Report New Issue',
    myRecentIssues: 'My Recent Issues',
    noRecentIssuesFound: 'No recent issues found',
    startByReportingIssue: 'Start by reporting an issue',
    viewAllComplaints: 'View All Complaints',
    categoryLabel: 'Category',
    statusLabel: 'Status',
    
    // Issue Status
    openStatus: 'Open',
    inProgressStatus: 'In Progress',
    resolvedStatus: 'Resolved',
    
    // Bookmarks Page
    issuesYouSaved: 'Issues you\'ve saved for later',
    noBookmarksYet: 'No Bookmarks Yet',
    noBookmarksDescription: 'Start bookmarking issues you care about to keep track of them here.',
    browseIssues: 'Browse Issues',
    bookmarkRemoved: 'Bookmark removed',
    issue: 'Issue',
    issues: 'Issues',
    issuesSaved: 'Issues Saved',
    
    // Issue Details
    reportedBy: 'Reported by',
    reportedByCommunity: 'Reported by Community',
    anonymousUser: 'Anonymous User',
    adminView: 'Admin View',
    communityEngagement: 'Community Engagement',
    support: 'Support',
    dispute: 'Dispute',
    comments: 'Comments',
    addComment: 'Add a comment...',
    postComment: 'Post Comment',
    loadingComments: 'Loading comments...',
    noCommentsYet: 'No comments yet',
    beFirstToComment: 'Be the first to comment on this issue',
    
    // Actions & Buttons
    save: 'Save',
    saved: 'Saved',
    download: 'Download',
    share: 'Share',
    vote: 'Vote',
    bookmark: 'Bookmark',
    removeBookmark: 'Remove bookmark',
    bookmarkIssue: 'Bookmark issue',
    refresh: 'Refresh',
    loading: 'Loading',
    
    // Forms & Authentication
    username: 'Username',
    password: 'Password',
    email: 'Email',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    confirmPassword: 'Confirm Password',
    signUp: 'Sign Up',
    signIn: 'Sign In',
    forgotPassword: 'Forgot Password',
    resetPassword: 'Reset Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    createAccount: 'Create Account',
    creatingAccount: 'Creating Account...',
    
    // Issue Reporting
    issueTitle: 'Issue Title',
    category: 'Category',
    priority: 'Priority',
    description: 'Description',
    address: 'Address',
    location: 'Location',
    attachImages: 'Attach Images',
    submitReport: 'Submit Report',
    
    // Categories
    pothole: 'Pothole',
    garbage: 'Garbage',
    streetlight: 'Streetlight',
    water: 'Water',
    other: 'Other',
    
    // Priority Levels
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    
    // Admin
    totalUsers: 'Total Users',
    recentRegistrations: 'Recent Registrations',
    userManagement: 'User Management',
    issueManagement: 'Issue Management',
    blockUser: 'Block User',
    unblockUser: 'Unblock User',
    viewProfile: 'View Profile',
    
    // Messages & Notifications
    failedToCopyLink: 'Failed to copy link',
    failedToBookmark: 'Failed to bookmark issue',
    failedToGeneratePDF: 'Failed to generate PDF',
    pleaseLoginToBookmark: 'Please log in to bookmark',
    pleaseLoginToVote: 'Please log in to vote',
    generatingPDF: 'Generating PDF...',
    downloadIssueReport: 'Download issue report as PDF',
    
    // Profile & Security
    securitySettings: 'Security Settings',
    changePassword: 'Change Password',
    updateProfile: 'Update Profile',
    personalInformation: 'Personal Information',
    
    // Pagination & Navigation
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    
    // Error Messages
    somethingWentWrong: 'Something went wrong',
    pageNotFound: 'Page not found',
    registrationFailed: 'Registration failed',
    passwordsDoNotMatch: 'Passwords do not match',
    invalidResetLink: 'Invalid reset link',
    errorResettingPassword: 'Error resetting password',
    loginFailed: 'Login failed',
    authFailed: 'Authentication failed',
    
    // Placeholders
    enterUsername: 'Username',
    enterFullName: 'Enter your full name',
    enterEmail: 'Email',
    enterPhoneNumber: 'Phone Number',
    enterPassword: 'Password',
    confirmNewPasswordPlaceholder: 'Confirm new password',
    searchPlaceholder: 'Search...',
    enterReasonForBlocking: 'Enter reason for blocking...',
    
    // Report Page - Missing translations
    reportACivicIssue: 'Report a Civic Issue',
    helpKeepCommunityClean: 'Help us keep our community clean and safe by reporting issues that need attention.',
    issueDetails: 'Issue Details',
    briefDescriptionPlaceholder: 'Brief description of the issue',
    selectCategory: 'Select category',
    selectPriority: 'Select priority',
    nearbyLandmark: 'Nearby Landmark',
    optional: 'Optional',
    nearbyLandmarkPlaceholder: 'e.g. Near City Hall',
    enterStreetAddress: 'Enter street address or search location',
    addressSearchInstructions: 'Type an address to search and zoom the map, or click on the map to select a location',
    describeIssueDetail: 'Describe the issue in detail...',
    locationOnMap: 'Location on Map',
    selectedLocation: 'Selected Location:',
    photosOptional: 'Photos (Optional)',
    clickToUpload: 'Click to upload',
    uploadPhotosDesc: 'photos of the issue',
    fileTypes: 'PNG, JPG, GIF up to 10MB',
    clearForm: 'Clear Form',
    
    // Priority levels with descriptions  
    lowPriority: 'Low Priority',
    mediumPriority: 'Medium Priority',
    highPriority: 'High Priority',
    criticalPriority: 'Critical',
    
    // Auth Page - Missing translations
    welcomeBack: 'Welcome Back!',
    joinOurCommunity: 'Join Our Community',
    pleaseSignIn: 'We\'re glad to see you again. Ready to continue making our city cleaner and safer together?',
    createYourAccount: 'Become a responsible citizen and help us build a cleaner, safer community for everyone.',
    fillAllFields: 'Please fill in all required fields',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    
    // Auth Page Features
    reportIssues: 'Report Issues',
    reportIssuesDesc: 'Easily report civic issues in your neighborhood',
    communityDrivenTitle: 'Community Driven',
    trackProgressTitle: 'Track Progress',
    trackProgressDesc: 'See how your reports make a real impact',
    motivationalQuote: 'Every small action counts. Together, we can create the change we want to see in our community.',
    rememberMe: 'Remember me',
    backToHome: 'Back to Home',
    
    // How We Work Section
    howWeWork: 'How We Work',
    howWeWorkDescription: 'Our simple three-step process makes it easy for citizens to report issues and track their resolution',
    step1: 'STEP 1',
    step2: 'STEP 2', 
    step3: 'STEP 3',
    reportIssuesStep: 'Report Issues',
    reportIssuesStepDesc: 'Report neighborhood issues instantly with photos, location, and details.',
    weTakeAction: 'We Take Action',
    weTakeActionDesc: 'We review, assign, and ensure quick action on your report.',
    trackProgressStep: 'Track Progress',
    trackProgressStepDesc: 'Track your report\'s status and see your community impact.',
    
    // Dynamic content mapping for backend data
    dynamicCategories: {
      pothole: 'Pothole',
      garbage: 'Garbage', 
      streetlight: 'Streetlight',
      water: 'Water',
      other: 'Other'
    },
    
    dynamicStatuses: {
      open: 'Open',
      'in-progress': 'In Progress',
      resolved: 'Resolved'
    },
    
    dynamicPriorities: {
      low: 'Low',
      medium: 'Medium', 
      high: 'High',
      critical: 'Critical'
    },
  },
  
  hi: {
    // Navigation & Common
    dashboard: 'डैशबोर्ड',
    login: 'लॉग इन',
    register: 'रजिस्टर',
    logout: 'लॉग आउट',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    admin: 'एडमिन',
    welcome: 'स्वागत है',
    
    // Main Navigation
    viewComplaints: 'शिकायतें देखें',
    bookmarks: 'बुकमार्क्स',
    issueMap: 'समस्या मानचित्र',
    myBookmarks: 'मेरे बुकमार्क्स',
    communityReports: 'सामुदायिक रिपोर्ट',
    
    // Welcome Page
    cleanStreet: 'क्लीन स्ट्रीट',
    buildingBetterCommunities: 'मिलकर बेहतर समुदाय बनाना',
    reportCommunityIssues: 'सामुदायिक समस्याएं रिपोर्ट करें',
    reportIssuesDescription: 'अपने मोहल्ले में गड्ढे, कचरा, स्ट्रीट लाइट और अन्य नागरिक समस्याओं को आसानी से रिपोर्ट करें',
    trackProgress: 'प्रगति ट्रैक करें',
    trackProgressDescription: 'रिपोर्ट की गई समस्याओं की स्थिति की निगरानी करें और देखें कि आपका समुदाय कैसे सुधर रहा है',
    engageWithCommunity: 'समुदाय के साथ जुड़ें',
    engageWithCommunityDescription: 'स्थानीय समस्याओं को मिलकर हल करने के लिए पड़ोसियों के साथ वोट करें, टिप्पणी करें और सहयोग करें',
    gettingStartedDescription: 'अपने समुदाय को स्वच्छ और सुरक्षित बनाने वाले हजारों नागरिकों से जुड़ें।',
    startReportingIssues: 'समस्याएं रिपोर्ट करना शुरू करें',
    goToDashboard: 'डैशबोर्ड पर जाएं',
    viewCommunityReports: 'सामुदायिक रिपोर्ट देखें',
    copyrightText: '© 2025 क्लीन स्ट्रीट। मिलकर बेहतर समुदाय बनाना।',
    makeOurCity: 'हमारे शहर को बनाएं',
    cleanAndSafe: 'स्वच्छ और सुरक्षित',
    joinThousandsDescription: 'समस्याओं की रिपोर्ट करने और अपने समुदाय को बेहतर बनाने के लिए मिलकर काम करने वाले हजारों नागरिकों से जुड़ें। गड्ढों से लेकर स्ट्रीट लाइट तक, आपकी आवाज़ मायने रखती है।',
    communityDriven: 'समुदाय संचालित',
    communityDrivenDesc: 'बदलाव लाने वाले हजारों सक्रिय नागरिकों से जुड़ें',
    easyReporting: 'आसान रिपोर्टिंग',
    easyReportingDesc: 'स्थान और फोटो अपलोड के साथ जल्दी समस्याएं रिपोर्ट करें',
    trackProgressCard: 'प्रगति ट्रैक करें',
    trackProgressCardDesc: 'रिपोर्ट की गई समस्याओं पर रियल-टाइम अपडेट देखें',
    
    // Dashboard
    welcomeBackUser: 'वापस स्वागत है',
    quickActions: 'त्वरित कार्य',
    reportIssue: 'समस्या रिपोर्ट करें',
    viewIssues: 'समस्याएं देखें',
    recentActivity: 'हाल की गतिविधि',
    totalIssues: 'कुल समस्याएं',
    open: 'खुली',
    inProgress: 'प्रगति में',
    resolved: 'हल हो गई',
    loadingRecentIssues: 'आपकी हाल की समस्याएं लोड हो रही हैं...',
    reportNewIssue: 'नई समस्या रिपोर्ट करें',
    myRecentIssues: 'मेरी हाल की समस्याएं',
    noRecentIssuesFound: 'कोई हाल की समस्याएं नहीं मिलीं',
    startByReportingIssue: 'एक समस्या रिपोर्ट करके शुरुआत करें',
    viewAllComplaints: 'सभी शिकायतें देखें',
    categoryLabel: 'श्रेणी',
    statusLabel: 'स्थिति',
    
    // Issue Status
    openStatus: 'खुली',
    inProgressStatus: 'प्रगति में',
    resolvedStatus: 'हल हो गई',
    
    // Bookmarks Page
    issuesYouSaved: 'आपके द्वारा बाद के लिए सेव की गई समस्याएं',
    noBookmarksYet: 'अभी तक कोई बुकमार्क नहीं',
    noBookmarksDescription: 'जिन समस्याओं की आप परवाह करते हैं उन्हें बुकमार्क करना शुरू करें ताकि उन्हें यहां ट्रैक कर सकें।',
    browseIssues: 'समस्याएं ब्राउज़ करें',
    bookmarkRemoved: 'बुकमार्क हटा दिया गया',
    issue: 'समस्या',
    issues: 'समस्याएं',
    issuesSaved: 'समस्याएं सेव की गईं',
    
    // Issue Details
    reportedBy: 'द्वारा रिपोर्ट किया गया',
    reportedByCommunity: 'समुदाय द्वारा रिपोर्ट किया गया',
    anonymousUser: 'अज्ञात उपयोगकर्ता',
    adminView: 'एडमिन दृश्य',
    communityEngagement: 'सामुदायिक भागीदारी',
    support: 'समर्थन',
    dispute: 'विवाद',
    comments: 'टिप्पणियां',
    addComment: 'एक टिप्पणी जोड़ें...',
    postComment: 'टिप्पणी पोस्ट करें',
    loadingComments: 'टिप्पणियां लोड हो रही हैं...',
    noCommentsYet: 'अभी तक कोई टिप्पणी नहीं',
    beFirstToComment: 'इस समस्या पर टिप्पणी करने वाले पहले व्यक्ति बनें',
    
    // Actions & Buttons
    save: 'सेव करें',
    saved: 'सेव किया गया',
    download: 'डाउनलोड',
    share: 'शेयर करें',
    vote: 'वोट',
    bookmark: 'बुकमार्क',
    removeBookmark: 'बुकमार्क हटाएं',
    bookmarkIssue: 'समस्या को बुकमार्क करें',
    refresh: 'रीफ्रेश',
    loading: 'लोड हो रहा है',
    
    // Forms & Authentication
    username: 'यूज़रनेम',
    password: 'पासवर्ड',
    email: 'ईमेल',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नंबर',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    signUp: 'साइन अप',
    signIn: 'साइन इन',
    forgotPassword: 'पासवर्ड भूल गए',
    resetPassword: 'पासवर्ड रीसेट करें',
    newPassword: 'नया पासवर्ड',
    confirmNewPassword: 'नया पासवर्ड की पुष्टि करें',
    createAccount: 'खाता बनाएं',
    creatingAccount: 'खाता बनाया जा रहा है...',
    
    // Issue Reporting
    issueTitle: 'समस्या का शीर्षक',
    category: 'श्रेणी',
    priority: 'प्राथमिकता',
    description: 'विवरण',
    address: 'पता',
    location: 'स्थान',
    attachImages: 'छवियां संलग्न करें',
    submitReport: 'रिपोर्ट सबमिट करें',
    
    // Categories
    pothole: 'गड्ढा',
    garbage: 'कचरा',
    streetlight: 'स्ट्रीट लाइट',
    water: 'पानी',
    other: 'अन्य',
    
    // Priority Levels
    low: 'कम',
    medium: 'मध्यम',
    high: 'उच्च',
    critical: 'गंभीर',
    
    // Admin
    totalUsers: 'कुल उपयोगकर्ता',
    recentRegistrations: 'हाल के पंजीकरण',
    userManagement: 'उपयोगकर्ता प्रबंधन',
    issueManagement: 'समस्या प्रबंधन',
    blockUser: 'उपयोगकर्ता को ब्लॉक करें',
    unblockUser: 'उपयोगकर्ता को अनब्लॉक करें',
    viewProfile: 'प्रोफ़ाइल देखें',
    
    // Messages & Notifications
    failedToCopyLink: 'लिंक कॉपी करने में विफल',
    failedToBookmark: 'समस्या को बुकमार्क करने में विफल',
    failedToGeneratePDF: 'पीडीएफ जेनरेट करने में विफल',
    pleaseLoginToBookmark: 'बुकमार्क करने के लिए कृपया लॉग इन करें',
    pleaseLoginToVote: 'वोट करने के लिए कृपया लॉग इन करें',
    generatingPDF: 'पीडीएफ जेनरेट हो रहा है...',
    downloadIssueReport: 'समस्या रिपोर्ट को पीडीएफ के रूप में डाउनलोड करें',
    
    // Profile & Security
    securitySettings: 'सुरक्षा सेटिंग्स',
    changePassword: 'पासवर्ड बदलें',
    updateProfile: 'प्रोफ़ाइल अपडेट करें',
    personalInformation: 'व्यक्तिगत जानकारी',
    
    // Pagination & Navigation
    previous: 'पिछला',
    next: 'अगला',
    page: 'पृष्ठ',
    of: 'का',
    
    // Error Messages
    somethingWentWrong: 'कुछ गलत हुआ',
    pageNotFound: 'पेज नहीं मिला',
    registrationFailed: 'पंजीकरण विफल',
    passwordsDoNotMatch: 'पासवर्ड मैच नहीं करते',
    invalidResetLink: 'अमान्य रीसेट लिंक',
    errorResettingPassword: 'पासवर्ड रीसेट करने में त्रुटि',
    loginFailed: 'लॉगिन असफल',
    authFailed: 'प्रमाणीकरण असफल',
    
    // Placeholders
    enterUsername: 'यूज़रनेम',
    enterFullName: 'अपना पूरा नाम दर्ज करें',
    enterEmail: 'ईमेल',
    enterPhoneNumber: 'फोन नंबर',
    enterPassword: 'पासवर्ड',
    confirmNewPasswordPlaceholder: 'नया पासवर्ड की पुष्टि करें',
    searchPlaceholder: 'खोजें...',
    enterReasonForBlocking: 'ब्लॉक करने का कारण दर्ज करें...',
    
    // Report Page - Missing translations
    reportACivicIssue: 'नागरिक समस्या की रिपोर्ट करें',
    helpKeepCommunityClean: 'ध्यान देने की आवश्यकता वाली समस्याओं की रिपोर्ट करके हमारे समुदाय को स्वच्छ और सुरक्षित रखने में हमारी सहायता करें।',
    issueDetails: 'समस्या का विवरण',
    briefDescriptionPlaceholder: 'समस्या का संक्षिप्त विवरण',
    selectCategory: 'श्रेणी चुनें',
    selectPriority: 'प्राथमिकता चुनें',
    nearbyLandmark: 'पास का मील का पत्थर',
    optional: 'वैकल्पिक',
    nearbyLandmarkPlaceholder: 'जैसे सिटी हॉल के पास',
    enterStreetAddress: 'गली का पता दर्ज करें या स्थान खोजें',
    addressSearchInstructions: 'खोजने और मानचित्र को ज़ूम करने के लिए पता टाइप करें, या स्थान चुनने के लिए मानचित्र पर क्लिक करें',
    describeIssueDetail: 'समस्या का विस्तार से वर्णन करें...',
    locationOnMap: 'मानचित्र पर स्थान',
    selectedLocation: 'चयनित स्थान:',
    photosOptional: 'फोटो (वैकल्पिक)',
    clickToUpload: 'अपलोड करने के लिए क्लिक करें',
    uploadPhotosDesc: 'समस्या की तस्वीरें',
    fileTypes: 'PNG, JPG, GIF 10MB तक',
    clearForm: 'फॉर्म साफ़ करें',
    
    // Priority levels with descriptions
    lowPriority: 'कम प्राथमिकता',
    mediumPriority: 'मध्यम प्राथमिकता', 
    highPriority: 'उच्च प्राथमिकता',
    criticalPriority: 'गंभीर',
    
    // Auth Page - Missing translations
    welcomeBack: 'वापस स्वागत है!',
    joinOurCommunity: 'हमारे समुदाय में शामिल हों',
    pleaseSignIn: 'आपको दोबारा देखकर खुशी हुई। क्या आप हमारे शहर को स्वच्छ और सुरक्षित बनाने में मदद करने के लिए तैयार हैं?',
    createYourAccount: 'एक जिम्मेदार नागरिक बनें और सभी के लिए एक स्वच्छ, सुरक्षित समुदाय बनाने में हमारी मदद करें।',
    fillAllFields: 'कृपया सभी आवश्यक फ़ील्ड भरें',
    alreadyHaveAccount: 'पहले से ही खाता है?',
    dontHaveAccount: 'खाता नहीं है?',
    
    // Auth Page Features
    reportIssues: 'समस्याएं रिपोर्ट करें',
    reportIssuesDesc: 'अपने मोहल्ले में नागरिक समस्याओं को आसानी से रिपोर्ट करें',
    communityDrivenTitle: 'समुदाय संचालित',
    trackProgressTitle: 'प्रगति ट्रैक करें',
    trackProgressDesc: 'देखें कि आपकी रिपोर्ट कैसे वास्तविक प्रभाव डालती है',
    motivationalQuote: 'हर छोटी कार्रवाई मायने रखती है। मिलकर हम अपने समुदाय में वह बदलाव ला सकते हैं जो हम देखना चाहते हैं।',
    rememberMe: 'मुझे याद रखें',
    backToHome: 'होम पर वापस जाएं',
    
    // How We Work Section
    howWeWork: 'हम कैसे काम करते हैं',
    howWeWorkDescription: 'हमारी सरल तीन-चरणीय प्रक्रिया नागरिकों के लिए समस्याओं की रिपोर्ट करना और उनके समाधान को ट्रैक करना आसान बनाती है',
    step1: 'चरण 1',
    step2: 'चरण 2',
    step3: 'चरण 3', 
    reportIssuesStep: 'समस्याएं रिपोर्ट करें',
    reportIssuesStepDesc: 'फोटो, स्थान और विवरण के साथ मोहल्ले की समस्याओं की तुरंत रिपोर्ट करें।',
    weTakeAction: 'हम कार्रवाई करते हैं',
    weTakeActionDesc: 'हम आपकी रिपोर्ट की समीक्षा करते हैं, असाइन करते हैं और त्वरित कार्रवाई सुनिश्चित करते हैं।',
    trackProgressStep: 'प्रगति ट्रैक करें',
    trackProgressStepDesc: 'अपनी रिपोर्ट की स्थिति को ट्रैक करें और अपने समुदाय के प्रभाव को देखें।',
    
    // Dynamic content mapping for backend data
    dynamicCategories: {
      pothole: 'गड्ढा',
      garbage: 'कचरा',
      streetlight: 'स्ट्रीट लाइट',
      water: 'पानी',
      other: 'अन्य'
    },
    
    dynamicStatuses: {
      open: 'खुली',
      'in-progress': 'प्रगति में', 
      resolved: 'हल हो गई'
    },
    
    dynamicPriorities: {
      low: 'कम',
      medium: 'मध्यम',
      high: 'उच्च', 
      critical: 'गंभीर'
    },
  }
};

// Context interface
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
  tCategory: (category: string) => string;
  tStatus: (status: string) => string;
  tPriority: (priority: string) => string;
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Get saved language from localStorage or default to English
    const saved = localStorage.getItem('language') as Language;
    return saved && ['en', 'hi'].includes(saved) ? saved : 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: keyof Translations): string => {
    const translation = translations[language][key] || translations.en[key] || key;
    // Handle nested objects by returning empty string - use helper functions instead
    return typeof translation === 'string' ? translation : '';
  };

  // Helper functions for dynamic content
  const tCategory = (category: string): string => {
    const normalizedCategory = category.toLowerCase() as keyof typeof translations.en.dynamicCategories;
    return translations[language].dynamicCategories[normalizedCategory] || 
           translations.en.dynamicCategories[normalizedCategory] || 
           category;
  };

  const tStatus = (status: string): string => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-') as keyof typeof translations.en.dynamicStatuses;
    return translations[language].dynamicStatuses[normalizedStatus] || 
           translations.en.dynamicStatuses[normalizedStatus] || 
           status;
  };

  const tPriority = (priority: string): string => {
    const normalizedPriority = priority.toLowerCase() as keyof typeof translations.en.dynamicPriorities;
    return translations[language].dynamicPriorities[normalizedPriority] || 
           translations.en.dynamicPriorities[normalizedPriority] || 
           priority;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, tCategory, tStatus, tPriority }}>
      {children}
    </I18nContext.Provider>
  );
};

// Custom hook to use i18n
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Language toggle component
export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useI18n();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
      title={language === 'en' ? 'Switch to Hindi' : 'अंग्रेजी में बदलें'}
    >
      <span className="text-sm font-medium">
        {language === 'en' ? 'हिंदी' : 'English'}
      </span>
    </button>
  );
};