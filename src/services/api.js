import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://job-recommend-ai-server.onrender.com/api';

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // Increased timeout to 90 seconds for Render's cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry utility function with exponential backoff
const retryRequest = async (requestFn, maxRetries = 3, baseDelay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt} of ${maxRetries}`);
      return await requestFn();
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed:`, {
        status: error.response?.status,
        message: error.message,
        isRateLimit: error.response?.status === 429
      });
      
      // If it's a 429 error and we have retries left
      if (error.response?.status === 429 && attempt < maxRetries) {
        // Calculate delay with exponential backoff: 2s, 4s, 8s, etc.
        let delay = baseDelay * Math.pow(2, attempt - 1);
        
        // Check if server provides Retry-After header (in seconds)
        const retryAfter = error.response?.headers['retry-after'];
        if (retryAfter) {
          const retryAfterMs = parseInt(retryAfter) * 1000;
          delay = Math.max(delay, retryAfterMs);
          console.log(`⏳ Server requested wait time: ${retryAfter}s`);
        }
        
        console.log(`⏳ Rate limited (429). Waiting ${delay}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Also retry on server errors (5xx) for resilience
      if ((error.response?.status >= 500 || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(1.5, attempt - 1); // Smaller backoff for server errors
        console.log(`⏳ Server error (${error.response?.status || error.code}). Waiting ${delay}ms before retry ${attempt + 1}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's not retryable or we're out of retries, throw the error
      throw error;
    }
  }
};

api.interceptors.request.use(
  (config) => {
    console.log(`📤 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    console.log('📤 Request config:', {
      url: config.url,
      method: config.method,
      timeout: config.timeout,
      headers: config.headers
    });
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
    console.log('📥 Response data type:', typeof response.data);
    console.log('📥 Response data keys:', Object.keys(response.data || {}));
    
    // Log rate limiting headers if present
    const rateLimitHeaders = {
      'x-ratelimit-limit': response.headers['x-ratelimit-limit'],
      'x-ratelimit-remaining': response.headers['x-ratelimit-remaining'],
      'x-ratelimit-reset': response.headers['x-ratelimit-reset'],
      'retry-after': response.headers['retry-after']
    };
    
    const hasRateLimitInfo = Object.values(rateLimitHeaders).some(value => value !== undefined);
    if (hasRateLimitInfo) {
      console.log('📊 Rate limit info:', rateLimitHeaders);
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API response error:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    
    // Log rate limiting headers in error responses
    if (error.response?.headers) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        console.error('⏳ Retry-After header:', retryAfter + 's');
      }
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  uploadResume: async (file, onProgress = null) => {
    const uploadRequest = async () => {
      console.log('📁 Starting file upload...');
      console.log('📁 File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeFormatted: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
      
      const formData = new FormData();
      formData.append('resume', file);
      
      console.log('📤 Sending upload request...');
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for file upload
      };
      
      // Add progress callback if provided
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`📊 Upload progress: ${percentCompleted}%`);
          onProgress(percentCompleted);
        };
      }
      
      const response = await api.post('/upload', formData, config);
      
      console.log('✅ Upload response received');
      console.log('✅ Response data:', response.data);
      
      // Log the structure for debugging
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
      
      // Handle different response structures
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
      return finalData;
    };

    try {
      // Use retry logic with longer delays for file uploads
      return await retryRequest(uploadRequest, 4, 3000); // 4 retries, 3s base delay
    } catch (error) {
      console.error('❌ Upload failed with error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response?.data);
      
      // Enhanced error messages
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const waitTime = retryAfter ? ` Please wait ${retryAfter} seconds and` : '';
        throw new Error(`Server is currently handling many requests.${waitTime} try again in a few minutes.`);
      } else if (error.response?.status === 413) {
        throw new Error('File is too large. Please upload a smaller resume file (under 5MB).');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid file format. Please upload a PDF or Word document.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server is temporarily unavailable. Please try again in a few minutes.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Upload timed out. Please try again with a smaller file or better internet connection.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message ||
        'Failed to process resume. Please try again.'
      );
    }
  },

  checkHealth: async () => {
    const healthRequest = async () => {
      console.log('🏥 Checking API health...');
      const response = await api.get('/health');
      console.log('🏥 Health response:', response.data);
      return response.data;
    };

    try {
      return await retryRequest(healthRequest, 2, 1000);
    } catch (error) {
      console.error('🏥 Health check failed:', error);
      return { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  getJobRecommendations: async (data) => {
    const recommendationsRequest = async () => {
      console.log('🤖 Getting job recommendations...');
      console.log('🤖 Request data:', data);
      
      const response = await api.post('/recommendations', data);
      console.log('🤖 Recommendations response:', response.data);
      return response.data;
    };

    try {
      return await retryRequest(recommendationsRequest, 3, 2000);
    } catch (error) {
      console.error('🤖 Failed to get recommendations:', error);
      
      if (error.response?.status === 429) {
        throw new Error('Recommendation service is busy. Please try again in a few minutes.');
      }
      
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
    const maxSize = 5 * 1024 * 1024; // 5MB to match your component
    
    if (!validTypes.includes(file.type)) {
      throw new Error('Please upload a PDF or DOCX file only.');
    }
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB.');
    }
    
    return true;
  },

  formatErrorMessage: (error) => {
    if (typeof error === 'string') return error;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.error) return error.response.data.error;
    if (error.message) return error.message;
    return 'An unexpected error occurred';
  },

  isRetryableError: (error) => {
    const retryableStatusCodes = [429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.response?.status) || 
           error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT' ||
           error.code === 'ECONNREFUSED';
  },

  // Utility to check server status
  getServerStatus: async () => {
    try {
      const health = await apiService.checkHealth();
      return {
        online: health.status === 'healthy',
        ...health
      };
    } catch (error) {
      return {
        online: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};

export default apiService;