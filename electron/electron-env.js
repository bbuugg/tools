// Set environment variables for Electron
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

// Export the configuration
module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5173,
}
