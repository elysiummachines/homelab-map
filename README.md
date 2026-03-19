<div align="center">

# 🖥️ Homelab Map
**An interactive visual map of my homelab infrastructure, devices, and network topology.**

[![Release](https://img.shields.io/github/v/release/elysiummachines/homelab-map?style=flat-square&color=blue)](https://github.com/elysiummachines/homelab-map/releases)
[![Downloads](https://img.shields.io/github/downloads/elysiummachines/homelab-map/total?style=flat-square&color=ff0000)](https://github.com/elysiummachines/homelab-map/releases)
[![Node](https://img.shields.io/badge/Node-v18+-green?style=flat-square)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-React-cyan?style=flat-square)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-grey.svg?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/elysiummachines/homelab-map?style=social)](https://github.com/elysiummachines/homelab-map/stargazers)

[Features](#features) • [Getting Started](#getting-started) • [Changelog](CHANGELOG.md)

</div>

![Homelab Map demo](demo.gif)

## Overview

Homelab Map is a React + Vite web application that provides an interactive visual representation of my homelab - including devices, services, and network topology.

## Features

- Interactive node-based network map
- Visual representation of devices and services
- Animated particle network background
- Clean, modern dark UI

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

### Installation
```bash
git clone https://github.com/elysiummachines/homelab-map.git
cd homelab-map
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

Outputs to the `dist/` folder.

## Project Structure
```
homelab-map/
├── public/          # Static files
├── src/             # React source
│   ├── assets/      # Icons and images
│   ├── App.jsx      # Main UI component
│   └── App.css      # Styles
├── index.html
└── vite.config.js
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT
