#!/usr/bin/env node

// Start the signaling server
import('./signaling-server.js').then(() => {
  console.log('Signaling server started successfully!')
}).catch((error) => {
  console.error('Failed to start signaling server:', error)
  process.exit(1)
})
