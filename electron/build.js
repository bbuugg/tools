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

// Build and package the Electron app for specific platform
async function buildElectronApp(platform = null) {
  try {
    console.log('Converting icon to ICO format...')
    await runCommand('node', ['scripts/convert-icon.js'])

    console.log('Building Vite application...')
    await runCommand('npm', ['run', 'build-only'])

    const builderArgs = ['electron-builder'];
    if (platform) {
      builderArgs.push('--' + platform);
      console.log(`Packaging Electron application for ${platform.toUpperCase()}...`);
    } else {
      console.log('Packaging Electron application for all platforms...');
    }
    
    await runCommand('npx', builderArgs)

    console.log('Electron app built successfully!')
  } catch (error) {
    console.error('Failed to build Electron app:', error)
    process.exit(1)
  }
}

// Parse command line arguments to determine platform
const args = process.argv.slice(2);
let targetPlatform = null;

if (args.length > 0) {
  if (args.includes('--win') || args.includes('-w')) {
    targetPlatform = 'win';
  } else if (args.includes('--mac') || args.includes('-m')) {
    targetPlatform = 'mac';
  } else if (args.includes('--linux') || args.includes('-l')) {
    targetPlatform = 'linux';
  }
}

// Run the build process
buildElectronApp(targetPlatform)
