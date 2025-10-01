# 🚀 LinkedIn Post Generation Pipeline

> AI-powered LinkedIn content creation system using Google ADK and Next.js

## 📋 Overview

An intelligent LinkedIn post generation system that creates engaging, professional content through a sophisticated AI agent pipeline. The system combines multiple specialized agents to generate, enhance, and refine LinkedIn posts with hashtags and visual recommendations.

## 🎥 Demo Video

Watch the LinkedIn Post Generation Pipeline in action:

[![LinkedIn Post Generator Demo](https://cdn.loom.com/sessions/thumbnails/89f4f9c129554d8183ad5922ed22a57c-1696253037913-with-play.gif)](https://www.loom.com/share/89f4f9c129554d8183ad5922ed22a57c?sid=771d8506-a9ed-4a6f-9c63-7a39eafd5bc1)

*Click the image above to watch the full demo video*

## 🎯 Key Features

- **🤖 AI-Powered Content Generation** - Creates engaging LinkedIn posts using Gemini 2.0 Flash
- **📊 Parallel Enhancement** - Generates hashtags and visual suggestions simultaneously
- **🔍 Quality Assurance** - Automated review and refinement process
- **🎨 Modern UI** - Clean, responsive Next.js interface with real-time animations
- **⚡ Real-time Processing** - Live progress updates with AI thinking animations

## 🏗️ System Architecture

<img width="1611" height="665" alt="diagram-export-01-10-2025-23_37_56" src="https://github.com/user-attachments/assets/ee2e0fee-1c42-4c68-a2e4-f07333d3555b" />


### High-Level Data Flow
```
┌─────────────────┐    HTTP POST    ┌─────────────────┐    ADK Protocol    ┌─────────────────┐
│   Next.js UI    │ ──────────────► │  API Gateway    │ ──────────────────► │  Agent Pipeline │
│   (Port 3000)   │                 │  /api/generate  │                     │   (Port 8000)   │
│                 │ ◄────────────── │                 │ ◄────────────────── │                 │
└─────────────────┘    JSON Response └─────────────────┘    Agent Response   └─────────────────┘
```

### Agent Pipeline Flow

```
User Input
    ↓
┌─────────────────────┐
│ InitialPostGenerator │ → Generates initial post content
└─────────────────────┘
    ↓
┌─────────────────────┐
│ Enhancement Parallel │ → Runs simultaneously:
│  ├── HashtagGen     │   • Creates relevant hashtags
│  └── VisualFinder   │   • Suggests professional visuals
└─────────────────────┘
    ↓
┌─────────────────────┐
│   PostReviewer      │ → Quality assessment & feedback
└─────────────────────┘
    ↓
┌─────────────────────┐
│   PostRefiner       │ → Final content refinement
└─────────────────────┘
    ↓
Structured Output: Post + Hashtags + Visuals
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS, Lucide Icons
- **Backend**: Google ADK (Agent Development Kit)
- **AI Model**: Gemini 2.0 Flash
- **Architecture**: Sequential + Parallel Agent System
- **Tools**: Google Search API, Character Analysis

## 📁 Project Structure

```
LinkedInPostGenerationPipeline/
├── linkedin_post_agent/           # Core agent system
│   ├── agent.py                  # Main sequential pipeline
│   └── subagents/               # Specialized agents
│       ├── post_generator/      # Initial content creation
│       ├── hashtag_generator/   # Hashtag suggestions
│       ├── visual_finder/       # Visual recommendations
│       ├── post_reviewer/       # Quality assessment
│       └── post_refiner/        # Content refinement
├── nextjssetup/agentcontent/    # Frontend application
│   ├── app/
│   │   ├── page.js             # Main UI component
│   │   └── api/generate-post/   # API gateway
│   └── package.json
└── requirements.txt             # Python dependencies
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+
- Google ADK installed
- Valid Google API keys

### 1. Setup Python Environment

```bash
# Install dependencies
pip install -r requirements.txt

# Start the ADK agent server
adk api_server

# In another terminal, run the web interface
adk web
```

### 2. Setup Frontend

```bash
# Navigate to frontend directory
cd nextjssetup/agentcontent

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access the Application

- **Frontend UI**: http://localhost:3000
- **ADK Web Interface**: http://localhost:8001
- **Agent API Server**: http://localhost:8000

## 🎮 Usage

1. **Input Content Details**
   - Enter your LinkedIn post topic
   - Add additional context (optional)
   - Select desired tone (professional, casual, inspiring, etc.)

2. **Generate Content**
   - Click "Generate Post" to start the AI pipeline
   - Watch real-time progress with AI thinking animations
   - Wait for the complete analysis and generation

3. **Review Results**
   - Review the generated post content
   - Check suggested hashtags for maximum reach
   - Explore visual recommendations for enhanced engagement
   - Copy individual sections or the complete post

## 📊 Agent Pipeline Details

### Sequential Execution
- **InitialPostGenerator**: Creates base content from user input
- **PostEnhancementParallel**: Simultaneously generates hashtags and finds visuals
- **PostReviewer**: Evaluates content quality with strict criteria
- **PostRefiner**: Applies feedback to create final polished content

### Quality Assurance
- Character count validation (1000-1500 characters)
- Content requirements assessment
- Style and tone verification
- Automated refinement loops

## 🔧 Configuration

### Environment Variables
```bash
# Google API Configuration
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_custom_search_engine_id

# ADK Configuration
ADK_PROJECT_ID=your_project_id
```

### Agent Settings
- **Model**: Gemini 2.0 Flash
- **Max Refinement Loops**: 3
- **Character Limits**: 1000-1500
- **Parallel Processing**: Hashtags + Visuals

## 📈 Benefits & Impact

### For Content Creators
- **⏱️ Time Efficiency**: Reduces post creation time by 80%
- **📊 Quality Assurance**: Consistent, professional content
- **🎯 Enhanced Reach**: Optimized hashtags and visual suggestions
- **🔄 Iterative Improvement**: Automated refinement process

### For Businesses
- **📈 Brand Consistency**: Maintains professional tone across posts
- **🚀 Scalable Content**: Generate multiple high-quality posts quickly
- **💡 Strategic Insights**: Data-driven hashtag and visual recommendations
- **🎨 Professional Appeal**: Polished, engaging content that drives engagement

## 🔄 Development Commands

```bash
# Backend Development
adk api_server          # Start agent server
adk web                 # Launch ADK web interface
python -m pytest       # Run tests

# Frontend Development
npm run dev            # Start Next.js dev server
npm run build          # Build for production
npm run lint           # Run ESLint

# Combined Development
# Terminal 1: adk api_server
# Terminal 2: cd nextjssetup/agentcontent && npm run dev
# Terminal 3: adk web (optional - for agent debugging)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **Google ADK** for the agent development framework
- **Gemini 2.0 Flash** for powerful AI capabilities
- **Next.js** for the modern frontend framework
- **Tailwind CSS** for beautiful, responsive design

---

**Made with ❤️ for better LinkedIn content creation**
