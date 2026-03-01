/**
 * Frontend Configuration Service
 * Loads API keys and configuration from environment or backend API
 */

class ConfigService {
  constructor() {
    this.config = null;
    this.initialized = false;
  }

  /**
   * Initialize configuration from environment variables
   * Falls back to backend API if env vars not available
   */
  async initialize() {
    if (this.initialized) return this.config;

    // Try to load from environment (build-time variables)
    const envConfig = {
      REACT_APP_OPENWEATHER_API_KEY: process.env.REACT_APP_OPENWEATHER_API_KEY || '',
      REACT_APP_GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY || '',
      REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000'
    };

    // If keys available in env, use them
    if (envConfig.REACT_APP_OPENWEATHER_API_KEY && envConfig.REACT_APP_GEMINI_API_KEY) {
      this.config = envConfig;
      this.initialized = true;
      console.log('✅ Configuration loaded from environment variables');
      return this.config;
    }

    // Try to fetch from backend API (requires auth token)
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await fetch('http://localhost:8000/api/config', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const backendConfig = await response.json();
          this.config = {
            ...envConfig,
            ...backendConfig.config
          };
          this.initialized = true;
          console.log('✅ Configuration loaded from backend API');
          return this.config;
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch config from backend:', error.message);
    }

    // Use environment variables as fallback
    this.config = envConfig;
    this.initialized = true;

    if (!this.config.REACT_APP_GEMINI_API_KEY || !this.config.REACT_APP_OPENWEATHER_API_KEY) {
      console.warn('⚠️ API keys not configured. Some features will use fallback simulation.');
    }

    return this.config;
  }

  /**
   * Get specific config value
   */
  get(key) {
    if (!this.initialized) {
      console.warn('⚠️ Config not initialized. Call initialize() first.');
      return null;
    }
    return this.config[key] || null;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature) {
    if (!this.initialized) return false;
    return this.config?.features?.[feature] ?? false;
  }
}

// Export singleton
export const configService = new ConfigService();

export default ConfigService;
