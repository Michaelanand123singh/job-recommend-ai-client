import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`📤 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    console.log('📤 Request config:', config);
    return config;
  },
  (error) => {
    console.error('❌ API request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('📥 API response received from:', response.config.url);
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', response.data);
    console.log('📥 Response data type:', typeof response.data);
    console.log('📥 Response data keys:', Object.keys(response.data || {}));
    return response;
  },
  (error) => {
    console.error('❌ API response error:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    return Promise.reject(error);
  }
);

export const apiService = {
  uploadResume: async (file) => {
    try {
      console.log('📁 Starting file upload...');
      console.log('📁 File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      const formData = new FormData();
      formData.append('resume', file);
      
      console.log('📤 Sending upload request...');
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Upload response received');
      console.log('✅ Full response:', response);
      console.log('✅ Response data:', response.data);
      
      // Log the structure
      if (response.data) {
        console.log('🔍 Response data structure:');
        console.log('  - success:', response.data.success);
        console.log('  - message:', response.data.message);
        console.log('  - results:', response.data.results);
        
        if (response.data.results) {
          console.log('  - results.matches:', response.data.results.matches);
          console.log('  - results.resume_summary:', response.data.results.resume_summary);
          console.log('  - matches count:', response.data.results.matches?.length || 0);
        }
      }
      
      // Multiple fallbacks for different response structures
      let finalData = null;
      
      if (response.data.success && response.data.results) {
        console.log('🎯 Using response.data.results');
        finalData = response.data.results;
      } else if (response.data.matches) {
        console.log('🎯 Using response.data (direct matches)');
        finalData = response.data;
      } else if (response.data.success) {
        console.log('🎯 Using response.data (success but no results)');
        finalData = response.data;
      } else {
        console.log('🎯 Using full response.data');
        finalData = response.data;
      }
      
      console.log('🎯 Final data being returned:', finalData);
      console.log('🎯 Final data matches:', finalData?.matches);
      
      return finalData;
      
    } catch (error) {
      console.error('❌ Upload failed with error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Server is not running. Please start the backend server.');
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message ||
        'Failed to process resume'
      );
    }
  },

  checkHealth: async () => {
    try {
      console.log('🏥 Checking API health...');
      const response = await api.get('/health');
      console.log('🏥 Health response:', response.data);
      return response.data;
    } catch (error) {
      console.error('🏥 Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  },

  getJobRecommendations: async (data) => {
    try {
      console.log('🤖 Getting job recommendations...');
      console.log('🤖 Request data:', data);
      
      const response = await api.post('/recommendations', data);
      console.log('🤖 Recommendations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('🤖 Failed to get recommendations:', error);
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