// Centralized configuration for environment variables
const config = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  API_BASE: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:5000/api'
};

export default config;
