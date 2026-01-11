import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to run a command and wait for it to complete
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`)

    const process = spawn(command, args, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true,
      ...options,
    })

    process.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })

    process.on('error', (error) => {
      reject(error)
    })
  })
}

// Build and package the Electron app
async function buildElectronApp() {
  try {
    console.log('Building Vue application...')
    await runCommand('npm', ['run', 'build'])

    console.log('Packaging Electron application...')
    await runCommand('npx', ['electron-builder'])

    console.log('Electron app built successfully!')
  } catch (error) {
    console.error('Failed to build Electron app:', error)
    process.exit(1)
  }
}

// Run the build process
buildElectronApp()
