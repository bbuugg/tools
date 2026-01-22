# Developer Tools Collection

A comprehensive collection of developer utilities and tools built with **React**, **TypeScript**, **Vite**, and **Electron**. This project provides a unified interface for various tasks ranging from JSON processing and media manipulation to web development utilities and system helpers.

## 🚀 Features

The tools are categorized into four main sections:

### 🌐 Web Tools
Essential utilities for web developers and designers.
- **HTTP/Network**:
  - **Http Tester**: A robust tool for testing API endpoints (like Postman).
  - **WebSocket Tool**: Test WebSocket connections.
  - **IP Lookup**: Query IP address information.
  - **Url Encoder**: Encode and decode URLs.
  - **JWT Tool**: Decode and inspect JSON Web Tokens.
- **Converters & Generators**:
  - **Cron Generator**: Generate and explain Cron expressions.
  - **CSS Gradient Generator**: Create CSS gradients visually.
  - **Favicon Generator**: Generate favicons for websites.
  - **Image To Ico**: Convert images to ICO format.
  - **Base64 Image Converter**: Convert images to Base64 strings.
  - **HTML/Markdown**: Convert between HTML and Markdown, extract HTML content, convert files to Markdown.
  - **YML/Properties Converter**: Convert between YAML and Properties files.
  - **Number Base Converter**: Convert numbers between binary, octal, decimal, and hex.
  - **Timestamp/Date**: Date calculator, Timestamp converter, Timezone converter.
  - **Unicode/Encoding**: Unicode converter, Text encoding converter.
- **Security & Text**:
  - **Crypto Tools**: Hashing and encryption utilities.
  - **Password Generator**: Generate secure passwords.
  - **Regex Tester**: Test and debug regular expressions.
  - **Text Tools**: Text processor, Text counter, Text space stripper.
  - **Code Formatter**: Prettify code snippets.
- **PDF & Docs**:
  - **PDF Manager**: Manage PDF files.
  - **PDF Converter**: Convert PDFs.
  - **PDF Compressor**: Reduce PDF file size.
- **Other**:
  - **Icon Designer**: Design custom icons.
  - **Simple DB Demo**: Demonstration of SQLite integration.

### 📋 JSON Tools
Powerful tools for handling JSON data.
- **JSON Editor**: Edit JSON data with a visual interface.
- **JSON Formatter**: Format and beautify JSON strings.
- **JSON Converter**: Convert JSON to other formats.
- **JSON Extractor**: Extract specific data from JSON using paths.
- **Excel <-> JSON**: Convert between Excel files (.xlsx) and JSON.

### 🎬 Media Tools
Tools for working with images, video, and audio.
- **Image Processing**:
  - **Image Compressor**: Compress images to save space.
  - **Image Watermark**: Add watermarks to images.
  - **File Renamer**: Batch rename files.
  - **Color Picker**: Pick and manage colors.
  - **Image List Processor**: Process batches of images.
- **GIF Tools**:
  - **Gif Editor**: Edit GIF images.
  - **Image to GIF**: Create GIFs from a sequence of images.
  - **Video to GIF**: Convert video clips to GIF.
- **Video**:
  - **Video Image Converter**: Extract images from video.
- **QR Code**: Generate and read QR codes.

### 🧩 AS (Assistive/System) Tools
Miscellaneous utilities for personal productivity and system interaction.
- **Breathing Reminder**: A tool to remind you to take deep breaths.
- **Click Counter**: Count mouse clicks.
- **Typing Simulator**: Simulate typing effects.
- **Mouse Track**: Track mouse movement.
- **Day Of Week**: Calculate the day of the week for a date.
- **Encouragement**: Get motivated!
- **Identity Transformer**: (Tool description dependent on implementation).
- **Text Copy Tool**: Helper for copying text.
- **Power On/Empty Detectors**: System status utilities.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Desktop Runtime**: [Electron 31](https://www.electronjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), [Ant Design 6](https://ant.design/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Database**: [Better SQLite3](https://github.com/WiseLibs/better-sqlite3)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd tools
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

## 🏃‍♂️ Usage

### Web Development
To start the React development server (browser-only mode):
```bash
npm run dev
```

### Electron Development
To start the application in Electron mode (desktop app):
```bash
npm run electron:dev
```

## 🏗️ Building

### Web Build
To build the project for the web (outputs to `dist/`):
```bash
npm run build
```

### Electron Build
To package the application for the desktop (outputs to `dist-electron/` and installers):
```bash
npm run electron:build
```

## 📂 Project Structure

```text
tools/
├── electron/          # Electron main process code
├── src/
│   ├── app/tools/     # Tool logic/utilities
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components (entry points for tools)
│   │   └── tools/     # Tool pages organized by category (AS, Json, Media, Web)
│   ├── layouts/       # App layouts
│   ├── hooks/         # Custom React hooks
│   ├── router/        # Routing configuration
│   ├── store/         # Global state (Zustand)
│   └── utils/         # Helper functions
├── public/            # Static assets
└── ...config files
```

## 📄 License

[MIT](LICENSE)