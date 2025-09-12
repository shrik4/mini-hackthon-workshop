# HackPal

**AI-Powered Hackathon Acceleration Platform**

HackPal transforms simple problem statements into complete hackathon packages, providing everything needed to go from idea to demo in minimal time. Built for developers who want to focus on building rather than planning.

## 🚀 Features

### Core Functionality
- **Intelligent Market Research** - AI-generated market analysis and competitive insights
- **Feature Prioritization** - Automatically categorized MVP and stretch features
- **React Code Scaffolds** - Complete, ready-to-run React applications with TypeScript
- **Pitch Deck Generation** - Professional PDF presentations for your startup idea
- **Real-time Generation** - Background processing with live status updates

### User Experience
- **One-Click Generation** - Input a problem statement and get everything in minutes
- **Downloadable Assets** - ZIP files for code scaffolds and PDF pitch decks
- **Modern UI** - Clean, responsive interface built with shadcn/ui components
- **Progress Tracking** - Real-time status updates during generation

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** component library (Radix UI primitives)
- **Tailwind CSS** for styling
- **TanStack Query** for server state management
- **Wouter** for lightweight routing

### Backend Options
- **Node.js/Express** (Primary)
- **Python/FastAPI** (Alternative for AI/ML workflows)
- **PostgreSQL** with Drizzle ORM
- **Google Gemini AI** for content generation

### Development Tools
- **TypeScript** across the full stack
- **Drizzle Kit** for database migrations
- **ESBuild** for production optimization
- **Neon Database** for serverless PostgreSQL

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackpal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Set your `GOOGLE_API_KEY` or `GEMINI_API_KEY` in the environment
   - Database configuration is handled automatically with Neon

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🎯 Usage

### Basic Workflow
1. **Enter API Key** - Provide your Google Gemini API key
2. **Describe Your Idea** - Input a problem statement (e.g., "Smart water bottle that tracks hydration")
3. **Generate Package** - Click generate and wait for AI processing
4. **Download Assets** - Get your React scaffold ZIP and pitch deck PDF

### Example Problem Statements
- "Smart water bottle that tracks hydration and sends reminders"
- "AI-powered study companion for students"
- "Sustainable food delivery platform"
- "Virtual fitness trainer with real-time feedback"

## 🔌 API Endpoints

### Generation
- `POST /api/generate` - Start new generation
  ```json
  {
    "problemStatement": "string",
    "apiKey": "string"
  }
  ```

- `GET /api/generation/:id` - Get generation status and results
- `GET /api/generation/:id/download/pdf` - Download pitch deck PDF
- `GET /api/generation/:id/download/zip` - Download React scaffold ZIP

### Health Check
- `HEAD /api` - Server health check

## 🏗 Project Structure

```
hackpal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and config
│   │   └── hooks/         # Custom React hooks
├── server/                # Node.js backend
│   ├── services/          # Business logic
│   ├── templates/         # Code generation templates
│   └── storage.ts         # Data persistence
├── python_server/         # Alternative Python backend
├── shared/                # Shared TypeScript schemas
└── replit.md             # Project configuration and preferences
```

## 🤖 AI Integration

HackPal leverages Google's Gemini AI for:

- **Market Research Analysis** - Industry insights and competitive landscape
- **Feature Generation** - Prioritized feature lists with technical specifications
- **Content Creation** - Professional pitch deck content

### AI Workflow
1. Problem statement analysis
2. Market research generation (JSON structured output)
3. Feature prioritization with technical details
4. React scaffold creation with relevant components
5. Pitch deck compilation with market insights

## 🔧 Development

### Adding New Features
1. Update shared schemas in `shared/schema.ts`
2. Implement storage interface changes
3. Add API routes in `server/routes.ts`
4. Create frontend components and pages
5. Update type definitions and validations

### Database Schema
- **generations** - Main generation tracking
- **market_research** - AI-generated market analysis
- **features** - Prioritized feature lists
- Managed with Drizzle ORM for type safety

### Code Generation
React scaffolds include:
- TypeScript configuration
- Tailwind CSS setup
- Component architecture
- Package.json with dependencies
- Vite build configuration

## 🐛 Troubleshooting

### Common Issues
- **API Rate Limits** - Gemini API may return 503 errors under heavy load
- **PDF Generation** - Ensure jsPDF library is properly installed
- **Build Errors** - Check TypeScript compilation and dependencies

### Development Tips
- Use the in-memory storage for rapid prototyping
- Monitor generation status via browser dev tools
- Check server logs for AI API responses

## 🚢 Deployment

The application is designed for Replit deployment with:
- Automatic workflow management
- Built-in PostgreSQL database
- Environment variable handling
- One-click publishing

For other platforms, ensure:
- Database connection configuration
- Environment variable setup
- Build process optimization

## 📄 License

This project is built for hackathon acceleration and rapid prototyping.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for hackathon success**