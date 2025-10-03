# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack (default port: 3000)
- `npm run build` - Build production bundle with Turbopack
- `npm start` - Start production server

### Testing
No test framework is currently configured in this project.

## Architecture

### Tech Stack
- **Framework**: Next.js 15.5.4 (App Router)
- **React**: v19.1.0
- **TypeScript**: v5
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist Sans and Geist Mono (via next/font)

### Project Structure
- `app/` - Next.js App Router directory
  - `layout.tsx` - Root layout with font configuration and metadata
  - `page.tsx` - Homepage component
  - `globals.css` - Global styles
- TypeScript path alias: `@/*` maps to root directory

### Specify Workflow Integration
This project includes `.specify/` directory with structured development workflow tools:
- Custom slash commands: `/specify`, `/plan`, `/clarify`, `/tasks`, `/analyze`, `/implement`, `/constitution`
- Templates for specifications, planning, and task management
- Constitution template for project principles and governance

### Build Configuration
- Uses Turbopack for faster builds and development
- TypeScript strict mode enabled
- ES2017 target with ESNext modules
