# Development Status System

This system allows you to control tool visibility based on development status and environment.

## How It Works

### Development Environment (npm run dev)
- All tools are visible in the menu
- Tools with `under_development` status work normally
- Useful for testing and development

### Production Environment (npm run build)
- Tools with `under_development` status are hidden from the menu
- If accessed directly via URL, they show the ComingSoon component
- Only `active` tools are fully available

## Usage

### 1. Mark a Tool as Under Development

```typescript
{
  path: 'your-tool',
  name: 'yourTool',
  component: getComponent(YourToolComponent, 'under_development'),
  meta: {
    title: 'Your Tool',
    icon: '🔧',
    status: 'under_development', // This is the key
  },
}
```

### 2. Mark a Tool as Active (Default)

```typescript
{
  path: 'your-tool',
  name: 'yourTool',
  component: YourToolComponent, // No wrapper needed
  meta: {
    title: 'Your Tool',
    icon: '🔧',
    status: 'active', // Or omit this line (defaults to 'active')
  },
}
```

## Current Examples

The following tools are currently set to `under_development`:

- **Background Remover** (`/image-tools/background-remover`)
- **GIF Editor** (`/image-tools/gif-editor`)
- **Color Picker** (`/image-tools/color-picker`)

## Components

- **ComingSoon.vue**: Shows when accessing under-development tools in production
- **getComponent()**: Helper function that returns appropriate component based on status and environment

## Testing

1. **Development Mode**: `npm run dev`
   - All tools visible and functional
   
2. **Production Build**: `npm run build && npm run preview`
   - Under-development tools hidden from menu
   - Direct access shows ComingSoon component

## Status Values

- `'active'`: Tool is fully available (default)
- `'under_development'`: Tool hidden in production, visible in development
