// Ensure the API base URL doesn't end with a slash
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  token?: string;
  data?: T;
  [key: string]: any;
}

interface ErrorResponse extends Error {
  status?: number;
  data?: any;
}

// Auth token management
const getAuthToken = () => localStorage.getItem('authToken');
const setAuthToken = (token: string) => localStorage.setItem('authToken', token);
const removeAuthToken = () => localStorage.removeItem('authToken');

// API request helper
const apiRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const fetchConfig: RequestInit = {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(config.headers || {})
      }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchConfig);
    console.log(`API Request [${endpoint}] Response:`, response);
    
    let data: ApiResponse<T> = {};
    try {
      data = await response.json() as ApiResponse<T>;
    } catch (e) {
      console.warn('Failed to parse JSON response', e);
    }
    
    if (!response.ok) {
      const errorMessage = data?.message || `HTTP ${response.status} ${response.statusText}`;
      const error = new Error(errorMessage) as ErrorResponse;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ token?: string; user?: any }> => {
    try {
      const response = await apiRequest<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.token) {
        setAuthToken(response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
  }): Promise<{ token?: string; user?: any }> => {
    try {
      const response = await apiRequest<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.token) {
        setAuthToken(response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: (): void => {
    removeAuthToken();
  },

  getCurrentUser: async (): Promise<any> => {
    const response = await apiRequest<any>('/auth/me');
    // Backend returns user directly, not wrapped in data object
    return response;
  },

  updateProfile: async (profileData: {
    fullName?: string;
    phoneNumber?: string;
    location?: string;
    bio?: string;
  }): Promise<any> => {
    const response = await apiRequest<{ user: any }>('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.data?.user || response;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to send password reset email');
    }
    return { message: response.message || 'Password reset email sent successfully' };
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to reset password');
    }
    return { message: response.message || 'Password reset successful' };
  },
};

// Issues API
export const issuesAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    return apiRequest(`/issues?${query.toString()}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/issues/${id}`);
  },

  create: async (issueData: {
    title: string;
    description: string;
    category: string;
    location: {
      address: string;
      latitude?: number;
      longitude?: number;
    };
    images?: string[];
    priority?: string;
  }) => {
    return apiRequest('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  },

  update: async (id: string, updateData: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
  }) => {
    return apiRequest(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/issues/${id}`, {
      method: 'DELETE',
    });
  },

  vote: async (id: string, type: 'up' | 'down') => {
    return apiRequest(`/issues/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },

  addComment: async (id: string, text: string) => {
    return apiRequest(`/issues/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  getUserIssues: async (userId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const query = new URLSearchParams({ userId });
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);

    return apiRequest(`/issues/user?${query.toString()}`);
  },

  getDashboardStats: async () => {
    return apiRequest('/issues/stats/dashboard');
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  getAllIssues: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

    return apiRequest(`/admin/issues?${query.toString()}`);
  },

  updateIssueStatus: async (issueId: string, status: string, estimatedResolution?: string) => {
    return apiRequest(`/admin/issues/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, estimatedResolution }),
    });
  },

  assignIssue: async (issueId: string, assignedTo: string) => {
    return apiRequest(`/admin/issues/${issueId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assignedTo }),
    });
  },

  getAllUsers: async () => {
    return apiRequest('/admin/users');
  },

  getTrends: async () => {
    return apiRequest('/admin/trends');
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return apiRequest('/health');
  },
};

export { getAuthToken, setAuthToken, removeAuthToken };
