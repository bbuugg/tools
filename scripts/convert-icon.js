import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const inputPng = path.join(projectRoot, 'public', 'logo.png');
const outputIco = path.join(projectRoot, 'build', 'icon.ico');

async function convertPngToIco() {
  try {
    // 确保 build 目录存在
    const buildDir = path.join(projectRoot, 'build');
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    console.log('Converting PNG to ICO...');
    console.log('Input:', inputPng);
    console.log('Output:', outputIco);

    // 转换 PNG 到 ICO
    const icoBuffer = await pngToIco(inputPng);
    fs.writeFileSync(outputIco, icoBuffer);

    console.log('✓ Icon converted successfully!');
  } catch (error) {
    console.error('Error converting icon:', error);
    process.exit(1);
  }
}

convertPngToIco();
