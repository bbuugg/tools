# WebRTC Room-Based File Transfer and Communication

This implementation provides a complete room-based WebRTC solution with the following features:

## Features Implemented

1. **Room-based Communication**
   - Create/join rooms with unique IDs
   - Multi-party WebRTC connections (one RTCPeerConnection per participant)
   - Automatic connection establishment when participants join rooms
   - Proper stream sharing with all room participants

2. **Audio/Video Calling**
   - Camera and microphone access
   - Real-time video streaming to all room participants
   - Toggle camera/microphone on/off

3. **Screen Sharing**
   - Share your screen with all room participants
   - Automatic stream switching between camera and screen
   - Proper cleanup when screen sharing stops

4. **File Transfer**
   - Send files to all participants in the room
   - Progress tracking during transfers
   - Download received files

5. **Danmaku (Bullet Comments)**
   - Real-time messaging with animated overlays
   - Messages visible to all room participants

## How to Test

### Prerequisites

1. Node.js installed
2. Multiple browser tabs/windows or multiple devices on the same network

### Testing Steps

1. **Start the signaling server:**

   ```bash
   node signaling-server.js
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open the WebRTC tool:**
   - Navigate to http://localhost:5174 (or the port shown in your terminal)
   - Go to "Data Tools" → "WebRTC File Transfer"

4. **Test with multiple participants:**
   - Open multiple browser tabs/windows
   - In the first tab, click "Create Room"
   - Copy the room ID
   - In other tabs, paste the room ID and click "Join Room"
   - All participants should see each other in the participant list

5. **Test audio/video:**
   - Click "Enable Camera" to start streaming
   - All participants should see each other's video streams
   - Toggle camera/microphone on/off to test controls

6. **Test screen sharing:**
   - Click "Share Screen" and select a window/screen to share
   - All participants should see the shared screen
   - Stop sharing and verify camera stream returns

7. **Test file transfer:**
   - Select a file and click "Send File"
   - All participants should receive the file with progress tracking

8. **Test danmaku:**
   - Enter a message in the danmaku input and click "Send"
   - Message should appear as animated overlay for all participants

## Technical Implementation Details

### Multi-Party WebRTC Architecture

- Each participant maintains separate RTCPeerConnection instances for each other participant
- Signaling messages are broadcast to all room participants via the signaling server
- Streams are automatically added to all existing peer connections when they start
- When new participants join, existing participants create connections with them and share streams

### Stream Management

- Local camera streams are added to all peer connections when starting
- Screen sharing streams replace camera streams in all peer connections
- Proper cleanup when leaving rooms or stopping streams
- Track deduplication to prevent adding the same track multiple times

### File Transfer

- Uses RTCDataChannel for reliable file transfer
- Files are sent to all participants simultaneously
- Progress tracking for each participant individually

### Signaling Protocol

Extended room-based signaling messages:

- `room-offer` - Broadcast SDP offers to all room participants
- `room-answer` - Broadcast SDP answers to all room participants
- `room-ice-candidate` - Broadcast ICE candidates to all room participants
- `participant-joined` - Notify all participants when someone joins
- `participant-left` - Notify all participants when someone leaves
- `room-message` - Broadcast messages to all room participants

## Troubleshooting

### Common Issues

1. **Devices can't connect to signaling server:**
   - Ensure signaling-server.js is running on port 3000
   - Check firewall settings

2. **No video streams visible:**
   - Ensure camera/microphone permissions are granted
   - Check browser console for WebRTC errors

3. **Files not transferring:**
   - Ensure data channels are properly established
   - Check network connectivity between devices

### Browser Compatibility

- Modern browsers with WebRTC support (Chrome, Firefox, Edge)
- Screen sharing requires secure context (HTTPS or localhost)

## Code Structure

- `WebRtcFileTransfer.vue` - Main Vue component with all WebRTC functionality
- `signaling-server.js` - Node.js WebSocket server for signaling
- Localization files (`en.ts`, `zh.ts`) - UI text translations
