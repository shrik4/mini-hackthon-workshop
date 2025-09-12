# Overview

HackPal is a hackathon acceleration platform that generates complete startup packages from problem statements. Users input a brief problem description (like "Smart Water Bottle") and receive market research, prioritized feature lists, React code scaffolds, and pitch deck PDFs. The application is designed for rapid MVP development during hackathons, providing everything needed to go from idea to demo in minimal time.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Full-Stack Architecture
The application follows a modern full-stack TypeScript architecture with clear separation between client and server concerns. The monorepo structure includes shared schemas and types, enabling type safety across the entire application stack.

## Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Vite Build System**: Fast development server and optimized production builds
- **shadcn/ui Component Library**: Comprehensive UI component system built on Radix UI primitives
- **Tailwind CSS**: Utility-first styling with custom CSS variables for theming
- **TanStack Query**: Server state management for API calls with caching and background updates
- **Wouter Router**: Lightweight client-side routing

## Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript support
- **In-Memory Storage**: Simple storage implementation for rapid prototyping (designed to be replaceable with database)
- **Async Processing**: Background generation tasks to handle long-running AI operations
- **File Generation**: Zip and PDF creation capabilities for deliverable packaging

## AI Integration Layer
- **Google Gemini AI**: Primary LLM for market research and feature generation
- **Structured JSON Responses**: Schema-validated AI outputs using response formatting
- **Multi-Step Generation**: Orchestrated workflow for market research → features → code → pitch deck

## Data Layer
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect configuration
- **Zod Validation**: Runtime type checking and API request validation
- **Shared Schema**: Common type definitions between client and server

## External Dependencies

### AI Services
- **Google Gemini API**: Market research analysis and feature prioritization
- **Structured Output Generation**: JSON schema validation for consistent AI responses

### Database
- **Neon Database (Serverless PostgreSQL)**: Production-ready PostgreSQL with serverless scaling
- **Drizzle Kit**: Database migration and schema management tools

### File Processing
- **Archiver**: ZIP file creation for React scaffold delivery
- **PDF Generation**: Pitch deck creation (implementation referenced but not fully shown)

### UI Framework
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe CSS class composition

### Development Tools
- **ESBuild**: Fast JavaScript bundling for production
- **TSX**: TypeScript execution for development
- **Replit Integration**: Development environment plugins and error handling