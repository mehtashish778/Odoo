import axios from 'axios';

// You might want to configure a base URL if your API is not on the same host/port
// For now, we assume it's served from the same origin or proxied.
axios.defaults.baseURL = 'http://localhost:5001'; // Remove duplicate /api path

const api = {
  post: async (endpoint, data) => {
    try {
      const res = await axios.post(endpoint, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return res.data;
    } catch (error) {
      // Handle or throw error to be caught by the caller
      // console.error(\`API Error on POST \${endpoint}:\`, error.response ? error.response.data : error.message);
      throw error.response ? error.response.data : new Error('An API error occurred');
    }
  },
  // We will add a get method later, especially for loading user data with a token
  get: async (endpoint, token) => {
    try {
      const res = await axios.get(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token // Standard header for sending JWT token
        }
      });
      return res.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('An API error occurred');
    }
  },
  put: async (endpoint, data, token) => {
    try {
      const res = await axios.put(endpoint, data, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token // Send token for protected PUT routes
        }
      });
      return res.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('An API error occurred');
    }
  },
  delete: async (endpoint, token) => {
    try {
      const res = await axios.delete(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token // Send token for protected DELETE routes
        }
      });
      return res.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('An API error occurred');
    }
  }
};

export default api; 