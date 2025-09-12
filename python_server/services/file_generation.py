import zipfile
import io
import json
import base64
from typing import List

from models import Feature, MarketResearch


class FileGenerationService:
    """Service for generating React scaffolds and pitch decks"""
    
    def generate_react_scaffold(self, problem_statement: str, features: List[Feature]) -> str:
        """Generate a React application scaffold as base64 encoded ZIP"""
        
        project_name = self._sanitize_project_name(problem_statement)
        files = self._generate_scaffold_files(project_name, problem_statement, features)
        
        # Create ZIP file in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for file_path, content in files.items():
                zip_file.writestr(file_path, content)
        
        # Return base64 encoded ZIP
        zip_buffer.seek(0)
        return base64.b64encode(zip_buffer.getvalue()).decode('utf-8')
    
    def generate_pitch_deck(
        self, 
        problem_statement: str, 
        market_research: MarketResearch, 
        features: List[Feature]
    ) -> str:
        """Generate a proper PDF pitch deck using reportlab"""
        
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from io import BytesIO
        
        # Create a BytesIO buffer to hold the PDF
        buffer = BytesIO()
        
        # Create PDF document
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=20,
            spaceAfter=30,
            alignment=1  # Center alignment
        )
        
        slide_title_style = ParagraphStyle(
            'SlideTitle',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            textColor='darkblue'
        )
        
        # Build the content
        story = []
        
        # Title
        story.append(Paragraph("PITCH DECK", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Slide 1: The Problem
        story.append(Paragraph("SLIDE 1: THE PROBLEM", slide_title_style))
        story.append(Paragraph(problem_statement, styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
        
        # Market insight
        market_text = f"Market Insight: {market_research.summary[:200]}..."
        story.append(Paragraph(market_text, styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Slide 2: Solution
        story.append(Paragraph("SLIDE 2: OUR SOLUTION", slide_title_style))
        story.append(Paragraph("Key Features:", styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
        
        # MVP features
        mvp_features = [f for f in features if f.priority == 'mvp'][:3]
        for i, feature in enumerate(mvp_features, 1):
            feature_text = f"{i}. <b>{feature.title}</b>: {feature.description}"
            story.append(Paragraph(feature_text, styles['Normal']))
            story.append(Spacer(1, 0.05*inch))
        
        story.append(Spacer(1, 0.3*inch))
        
        # Slide 3: The Ask
        story.append(Paragraph("SLIDE 3: THE ASK", slide_title_style))
        ask_text = "We're seeking seed funding to develop our MVP and capture market share in this growing industry. Contact us to learn more about this opportunity."
        story.append(Paragraph(ask_text, styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        # Get PDF data and encode to base64
        pdf_data = buffer.getvalue()
        buffer.close()
        
        return base64.b64encode(pdf_data).decode('utf-8')
    
    def _sanitize_project_name(self, problem_statement: str) -> str:
        """Convert problem statement to a valid project name"""
        import re
        name = problem_statement.lower()
        name = re.sub(r'[^a-z0-9\s]', '', name)
        name = re.sub(r'\s+', '-', name)
        return name[:50]
    
    def _format_mvp_features(self, features: List[Feature]) -> str:
        """Format MVP features for the pitch deck"""
        mvp_features = [f for f in features if f.priority == "mvp"][:3]
        return '\n'.join([
            f"{i + 1}. {feature.title}: {feature.description}"
            for i, feature in enumerate(mvp_features)
        ])
    
    def _generate_scaffold_files(
        self, 
        project_name: str, 
        problem_statement: str, 
        features: List[Feature]
    ) -> dict:
        """Generate all files for the React scaffold"""
        
        mvp_features = [f for f in features if f.priority == "mvp"]
        stretch_features = [f for f in features if f.priority == "stretch"]
        
        files = {
            "package.json": self._generate_package_json(project_name),
            "README.md": self._generate_readme(project_name, problem_statement, features),
            "src/App.tsx": self._generate_app_tsx(project_name, mvp_features),
            "src/main.tsx": self._generate_main_tsx(),
            "src/index.css": self._generate_index_css(),
            "index.html": self._generate_index_html(project_name),
            "vite.config.ts": self._generate_vite_config(),
            "tsconfig.json": self._generate_tsconfig(),
            "tailwind.config.js": self._generate_tailwind_config(),
            "postcss.config.js": self._generate_postcss_config(),
        }
        
        # Add component files
        files.update(self._generate_component_files(mvp_features))
        
        return files
    
    def _generate_package_json(self, project_name: str) -> str:
        """Generate package.json for the React project"""
        package_data = {
            "name": project_name,
            "private": True,
            "version": "0.0.0",
            "type": "module",
            "scripts": {
                "dev": "vite",
                "build": "tsc && vite build",
                "preview": "vite preview"
            },
            "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0"
            },
            "devDependencies": {
                "@vitejs/plugin-react": "^4.0.3",
                "typescript": "^5.0.2",
                "vite": "^4.4.5",
                "tailwindcss": "^3.3.0",
                "autoprefixer": "^10.4.14",
                "postcss": "^8.4.24"
            }
        }
        return json.dumps(package_data, indent=2)
    
    def _generate_readme(
        self, 
        project_name: str, 
        problem_statement: str, 
        features: List[Feature]
    ) -> str:
        """Generate README.md file"""
        mvp_features = [f for f in features if f.priority == "mvp"]
        stretch_features = [f for f in features if f.priority == "stretch"]
        
        return f"""# {project_name}

## Problem Statement
{problem_statement}

## Features

### MVP Features
{chr(10).join([f"{i + 1}. **{f.title}** - {f.description}" for i, f in enumerate(mvp_features)])}

### Stretch Features
{chr(10).join([f"{len(mvp_features) + i + 1}. **{f.title}** - {f.description}" for i, f in enumerate(stretch_features)])}

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Tech Stack
{chr(10).join([f"- {f.title}: {f.tech_stack}" for f in features])}

## Generated by HackPal
This project was generated using HackPal, an AI-powered hackathon assistant.
"""
    
    def _generate_app_tsx(self, project_name: str, features: List[Feature]) -> str:
        """Generate App.tsx component"""
        features_json = json.dumps([{
            "title": f.title,
            "description": f.description
        } for f in features], indent=2)
        
        title = ' '.join(word.capitalize() for word in project_name.split('-'))
        
        return f"""import React, {{ useState }} from 'react';
import './index.css';

function App() {{
  const [activeFeature, setActiveFeature] = useState<string>('');

  const features = {features_json};

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A hackathon project generated with HackPal
          </p>
        </header>

        <main className="space-y-8">
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {{features.map((feature, index) => (
                <div 
                  key={{index}}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={{() => setActiveFeature(activeFeature === feature.title ? '' : feature.title)}}
                >
                  <h3 className="font-medium text-gray-900 mb-2">{{feature.title}}</h3>
                  {{activeFeature === feature.title && (
                    <p className="text-gray-600 text-sm">{{feature.description}}</p>
                  )}}
                </div>
              ))}}
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="prose text-gray-600">
              <p>This is your hackathon project scaffold. Start building your features:</p>
              <ol className="list-decimal list-inside space-y-2 mt-4">
                <li>Review the features above</li>
                <li>Start with the MVP features first</li>
                <li>Add your API integrations</li>
                <li>Customize the UI to match your vision</li>
              </ol>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}}

export default App;"""
    
    def _generate_main_tsx(self) -> str:
        """Generate main.tsx entry point"""
        return """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);"""
    
    def _generate_index_css(self) -> str:
        """Generate index.css file"""
        return """@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}"""
    
    def _generate_index_html(self, project_name: str) -> str:
        """Generate index.html file"""
        return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{project_name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>"""
    
    def _generate_vite_config(self) -> str:
        """Generate vite.config.ts"""
        return """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})"""
    
    def _generate_tsconfig(self) -> str:
        """Generate tsconfig.json"""
        config_data = {
            "compilerOptions": {
                "target": "ES2020",
                "useDefineForClassFields": True,
                "lib": ["ES2020", "DOM", "DOM.Iterable"],
                "module": "ESNext",
                "skipLibCheck": True,
                "moduleResolution": "bundler",
                "allowImportingTsExtensions": True,
                "resolveJsonModule": True,
                "isolatedModules": True,
                "noEmit": True,
                "jsx": "react-jsx",
                "strict": True,
                "noUnusedLocals": True,
                "noUnusedParameters": True,
                "noFallthroughCasesInSwitch": True
            },
            "include": ["src"],
            "references": [{"path": "./tsconfig.node.json"}]
        }
        return json.dumps(config_data, indent=2)
    
    def _generate_tailwind_config(self) -> str:
        """Generate tailwind.config.js"""
        return """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}"""
    
    def _generate_postcss_config(self) -> str:
        """Generate postcss.config.js"""
        return """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}"""
    
    def _generate_component_files(self, features: List[Feature]) -> dict:
        """Generate component files for each feature"""
        files = {}
        
        for feature in features:
            import re
            component_name = re.sub(r'[^a-zA-Z0-9]', '', feature.title)
            if component_name:
                files[f"src/components/{component_name}.tsx"] = f"""import React from 'react';

interface {component_name}Props {{
  // Add your props here
}}

export default function {component_name}(props: {component_name}Props) {{
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
      <p className="text-gray-600">{feature.description}</p>
      <div className="mt-4 text-sm text-gray-500">
        Tech Stack: {feature.tech_stack}
      </div>
    </div>
  );
}}"""
        
        return files