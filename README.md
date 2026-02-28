# YAML Visualizer

A modern, interactive web application for visualizing YAML configurations as interactive graphs. Supports Docker Compose, GitHub Actions, Kubernetes, and more!

## Features

- 📝 **Live YAML Editor** - Edit YAML files with syntax highlighting
- 🎨 **Interactive Graph** - Visualize services, jobs, resources as nodes
- 🔄 **Multi-Format Support** - Docker Compose, GitHub Actions, Kubernetes
- 🤖 **Auto-Detection** - Automatically detects YAML type
- 🌓 **Dark/Light Mode** - Toggle between themes
- ⚡ **Real-time Updates** - Instant visualization as you edit
- 🎭 **Animated UI** - Smooth transitions powered by GSAP
- 🔍 **Dependency Mapping** - See dependencies and relationships

## Supported YAML Formats

### 🐳 Docker Compose
- Services, networks, volumes
- Dependencies (depends_on)
- Port mappings and volumes

### ⚡ GitHub Actions
- Workflow jobs
- Job dependencies (needs)
- Steps visualization

### ☸️ Kubernetes
- Pods, Services, Deployments
- ConfigMaps, Secrets
- Resource relationships

### ⎈ Helm Templates
- Kubernetes manifests with Helm templating
- Automatic template preprocessing
- Supports Go template syntax ({{, }}, if, range, etc.)

## Getting Started

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# Clone the repository
git clone https://github.com/yaseen-vm/YAML-Visualizer.git

# Navigate to the project directory
cd YAML-Visualizer

# Install dependencies
npm i

# Start the development server
npm run dev
```

## Usage

1. Select a YAML type (Docker Compose, GitHub Actions, or Kubernetes)
2. Paste your YAML content into the editor or use sample
3. Click **Update Graph** to visualize
4. Interact with the graph - drag nodes, zoom, and pan
5. Toggle the sidebar with the arrow button
6. Switch between dark and light modes

## Tech Stack

- **Vite** - Build tool
- **TypeScript** - Type safety
- **React** - UI framework
- **React Flow** - Graph visualization
- **shadcn-ui** - UI components
- **Tailwind CSS** - Styling
- **GSAP** - Animations
- **js-yaml** - YAML parsing

## Architecture

The application uses a plugin-based parser system:

- **YAML Detector** - Auto-detects YAML format
- **Parser Interface** - Common interface for all parsers
- **Parser Registry** - Manages available parsers
- **Custom Node Components** - Type-specific visualizations

## Adding New YAML Types

1. Create a new parser in `src/lib/parsers/`
2. Implement the `YAMLParser` interface
3. Register in `parser-registry.ts`
4. Add detection logic in `yaml-detector.ts`
5. Create custom node component (optional)
