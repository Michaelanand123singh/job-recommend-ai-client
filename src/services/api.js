import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.data);
    return response;
  },
  (error) => {
    console.error('API response error:', error);
    return Promise.reject(error);
  }
);

export const apiService = {
  uploadResume: async (file) => {
    try {
      console.log('📁 Uploading file:', file.name);
      
      const formData = new FormData();
      // FIXED: Changed from 'file' to 'resume' to match server expectation
      formData.append('resume', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Upload successful:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Server is not running. Please start the backend server.');
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to process resume'
      );
    }
  },

  checkHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  },

  getJobRecommendations: async (data) => {
    try {
      const response = await api.post('/recommendations', data);
      return response.data;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      throw new Error(error.response?.data?.message || 'Failed to get recommendations');
    }
  }
};

export const apiUtils = {
  isValidFile: (file) => {
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a PDF or DOCX file');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }
    
    return true;
  },

  formatErrorMessage: (error) => {
    if (typeof error === 'string') return error;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.error) return error.response.data.error;
    if (error.message) return error.message;
    return 'An unexpected error occurred';
  }
};

export default apiService;