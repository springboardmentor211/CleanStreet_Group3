import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Edit, Camera, Lock, Shield, User, BarChart3, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { authAPI, issuesAPI, debugAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    location: "",
    bio: "",
    role: "",
    joinDate: "",
    _id: "",
    profileImage: ""
  });
  const [userStats, setUserStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    openIssues: 0,
    inProgressIssues: 0
  });
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      // console.log("=== Profile Page Debug Info ===");
      // console.log("AuthLoading:", authLoading);
      // console.log("User from auth context:", user);
      
      // Get user ID from localStorage as fallback
      const storedUser = localStorage.getItem('currentUser');
      const authToken = localStorage.getItem('authToken');
      
      // console.log("Stored user (raw):", storedUser);
      // console.log("Auth token exists:", !!authToken);
      // console.log("Auth token (first 50 chars):", authToken ? authToken.substring(0, 50) + '...' : 'No token');
      
      // Let's also decode the JWT token to see what's inside
      if (authToken) {
        try {
          const tokenParts = authToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            // console.log("Decoded JWT payload:", payload);
            // console.log("User ID from JWT:", payload.user?.id);
            // console.log("JWT expiry:", new Date(payload.exp * 1000));
            // console.log("Is token expired:", Date.now() >= payload.exp * 1000);
          }
        } catch (error) {
          console.error("Error decoding JWT:", error);
        }
      }
      
      let userId = null;
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser.id || parsedUser._id;
          // console.log("Parsed stored user:", parsedUser);
          // console.log("Extracted user ID:", userId);
        } catch (error) {
          console.error("Error parsing stored user:", error);
        }
      }

      // Use auth context user or stored user ID
      const currentUserId = user?.id || userId;
      // console.log("Final current user ID:", currentUserId);
      
      // Debug: Check what users exist in the database
      try {
        const debugUsers = await debugAPI.getUsers();
        // console.log("=== Debug: Users in database ===", debugUsers);
        
        // Check if the specific user ID exists
        if (currentUserId) {
          const specificUser = await debugAPI.getUserById(currentUserId);
          // console.log("=== Debug: Specific user lookup ===", specificUser);
        }
      } catch (error) {
        console.error("Debug API failed:", error);
      }
      
      if (!authLoading && currentUserId) {
        try {
          setLoading(true);
          // console.log("Making API call to getCurrentUser...");
          
          const userData = await authAPI.getCurrentUser();
          
          // console.log("=== API Response from getCurrentUser ===");
          // console.log("Raw userData:", userData);
          // console.log("userData type:", typeof userData);
          // console.log("userData keys:", Object.keys(userData || {}));
          // console.log("userData._id:", userData?._id);
          // console.log("userData.id:", userData?.id);
          // console.log("userData.fullName:", userData?.fullName);
          // console.log("userData.username:", userData?.username);
          // console.log("userData.email:", userData?.email);
          // console.log("userData.phoneNumber:", userData?.phoneNumber);
          // console.log("userData.location:", userData?.location);
          // console.log("userData.bio:", userData?.bio);
          // console.log("userData.role:", userData?.role);
          // console.log("userData.joinDate:", userData?.joinDate);
          // console.log("userData.createdAt:", userData?.createdAt);
          // console.log("=== End API Response ===");
          
          const processedUserInfo = {
            fullName: userData.fullName || "",
            username: userData.username || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            location: userData.location || "",
            bio: userData.bio || "",
            role: userData.role || "citizen",
            joinDate: userData.joinDate || userData.createdAt || "",
            _id: userData._id || "",
            profileImage: userData.profileImage || ""
          };
          
          // console.log("=== Processed User Info ===");
          // console.log("processedUserInfo:", processedUserInfo);
          
          setUserInfo(processedUserInfo);

          // Fetch user statistics
          try {
            const userIssuesResponse = await issuesAPI.getUserIssues(userData._id);
            // console.log("User issues response:", userIssuesResponse);
            
            if (userIssuesResponse && userIssuesResponse.issues) {
              const issues = userIssuesResponse.issues;
              const stats = {
                totalIssues: userIssuesResponse.total || issues.length,
                resolvedIssues: issues.filter((issue: any) => issue.status === 'resolved').length,
                openIssues: issues.filter((issue: any) => issue.status === 'open').length,
                inProgressIssues: issues.filter((issue: any) => issue.status === 'in-progress').length
              };
              setUserStats(stats);
            }
          } catch (error) {
            console.error("Failed to fetch user statistics:", error);
          }

        } catch (error) {
          console.error("=== Error Fetching User Data ===");
          console.error("Error object:", error);
          console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
          console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
          
          if (error instanceof Error) {
            // Check if it's a network error or API error
            console.error("Is network error:", !navigator.onLine);
            console.error("Error name:", error.name);
            
            // Check if it's an authentication error - user doesn't exist in database
            if (error.message.includes('User not found') || 
                error.message.includes('Token is not valid') ||
                error.message.includes('authorization denied')) {
              // console.log("🚨 ROOT CAUSE IDENTIFIED: User doesn't exist in database!");
              // console.log("This happens when:");
              // console.log("1. User was deleted from database but token is still valid");
              // console.log("2. Token references non-existent user ID");  
              // console.log("3. Database connection issues");
              // console.log("💡 SOLUTION: Clear session and register/login again");
              
              // Clear invalid auth data
              localStorage.removeItem('authToken');
              localStorage.removeItem('currentUser');
              
              // Show user-friendly message and redirect
              toast({
                variant: "destructive",
                title: "Account Not Found",
                description: "Your user account was not found in the database. Please register or login again."
              });
              
              setTimeout(() => {
                navigate('/login');
              }, 3000);
              return;
            }
          }
          
          toast({
            variant: "destructive",
            title: "Failed to Load Profile",
            description: `Failed to load user data: ${error instanceof Error ? error.message : 'Unknown error'}. Try clearing your session and logging in again.`
          });
        } finally {
          setLoading(false);
        }
      } else if (!authLoading && !currentUserId) {
        // console.log("=== No User ID Available ===");
        // console.log("AuthLoading:", authLoading);
        // console.log("User from context:", user);
        // console.log("User ID from localStorage:", userId);
        // console.log("Final currentUserId:", currentUserId);
        setLoading(false);
      } else {
        // console.log("=== Still Loading Auth or No User ===");
        // console.log("AuthLoading:", authLoading);
        // console.log("CurrentUserId:", currentUserId);
      }
    };

    fetchUserData();
  }, [user, authLoading]);

  const handleSave = async () => {
    try {
      setUpdateLoading(true);
      
      // Validation
      if (!userInfo.fullName.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Full name is required"
        });
        return;
      }
      
      const updateData = {
        fullName: userInfo.fullName.trim(),
        phoneNumber: userInfo.phoneNumber?.trim() || '',
        location: userInfo.location?.trim() || '',
        bio: userInfo.bio?.trim() || ''
      };
      
      const updatedUser = await authAPI.updateProfile(updateData);
      // console.log("Profile updated:", updatedUser);
      
      // Update local state with the response
      setUserInfo(prev => ({
        ...prev,
        ...updatedUser,
        fullName: updatedUser.fullName || prev.fullName,
        phoneNumber: updatedUser.phoneNumber || prev.phoneNumber,
        location: updatedUser.location || prev.location,
        bio: updatedUser.bio || prev.bio
      }));
      
      // Update localStorage as well
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedStoredUser = { ...parsedUser, ...updatedUser };
        localStorage.setItem('currentUser', JSON.stringify(updatedStoredUser));
      }
      
      toast({
        title: "Profile Updated",
        description: "Profile updated successfully!"
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please select a valid image file."
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Image file size must be less than 5MB."
      });
      return;
    }

    try {
      setImageUploading(true);

      const response = await authAPI.uploadProfileImage(file);
      
      // Update local state with the new profile image
      setUserInfo(prev => ({
        ...prev,
        profileImage: response.profileImage
      }));

      // Update localStorage as well
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedStoredUser = { ...parsedUser, profileImage: response.profileImage };
        localStorage.setItem('currentUser', JSON.stringify(updatedStoredUser));
      }

      toast({
        title: "Profile Image Updated",
        description: "Profile image updated successfully!"
      });
    } catch (error) {
      console.error('Profile image upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload profile image. Please try again.'
      });
    } finally {
      setImageUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleChangePassword = async () => {
    if (!userInfo.email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Email is required to reset password."
      });
      return;
    }

    try {
      toast({
        title: "Sending Email",
        description: "Sending password reset email..."
      });
      
      const response = await authAPI.forgotPassword(userInfo.email);
      
      toast({
        title: "Email Sent",
        description: "Password reset link has been sent to your email. Please check your inbox and follow the instructions to reset your password."
      });
      
    } catch (error) {
      console.error('Change password error:', error);
      toast({
        variant: "destructive",
        title: "Failed to Send Email",
        description: error instanceof Error ? error.message : 'Failed to send password reset email. Please try again.'
      });
    }
  };

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return "Recently joined";
    
    try {
      const date = new Date(dateString);
      return `Member since ${date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric', 
        year: 'numeric'
      })}`;
    } catch (error) {
      return "Recently joined";
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-white text-3xl sm:text-[48px] font-bold mb-8">
            Profile
          </h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white text-xl">Loading...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user && !authLoading) {
    return (
      <Layout>
        <div className="max-w-[1440px] mx-auto">
          <h1 className="text-white text-3xl sm:text-[48px] font-bold mb-8">
            Profile
          </h1>
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="text-white text-xl">Please log in to view your profile.</div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-cs-blue-secondary text-white font-medium rounded-cs-input hover:bg-cs-blue-primary transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[1440px] mx-auto">
        {/* Page Title */}
        <h1 className="text-white text-3xl sm:text-[48px] font-bold mb-8">
          Profile
        </h1>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="xl:col-span-1">
            <div className="border border-white/30 rounded-cs-card bg-background p-6 min-h-[577px] relative">
              {/* Edit Button */}
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                }}
                className="absolute top-6 right-6 flex items-center space-x-2 border border-white/30 rounded-cs-input px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <Edit className="w-6 h-6 text-white" />
                <span className="text-white text-xl font-semibold">
                  {isEditing ? 'Cancel' : 'Edit'}
                </span>
              </button>

              {/* Profile Content */}
              <div className="flex flex-col items-center text-center pt-12">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-[150px] h-[150px] rounded-full bg-cs-blue-light flex items-center justify-center overflow-hidden">
                    {userInfo.profileImage ? (
                      <img 
                        src={userInfo.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-cs-blue-primary text-[32px] font-bold">
                        {userInfo.fullName 
                          ? userInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                          : userInfo.username 
                          ? userInfo.username.slice(0, 2).toUpperCase()
                          : '?'
                        }
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleCameraClick}
                    disabled={imageUploading}
                    className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {imageUploading ? (
                      <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-6 h-6 text-gray-600" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <h2 className={`text-[32px] font-semibold mb-2 ${
                  userInfo.fullName ? 'text-white' : 'text-white/40'
                }`}>
                  {userInfo.fullName || "Click Edit to add name"}
                </h2>
                <p className="text-white text-xl mb-4">
                  @{userInfo.username || "username"}
                </p>

                {/* Status Badge */}
                <div className="bg-cs-blue-light rounded-full px-6 py-3 mb-6">
                  <span className="text-cs-blue-primary text-xl capitalize">
                    {userInfo.role || "Citizen"}
                  </span>
                </div>

                {/* Bio */}
                <p className={`text-lg text-center max-w-[286px] mb-6 ${
                  userInfo.bio ? 'text-white' : 'text-white/40'
                }`}>
                  {userInfo.bio || "No bio provided yet. Click Edit to add your bio!"}
                </p>

                {/* Member Since */}
                <p className="text-white text-xl">
                  {formatJoinDate(userInfo.joinDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="xl:col-span-2">
            <div className="border border-white/30 rounded-cs-card bg-background p-6 min-h-[574px]">
              {/* Section Header */}
              <div className="flex items-center mb-8">
                <div className="w-[70px] h-[70px] rounded-full bg-cs-blue-light flex items-center justify-center mr-6">
                  <User className="w-10 h-10 text-cs-blue-primary" />
                </div>
                <div>
                  <h3 className="text-white text-[40px] font-bold">Account Information</h3>
                  <p className="text-white text-xl font-light">Update your personal details</p>
                </div>
              </div>



              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-xl mb-2">Username</label>
                    <input
                      type="text"
                      value={userInfo.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={true}
                      placeholder={!userInfo.username ? "Username not available" : ""}
                      className="w-full h-12 px-4 rounded-cs-input border border-white/30 bg-background text-white text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary placeholder:text-white/40"
                      title="Username cannot be changed"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xl mb-2">
                      Full Name <span className="text-red-400">*</span>
                      {!userInfo.fullName && <span className="text-white/40 font-normal">(Click Edit to add)</span>}
                    </label>
                    <input
                      type="text"
                      value={userInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={!isEditing}
                      placeholder={!userInfo.fullName ? "Enter your full name" : ""}
                      className={`w-full h-12 px-4 rounded-cs-input border border-white/30 bg-background text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary placeholder:text-white/40 ${
                        !userInfo.fullName && !isEditing ? 'text-white/40' : 'text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xl mb-2">
                      Location {!userInfo.location && <span className="text-white/40 font-normal">(Click Edit to add)</span>}
                    </label>
                    <input
                      type="text"
                      value={userInfo.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      placeholder={!userInfo.location ? "Enter your location" : ""}
                      className={`w-full h-12 px-4 rounded-cs-input border border-white/30 bg-background text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary placeholder:text-white/40 ${
                        !userInfo.location && !isEditing ? 'text-white/40' : 'text-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-white text-xl mb-2">Email</label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={true}
                      placeholder={!userInfo.email ? "Email not available" : ""}
                      className="w-full h-12 px-4 rounded-cs-input border border-white/30 bg-background text-white text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary placeholder:text-white/40"
                      title="Email cannot be changed"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xl mb-2">
                      Phone Number {!userInfo.phoneNumber && <span className="text-white/40 font-normal">(Click Edit to add)</span>}
                    </label>
                    <input
                      type="tel"
                      value={userInfo.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      disabled={!isEditing}
                      placeholder={!userInfo.phoneNumber ? "Enter your phone number" : ""}
                      className={`w-full h-12 px-4 rounded-cs-input border border-white/30 bg-background text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary placeholder:text-white/40 ${
                        !userInfo.phoneNumber && !isEditing ? 'text-white/40' : 'text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xl mb-2">
                      Bio {!userInfo.bio && <span className="text-white/40 font-normal">(Click Edit to add)</span>}
                    </label>
                    <textarea
                      value={userInfo.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      placeholder={!userInfo.bio ? "Tell us about yourself..." : ""}
                      className={`w-full px-4 py-3 rounded-cs-input border border-white/30 bg-background text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary resize-none placeholder:text-white/40 ${
                        !userInfo.bio && !isEditing ? 'text-white/40' : 'text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                    }}
                    className="px-8 py-3 border border-white/30 text-white font-medium rounded-cs-input hover:bg-white/5 transition-colors"
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateLoading}
                    className="px-8 py-3 bg-cs-blue-secondary text-white font-medium rounded-cs-input hover:bg-cs-blue-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="mt-8">
          <div className="border border-white/30 rounded-cs-card bg-background p-6">
            {/* Section Header */}
            <div className="flex items-center mb-8">
              <div className="w-[70px] h-[70px] rounded-full bg-cs-blue-light flex items-center justify-center mr-6">
                <BarChart3 className="w-10 h-10 text-cs-blue-primary" />
              </div>
              <div>
                <h3 className="text-white text-[36px] font-bold">My Statistics</h3>
                <p className="text-white text-xl font-light">Your contribution to the community</p>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="border border-white/30 rounded-cs-input bg-background p-6 text-center">
                <div className="text-cs-blue-primary text-4xl font-bold mb-2">
                  {userStats.totalIssues}
                </div>
                <div className="text-white text-lg font-light">
                  Total Issues Reported
                </div>
              </div>

              <div className="border border-white/30 rounded-cs-input bg-background p-6 text-center">
                <div className="text-green-500 text-4xl font-bold mb-2">
                  {userStats.resolvedIssues}
                </div>
                <div className="text-white text-lg font-light">
                  Issues Resolved
                </div>
              </div>

              <div className="border border-white/30 rounded-cs-input bg-background p-6 text-center">
                <div className="text-yellow-500 text-4xl font-bold mb-2">
                  {userStats.inProgressIssues}
                </div>
                <div className="text-white text-lg font-light">
                  In Progress
                </div>
              </div>

              <div className="border border-white/30 rounded-cs-input bg-background p-6 text-center">
                <div className="text-orange-500 text-4xl font-bold mb-2">
                  {userStats.openIssues}
                </div>
                <div className="text-white text-lg font-light">
                  Open Issues
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="mt-8">
          <div className="border border-white/30 rounded-cs-card bg-background p-6">
            {/* Section Header */}
            <div className="flex items-center mb-8">
              <div className="w-[70px] h-[70px] rounded-full bg-cs-red-light flex items-center justify-center mr-6">
                <Lock className="w-9 h-8 text-red-600" />
              </div>
              <h3 className="text-white text-[36px] font-bold">Security Settings</h3>
            </div>

            {/* Security Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={handleChangePassword}
                disabled={!userInfo.email || updateLoading}
                className="border border-white/30 rounded-cs-input bg-background p-6 text-left hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-4">
                  <Lock className="w-7 h-7 text-white" />
                  <span className="text-white text-[22px] font-light">Change Password</span>
                </div>
              </button>

              <button className="border border-white/30 rounded-cs-input bg-background p-6 text-left hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-4">
                  <Shield className="w-7 h-7 text-white" />
                  <span className="text-white text-[22px] font-light">Privacy Settings</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
