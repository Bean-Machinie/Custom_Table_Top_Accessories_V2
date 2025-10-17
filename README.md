# Bean Machine - Custom Tabletop Accessories Editor

A full-stack TypeScript application for designing custom tabletop accessories. Built with React, Vite, Tailwind CSS, and Supabase.

## Features

- Full-featured design editor with canvas, layers, and transforms
- Image import with drag-and-drop support
- Pan/zoom navigation with minimap
- Layer management (visibility, ordering, locked base canvas)
- Transform handles for resize, move, and rotate operations
- Real-time autosave to Supabase
- Responsive design with keyboard accessibility
- Token-based design system for consistent styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure your Supabase credentials

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Build

```bash
npm run preview
```

## Project Structure

- `/src/components/ui` - Reusable UI primitives (Button, Menu, Dialog, etc.)
- `/src/components/editor` - Editor-specific components
- `/src/stores` - State management with React Context
- `/src/adapters` - Database and storage adapters for Supabase
- `/src/lib` - Utility functions (geometry, transforms)
- `/src/pages` - Route pages
- `/shared` - Shared TypeScript types

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Backend**: Supabase (PostgreSQL + Storage)
- **Routing**: React Router
- **State Management**: React Context + useReducer