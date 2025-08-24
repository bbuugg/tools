# WebRTC File Transfer Tool

This tool allows direct file transfer between devices on the same network without using intermediate servers.

## Features

- Direct peer-to-peer file transfer using WebRTC
- Automatic device discovery on local network
- Secure transfer without intermediaries
- Progress tracking for file transfers
- Support for transferring any file type
- Real-time connection status monitoring

## How It Works

1. **Device Discovery**: Devices on the same network can discover each other using a signaling server
2. **WebRTC Connection**: A direct peer-to-peer connection is established between devices
3. **File Transfer**: Files are transferred directly between devices using WebRTC data channels

## Setup Instructions

### Running the Signaling Server

To use this tool, you need to run a signaling server on your local network:

1. Install Node.js dependencies (if not already installed):

   ```bash
   npm install ws
   ```

2. Run the signaling server:
   ```bash
   npm run signaling-server
   ```

The server will start on port 3000 by default. If port 3000 is already in use, you may need to stop the existing process or modify the server to use a different port.

### Using the Tool

1. Open the WebRTC File Transfer tool in your browser on multiple devices
2. Ensure all devices are on the same network
3. Click "Search for Devices" to discover other devices
4. Select a device to connect to
5. Choose a file to send
6. Click "Send File" to transfer the file

## Technical Details

### WebRTC Implementation

- Uses STUN servers for NAT traversal
- Implements WebRTC data channels for file transfer
- Utilizes WebSocket for signaling

### Security

- All file transfers are peer-to-peer (no intermediaries)
- No file data passes through the signaling server
- Connection is encrypted using DTLS/SRTP

### Limitations

- Requires a signaling server for initial connection setup
- Devices must be on the same network or have port forwarding configured
- Large file transfers may be affected by network conditions

## Troubleshooting

### Common Issues

1. **Devices not discovering each other**:
   - Ensure all devices are on the same network
   - Check that the signaling server is running
   - Verify firewall settings
   - Make sure the signaling server is accessible (port 3000)

2. **Connection fails**:
   - Check network connectivity
   - Ensure STUN servers are accessible
   - Try disabling firewall temporarily
   - Verify signaling server is running without errors

3. **File transfer fails**:
   - Check available disk space
   - Verify file permissions
   - Try transferring smaller files first

### Browser Compatibility

This tool works with modern browsers that support WebRTC:

- Chrome 70+
- Firefox 60+
- Safari 12+
- Edge 79+

## Development

### Component Structure

The tool consists of:

- Vue 3 component with TypeScript
- WebRTC connection management
- File handling and transfer logic
- Internationalization support (English and Chinese)

### Adding New Features

To extend functionality:

1. Modify `src/tools/WebRtcFileTransfer.vue`
2. Update translations in `src/locales/en.ts` and `src/locales/zh.ts`
3. Test with multiple devices on the same network

## Future Improvements

- Add support for multiple concurrent file transfers
- Implement file resume capability for interrupted transfers
- Add file encryption for enhanced security
- Improve error handling and user feedback
- Add support for folder transfers
