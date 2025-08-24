// Simple WebRTC signaling server for local network file transfer
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

// Create HTTP server
const server = createServer()
const wss = new WebSocketServer({ server })

// Store connected clients
const clients = new Map()

wss.on('connection', (ws) => {
  console.log('New client connected')

  // Assign a temporary ID to the client
  const clientId = generateClientId()
  clients.set(clientId, ws)

  // Send client their ID
  ws.send(
    JSON.stringify({
      type: 'id',
      id: clientId,
    }),
  )

  // Notify all clients about the new device
  broadcast(
    {
      type: 'device-discovered',
      id: clientId,
      name: `Device ${clientId.substring(0, 6)}`,
    },
    clientId,
  )

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message)

      switch (data.type) {
        case 'discover':
          // Send list of all connected devices
          const devices = []
          clients.forEach((client, id) => {
            if (id !== clientId) {
              devices.push({
                id: id,
                name: `Device ${id.substring(0, 6)}`,
              })
            }
          })

          ws.send(
            JSON.stringify({
              type: 'devices',
              devices: devices,
            }),
          )
          break

        case 'offer':
          // Forward offer to target device
          if (clients.has(data.target)) {
            const targetClient = clients.get(data.target)
            targetClient.send(
              JSON.stringify({
                type: 'offer',
                source: clientId,
                sdp: data.sdp,
              }),
            )
          }
          break

        case 'answer':
          // Forward answer to source device
          if (clients.has(data.target)) {
            const targetClient = clients.get(data.target)
            targetClient.send(
              JSON.stringify({
                type: 'answer',
                source: clientId,
                sdp: data.sdp,
              }),
            )
          }
          break

        case 'ice-candidate':
          // Forward ICE candidate to target device
          if (clients.has(data.target)) {
            const targetClient = clients.get(data.target)
            targetClient.send(
              JSON.stringify({
                type: 'ice-candidate',
                source: clientId,
                candidate: data.candidate,
              }),
            )
          }
          break

        default:
          console.log('Unknown message type:', data.type)
      }
    } catch (error) {
      console.error('Error processing message:', error)
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected:', clientId)
    clients.delete(clientId)

    // Notify all clients about the disconnected device
    broadcast(
      {
        type: 'device-disconnected',
        id: clientId,
      },
      clientId,
    )
  })
})

// Broadcast message to all clients except sender
function broadcast(message, senderId) {
  clients.forEach((client, id) => {
    if (id !== senderId && client.readyState === 1) {
      client.send(JSON.stringify(message))
    }
  })
}

// Generate a random client ID
function generateClientId() {
  return 'client_' + Math.random().toString(36).substr(2, 9)
}

// Start server on port 3000, or next available port
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`)
})

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`)
    server.listen(PORT + 1)
  } else {
    console.error('Server error:', error)
  }
})
