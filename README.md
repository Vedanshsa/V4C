# 🎯 V4C - Voice-4-Compliance

> A modern full-stack platform for building, deploying, and managing voice AI agents powered by **LiveKit**, **React**, and **Python**.

![TypeScript](https://img.shields.io/badge/TypeScript-84.1%25-3178C6?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-11.2%25-3776AB?style=flat-square&logo=python)
![CSS](https://img.shields.io/badge/CSS-1.7%25-1572B6?style=flat-square&logo=css3)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)

---

## ✨ Features

- 🎙️ **Voice AI Agents** - Build intelligent voice agents using LiveKit Agents SDK
- 🚀 **Full-Stack Ready** - Modern React frontend with TypeScript + Python backend
- 🎨 **Beautiful UI** - Crafted with Shadcn/UI, Tailwind CSS, and Framer Motion
- 📊 **Interactive Components** - Rich data visualization with Recharts
- 🌐 **Real-time Communication** - WebRTC-powered voice interactions
- 📱 **Responsive Design** - Works seamlessly across all devices
- 🔒 **Authentication** - Secure user management with Supabase
- 🧪 **Testing** - Comprehensive test coverage with Vitest

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - High-quality component library
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management

### Backend
- **Python 3** - AI agent development
- **LiveKit Agents** - Voice AI framework
- **FastAPI** - Modern async web framework
- **Supabase** - PostgreSQL backend & auth
- **PostgreSQL** - Relational database

### DevOps
- **Docker** - Containerization
- **Vercel** - Frontend deployment
- **Taskfile** - Task automation
- **Bun/UV** - Package management

---

## 📋 Prerequisites

- **Node.js** 18+ or **Bun**
- **Python** 3.8+
- **Git**

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Vedanshsa/V4C.git
cd V4C
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
# or
bun install
```

**Backend:**
```bash
uv sync
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

### 4. Run Development Servers

**Frontend (Terminal 1):**
```bash
npm run dev
# or
bun dev
```

**Backend (Terminal 2):**
```bash
uv run python start-call.py
```

The application will be available at `http://localhost:5173`

---

## 📦 Available Scripts

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run build:dev        # Build in development mode
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run test             # Run tests once
npm run test:watch       # Run tests in watch mode
```

### Backend
```bash
uv run python agent.py   # Run the agent
uv run ruff format       # Format code
uv run ruff check        # Lint code
uv run pytest            # Run tests
```

---

## 📁 Project Structure

```
V4C/
├── src/                      # Frontend React application
│   ├── components/          # Reusable React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── App.tsx             # Main app component
├── public/                  # Static assets
├── supabase/               # Database migrations & functions
├── agent.py                # Main LiveKit agent
├── start-call.py          # Agent startup script
├── package.json            # Node dependencies
├── pyproject.toml         # Python dependencies
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── Dockerfile             # Container image
└── README.md              # This file
```

---

## 🎙️ LiveKit Agent Development

The Python backend uses the **LiveKit Agents SDK** to build voice AI agents. Key files:

- **`agent.py`** - Main agent logic and event handlers
- **`start-call.py`** - Agent initialization and startup
- **`src/`** - Additional agent modules

### Resources
- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [LiveKit CLI](https://docs.livekit.io/intro/basics/cli/)
- Run `lk docs` commands for integrated documentation

---

## 🧪 Testing

### Frontend Tests
```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
```

### Backend Tests
```bash
uv run pytest
```

For detailed testing guidance, see [LiveKit Testing Guide](https://docs.livekit.io/agents/start/testing/).

---

## 🐳 Docker Deployment

Build and run with Docker:

```bash
docker build -t v4c .
docker run -p 5173:5173 -p 8000:8000 v4c
```

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
npm run build
# Push to GitHub, Vercel auto-deploys from main branch
```

The app is live at: **[https://v4c-mu.vercel.app](https://v4c-orpin.vercel.app/)**

### Backend
Deploy the Python agent to your hosting platform:
- Render
- Railway
- AWS Lambda
- Google Cloud Run
- Your own server

---

## 🔧 Configuration

### Tailwind CSS
Customize theme in `tailwind.config.ts`

### Components
Add/modify Shadcn components:
```bash
npx shadcn-ui@latest add [component-name]
```

### Database
Manage Supabase schema in the `supabase/` directory

---

## 🚨 Troubleshooting

**Port already in use?**
```bash
# Frontend (change port)
npm run dev -- --port 3000

# Backend (Vite uses 5173 by default)
```

**LiveKit connection issues?**
- Verify `LIVEKIT_URL` and API credentials
- Check LiveKit console for room/participant status

**Supabase authentication errors?**
- Confirm environment variables are set
- Check Supabase project settings

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript/Python best practices
- Run linters before committing: `npm run lint` & `uv run ruff check`
- Write tests for new features
- Use meaningful commit messages

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙋 Support & Feedback

- 📚 [LiveKit Documentation](https://docs.livekit.io)
- 💬 [LiveKit Community](https://slack.livekit.io)
- 🐛 [Report Issues](https://github.com/Vedanshsa/V4C/issues)
- 💡 [Discussions](https://github.com/Vedanshsa/V4C/discussions)

---

## 👨‍💻 Author

**Vedansh** - [@Vedanshsa](https://github.com/Vedanshsa)

---

## 🎉 Acknowledgments

- [LiveKit](https://livekit.io) - Voice AI infrastructure
- [Shadcn/UI](https://ui.shadcn.com) - Component library
- [Vercel](https://vercel.com) - Deployment platform
- [Supabase](https://supabase.com) - Backend as a service

---

<div align="center">
  <strong>⭐ If this project helps you, please consider giving it a star! ⭐</strong>
</div>
