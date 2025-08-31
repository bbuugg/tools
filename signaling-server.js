// Simple WebRTC signaling server for local network file transfer with room support
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

// Create HTTP server
const server = createServer()
const wss = new WebSocketServer({ server })

// Store connected clients and rooms
const clients = new Map()
const rooms = new Map()

// Generate a random room ID
function generateRoomId() {
  return 'room_' + Math.random().toString(36).substr(2, 9)
}

// Generate a random client ID
function generateClientId() {
  return 'client_' + Math.random().toString(36).substr(2, 9)
}

wss.on('connection', (ws) => {
  console.log('New client connected')

  // Assign a temporary ID to the client
  const clientId = generateClientId()
  clients.set(clientId, {
    ws: ws,
    roomId: null,
    name: `Device ${clientId.substring(0, 6)}`,
  })

  // Send client their ID
  ws.send(
    JSON.stringify({
      type: 'id',
      id: clientId,
    }),
  )

  // Notify all clients about the new device (only those not in rooms)
  broadcastToLobby(
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

      // Get client info
      const client = clients.get(clientId)
      if (!client) return

      switch (data.type) {
        case 'discover':
          // Send list of all connected devices (only those not in rooms)
          const devices = []
          clients.forEach((clientInfo, id) => {
            if (id !== clientId && !clientInfo.roomId) {
              devices.push({
                id: id,
                name: clientInfo.name,
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

        // Room-based WebRTC signaling
        case 'room-offer':
          if (client.roomId && rooms.has(client.roomId)) {
            const room = rooms.get(client.roomId)
            // Broadcast offer to all other participants in the room
            room.participants.forEach((participant) => {
              if (participant.id !== clientId && clients.has(participant.id)) {
                const participantClient = clients.get(participant.id)
                participantClient.ws.send(
                  JSON.stringify({
                    type: 'offer',
                    source: clientId,
                    sdp: data.sdp,
                  }),
                )
              }
            })
          }
          break

        case 'room-answer':
          if (client.roomId && rooms.has(client.roomId)) {
            const room = rooms.get(client.roomId)
            // Broadcast answer to all other participants in the room
            room.participants.forEach((participant) => {
              if (participant.id !== clientId && clients.has(participant.id)) {
                const participantClient = clients.get(participant.id)
                participantClient.ws.send(
                  JSON.stringify({
                    type: 'answer',
                    source: clientId,
                    sdp: data.sdp,
                  }),
                )
              }
            })
          }
          break

        case 'room-ice-candidate':
          if (client.roomId && rooms.has(client.roomId)) {
            const room = rooms.get(client.roomId)
            // Broadcast ICE candidate to all other participants in the room
            room.participants.forEach((participant) => {
              if (participant.id !== clientId && clients.has(participant.id)) {
                const participantClient = clients.get(participant.id)
                participantClient.ws.send(
                  JSON.stringify({
                    type: 'ice-candidate',
                    source: clientId,
                    candidate: data.candidate,
                  }),
                )
              }
            })
          }
          break

        case 'connection-request':
          // Forward connection request to target device
          if (clients.has(data.target)) {
            const targetClient = clients.get(data.target)
            targetClient.ws.send(
              JSON.stringify({
                type: 'connection-request',
                source: clientId,
                name: data.name || client.name,
              }),
            )
          }
          break

        case 'offer':
          // Forward offer to target device
          if (clients.has(data.target)) {
            const targetClient = clients.get(data.target)
            targetClient.ws.send(
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
            targetClient.ws.send(
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
            targetClient.ws.send(
              JSON.stringify({
                type: 'ice-candidate',
                source: clientId,
                candidate: data.candidate,
              }),
            )
          }
          break

        // Room-related messages
        case 'create-room':
          const roomId = generateRoomId()
          const userName = data.userName || client.name

          // Update client name if provided
          if (data.userName) {
            client.name = data.userName
          }

          const room = {
            id: roomId,
            host: clientId,
            participants: [
              {
                id: clientId,
                name: userName,
                role: 'host',
              },
            ],
            createdAt: Date.now(),
          }
          rooms.set(roomId, room)

          // Update client info
          client.roomId = roomId

          // Send room created message
          ws.send(
            JSON.stringify({
              type: 'room-created',
              roomId: roomId,
            }),
          )

          console.log(`Room ${roomId} created by ${userName} (${clientId})`)
          break

        case 'join-room':
          const targetRoom = rooms.get(data.roomId)
          if (!targetRoom) {
            ws.send(
              JSON.stringify({
                type: 'room-error',
                error: 'Room not found',
              }),
            )
            break
          }

          // Update client name if provided
          if (data.userName) {
            client.name = data.userName
          }

          // Add participant to room
          targetRoom.participants.push({
            id: clientId,
            name: client.name,
            role: 'member',
          })

          // Update client info
          client.roomId = data.roomId

          // Notify all room participants about the new participant
          targetRoom.participants.forEach((participant) => {
            if (clients.has(participant.id)) {
              const participantClient = clients.get(participant.id)
              participantClient.ws.send(
                JSON.stringify({
                  type: 'participant-joined',
                  participantId: clientId,
                  name: client.name,
                  role: 'member',
                }),
              )
            }
          })

          // Send room joined message with participant list
          ws.send(
            JSON.stringify({
              type: 'room-joined',
              roomId: data.roomId,
              participants: targetRoom.participants,
              isHost: false,
            }),
          )

          console.log(`${client.name} (${clientId}) joined room ${data.roomId}`)
          break

        case 'leave-room':
          if (client.roomId) {
            const room = rooms.get(client.roomId)
            if (room) {
              // Remove participant from room
              room.participants = room.participants.filter((p) => p.id !== clientId)

              // Notify remaining participants
              room.participants.forEach((participant) => {
                if (clients.has(participant.id)) {
                  const participantClient = clients.get(participant.id)
                  participantClient.ws.send(
                    JSON.stringify({
                      type: 'participant-left',
                      participantId: clientId,
                    }),
                  )
                }
              })

              // If room is empty, delete it
              if (room.participants.length === 0) {
                rooms.delete(client.roomId)
              }
            }

            // Update client info
            client.roomId = null
          }
          break

        case 'room-message':
          if (client.roomId) {
            const room = rooms.get(client.roomId)
            if (room) {
              // Broadcast message to all room participants except sender
              room.participants.forEach((participant) => {
                if (participant.id !== clientId && clients.has(participant.id)) {
                  const participantClient = clients.get(participant.id)
                  participantClient.ws.send(
                    JSON.stringify({
                      type: 'room-message',
                      messageType: data.messageType,
                      message: data.message,
                      content: data.content,
                      sender: clientId,
                      senderName: client.name,
                    }),
                  )
                }
              })
            }
          }
          break

        case 'room-action':
          if (client.roomId && room.host === clientId) {
            const room = rooms.get(client.roomId)
            if (room && data.action === 'kick') {
              // Handle kick action
              const targetClient = clients.get(data.targetId)
              if (targetClient) {
                targetClient.ws.send(
                  JSON.stringify({
                    type: 'kicked',
                    reason: 'Kicked by host',
                  }),
                )
                // Force disconnect the target client
                targetClient.ws.close()
              }
            }
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

    // Get client info before deleting
    const client = clients.get(clientId)
    if (!client) return

    // Handle room cleanup if client was in a room
    if (client.roomId) {
      const room = rooms.get(client.roomId)
      if (room) {
        // Remove participant from room
        room.participants = room.participants.filter((p) => p.id !== clientId)

        // Notify remaining participants
        room.participants.forEach((participant) => {
          if (clients.has(participant.id)) {
            const participantClient = clients.get(participant.id)
            participantClient.ws.send(
              JSON.stringify({
                type: 'participant-left',
                participantId: clientId,
              }),
            )
          }
        })

        // If room is empty, delete it
        if (room.participants.length === 0) {
          rooms.delete(client.roomId)
        }
      }
    }

    // Remove client
    clients.delete(clientId)

    // Notify all clients about the disconnected device (only those not in rooms)
    broadcastToLobby(
      {
        type: 'device-disconnected',
        id: clientId,
      },
      clientId,
    )
  })
})

// Broadcast message to all clients except sender (only those not in rooms)
function broadcastToLobby(message, senderId) {
  clients.forEach((clientInfo, id) => {
    if (id !== senderId && !clientInfo.roomId && clientInfo.ws.readyState === 1) {
      clientInfo.ws.send(JSON.stringify(message))
    }
  })
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
