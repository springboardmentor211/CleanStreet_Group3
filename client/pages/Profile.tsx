import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Edit, Camera, Lock, Shield, User } from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    fullName: "Demo User",
    username: "demo_user",
    email: "amitofficialcs@gmail.com", 
    phoneNumber: "+91-9508019871",
    location: "Greater Noida",
    bio: "Active citizen helping to improve our community through CleanStreet reporting"
  });

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Implement save functionality
  };

  const handleInputChange = (field: string, value: string) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

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
                onClick={() => setIsEditing(!isEditing)}
                className="absolute top-6 right-6 flex items-center space-x-2 border border-white/30 rounded-cs-input px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <Edit className="w-6 h-6 text-white" />
                <span className="text-white text-xl font-semibold">Edit</span>
              </button>

              {/* Profile Content */}
              <div className="flex flex-col items-center text-center pt-12">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-[150px] h-[150px] rounded-full bg-cs-blue-light flex items-center justify-center">
                    <span className="text-cs-blue-primary text-[32px] font-bold">
                      {userInfo.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-gray-600" />
                  </div>
                </div>

                {/* User Info */}
                <h2 className="text-white text-[32px] font-semibold mb-2">
                  {userInfo.fullName}
                </h2>
                <p className="text-white text-xl mb-4">
                  @{userInfo.username}
                </p>

                {/* Status Badge */}
                <div className="bg-cs-blue-light rounded-full px-6 py-3 mb-6">
                  <span className="text-cs-blue-primary text-xl">Citizen</span>
                </div>

                {/* Bio */}
                <p className="text-white text-lg text-center max-w-[286px] mb-6">
                  {userInfo.bio}
                </p>

                {/* Member Since */}
                <p className="text-white text-xl">
                  Member since 7/03/2024
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
                      disabled={!isEditing}
                      className="w-full h-12 px-4 rounded-cs-input border border-white/30 bg-background text-white text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xl mb-2">Full Name</label>
                    <input
                      type="text"
                      value={userInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full h-12 px-4 rounded-cs-input border border-white/30 bg-background text-white text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xl mb-2">Location</label>
                    <input
                      type="text"
                      value={userInfo.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!isEditing}
                      className="w-full h-12 px-4 rounded-cs-input border border-white/30 bg-background text-white text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary"
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
                      disabled={!isEditing}
                      className="w-full h-12 px-4 rounded-cs-input border border-white/30 bg-background text-white text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xl mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={userInfo.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      disabled={!isEditing}
                      className="w-full h-12 px-4 rounded-cs-input border border-white/30 bg-background text-white text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xl mb-2">Bio</label>
                    <textarea
                      value={userInfo.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-3 rounded-cs-input border border-white/30 bg-background text-white text-sm disabled:opacity-60 focus:outline-none focus:border-cs-blue-primary resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-cs-blue-secondary text-white font-medium rounded-cs-input hover:bg-cs-blue-primary transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
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
              <button className="border border-white/30 rounded-cs-input bg-background p-6 text-left hover:bg-white/5 transition-colors">
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
