import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import net from 'net'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set environment to development
process.env.NODE_ENV = 'development'

let vitePort = 5173

// Function to check if a port is open
function isPortOpen(port) {
  return new Promise((resolve) => {
    const client = new net.Socket()
    client.setTimeout(1000)

    client.connect(port, 'localhost', () => {
      client.destroy()
      resolve(true)
    })

    client.on('error', () => {
      client.destroy()
      resolve(false)
    })

    client.on('timeout', () => {
      client.destroy()
      resolve(false)
    })
  })
}

// Wait for Vite server to be ready
async function waitForViteServer() {
  console.log('Waiting for Vite server to be ready...')

  // Try every 1 second for up to 30 seconds
  for (let i = 0; i < 30; i++) {
    if (await isPortOpen(vitePort)) {
      console.log(`Vite server is ready on port ${vitePort}!`)
      return true
    }
    process.stdout.write('.')
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return false
}

// Start Vite dev server
console.log('Starting Vite dev server...')
const viteProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'pipe',
  shell: true,
})

let electronProcess = null

viteProcess.stdout.on('data', (data) => {
  const output = data.toString()
  process.stdout.write(output)

  // Extract port from Vite output
  const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/)
  if (portMatch) {
    vitePort = parseInt(portMatch[1])
    console.log(`\nDetected Vite running on port ${vitePort}`)
  }

  // Check if Vite server is ready
  if (output.includes('ready in')) {
    console.log('\nVite server is running, starting Electron...')
    startElectron()
  }
})

viteProcess.stderr.on('data', (data) => {
  process.stderr.write(data.toString())
})

viteProcess.on('close', (code) => {
  console.log(`Vite process exited with code ${code}`)
  if (electronProcess) {
    electronProcess.kill()
  }
})

viteProcess.on('error', (error) => {
  console.error('Failed to start Vite process:', error)
})

// Start Electron
function startElectron() {
  // Wait a bit more to ensure server is fully ready
  setTimeout(() => {
    electronProcess = spawn('electron', ['.'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true,
    })

    electronProcess.on('close', (code) => {
      console.log(`Electron process exited with code ${code}`)
      // Kill Vite process when Electron is closed
      viteProcess.kill()
    })

    electronProcess.on('error', (error) => {
      console.error('Failed to start Electron process:', error)
    })
  }, 2000)
}
