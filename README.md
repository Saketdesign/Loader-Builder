# Loader Builder

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Demo-loader--builder.saket.works-blue.svg)](https://loader-builder.saket.works/)
[![CI](https://github.com/Saketdesign/Loader-Builder/actions/workflows/ci.yml/badge.svg)](https://github.com/Saketdesign/Loader-Builder/actions/workflows/ci.yml)

Loader Builder is a React and TypeScript visual tool for designing, visualizing, and exporting animated "AI-style" grid loaders. You can tweak properties like pattern, shape, and colors, and instantly export the loader as a React component or as a WebM video!


## Features
- **Visual Builder:** Drag, pan, and zoom around the canvas.
- **Customization:** Tweak colors, grid density, animation styles, and cell shapes.
- **React Export:** Generates clean, ready-to-use React functional components.
- **Video Export:** High-quality WebM recording right from the canvas.

## Getting Started

### Prerequisites
Make sure you have Node >18.x installed.

### Setup

Clone the repository and install dependencies:

```bash
npm install
```

### Running Locally

To start the local development server with Vite:

```bash
npm run dev
```

### Testing

Tests are written using **Vitest** and **React Testing Library**.

- **Run Tests:** `npm test`
- **Check Coverage:** `npm run coverage`

Currently aiming for 80%+ coverage across utility and state management files.

### Linting and Formatting

We use ESLint for linting and Prettier for code formatting.

- **Lint:** `npm run lint`
- **Fix Lint Issues:** `npm run lint:fix`
- **Format Code:** `npm run format`

> **Note:** We enforce formatting via a pre-commit hook using `husky` and `lint-staged`. Your code will automatically format before you can commit.

## Security Practices
- `.gitignore` includes specific exclusions for `node_modules`, `dist`, `build`, and `.env` files.
- Ensure no API keys or big binaries (>50MB) are committed.


## Community & Support

- **Live App:** [loader-builder.saket.works](https://loader-builder.saket.works/)
- **Issue SLA:** Bug reports and feature proposals are answered within 24 hours.
- **Discussions:** Join our [GitHub Discussions](https://github.com/Saketdesign/Loader-Builder/discussions).
