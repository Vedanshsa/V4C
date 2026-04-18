<<<<<<< HEAD
<a href="https://livekit.io/">
  <img src="./.github/assets/livekit-mark.png" alt="LiveKit logo" width="100" height="100">
</a>

# LiveKit Agents Starter - Python

A complete starter project for building voice AI apps with [LiveKit Agents for Python](https://github.com/livekit/agents) and [LiveKit Cloud](https://cloud.livekit.io/).

The starter project includes:

- A simple voice AI assistant, ready for extension and customization
- A voice AI pipeline built on [LiveKit Inference](https://docs.livekit.io/agents/models/inference)
  with [models](https://docs.livekit.io/agents/models) from OpenAI, Cartesia, and Deepgram. More than 50 other model providers are supported, including [Realtime models](https://docs.livekit.io/agents/models/realtime)
- Eval suite based on the LiveKit Agents [testing & evaluation framework](https://docs.livekit.io/agents/start/testing/)
- [LiveKit Turn Detector](https://docs.livekit.io/agents/logic/turns/turn-detector/) for contextually-aware speaker detection, with multilingual support
- [Background voice cancellation](https://docs.livekit.io/transport/media/noise-cancellation/)
- Deep session insights from LiveKit [Agent Observability](https://docs.livekit.io/deploy/observability/)
- A Dockerfile ready for [production deployment to LiveKit Cloud](https://docs.livekit.io/deploy/agents/)

This starter app is compatible with any [custom web/mobile frontend](https://docs.livekit.io/frontends/) or [telephony](https://docs.livekit.io/telephony/).

## Using coding agents

This project is designed to work with coding agents like [Claude Code](https://claude.com/product/claude-code), [Cursor](https://www.cursor.com/), and [Codex](https://openai.com/codex/).

For your convenience, LiveKit offers both a CLI and an [MCP server](https://docs.livekit.io/reference/developer-tools/docs-mcp/) that can be used to browse and search its documentation. The [LiveKit CLI](https://docs.livekit.io/intro/basics/cli/) (`lk docs`) works with any coding agent that can run shell commands. Install it for your platform:

**macOS:**

```console
brew install livekit-cli
```

**Linux:**

```console
curl -sSL https://get.livekit.io/cli | bash
```

**Windows:**

```console
winget install LiveKit.LiveKitCLI
```

The `lk docs` subcommand requires version 2.15.0 or higher. Check your version with `lk --version` and update if needed. Once installed, your coding agent can search and browse LiveKit documentation directly from the terminal:

```console
lk docs search "voice agents"
lk docs get-page /agents/start/voice-ai-quickstart
```

See the [Using coding agents](https://docs.livekit.io/intro/coding-agents/) guide for more details, including MCP server setup.

The project includes a complete [AGENTS.md](AGENTS.md) file for these assistants. You can modify this file to suit your needs. To learn more about this file, see [https://agents.md](https://agents.md).

## Dev Setup

Create a project from this template with the LiveKit CLI (recommended):

```bash
lk cloud auth
lk agent init my-agent --template agent-starter-python
```

The CLI clones the template and configures your environment. Then follow the rest of this guide from [Run the agent](#run-the-agent).

<details>
<summary>Alternative: Manual setup without the CLI</summary>

Clone the repository and install dependencies to a virtual environment:

```console
cd agent-starter-python
uv sync
```

Sign up for [LiveKit Cloud](https://cloud.livekit.io/) then set up the environment by copying `.env.example` to `.env.local` and filling in the required keys:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

You can load the LiveKit environment automatically using the [LiveKit CLI](https://docs.livekit.io/intro/basics/cli/):

```bash
lk cloud auth
lk app env -w -d .env.local
```

</details>

## Run the agent

Before your first run, you must download certain models such as [Silero VAD](https://docs.livekit.io/agents/logic/turns/vad/) and the [LiveKit turn detector](https://docs.livekit.io/agents/logic/turns/turn-detector/):

```console
uv run python src/agent.py download-files
```

Next, run this command to speak to your agent directly in your terminal:

```console
uv run python src/agent.py console
```

To run the agent for use with a frontend or telephony, use the `dev` command:

```console
uv run python src/agent.py dev
```

In production, use the `start` command:

```console
uv run python src/agent.py start
```

## Frontend & Telephony

Get started quickly with our pre-built frontend starter apps, or add telephony support:

| Platform | Link | Description |
|----------|----------|-------------|
| **Web** | [`livekit-examples/agent-starter-react`](https://github.com/livekit-examples/agent-starter-react) | Web voice AI assistant with React & Next.js |
| **iOS/macOS** | [`livekit-examples/agent-starter-swift`](https://github.com/livekit-examples/agent-starter-swift) | Native iOS, macOS, and visionOS voice AI assistant |
| **Flutter** | [`livekit-examples/agent-starter-flutter`](https://github.com/livekit-examples/agent-starter-flutter) | Cross-platform voice AI assistant app |
| **React Native** | [`livekit-examples/voice-assistant-react-native`](https://github.com/livekit-examples/voice-assistant-react-native) | Native mobile app with React Native & Expo |
| **Android** | [`livekit-examples/agent-starter-android`](https://github.com/livekit-examples/agent-starter-android) | Native Android app with Kotlin & Jetpack Compose |
| **Web Embed** | [`livekit-examples/agent-starter-embed`](https://github.com/livekit-examples/agent-starter-embed) | Voice AI widget for any website |
| **Telephony** | [Documentation](https://docs.livekit.io/telephony/) | Add inbound or outbound calling to your agent |

For advanced customization, see the [complete frontend guide](https://docs.livekit.io/frontends/).

## Tests and evals

This project includes a complete suite of evals, based on the LiveKit Agents [testing & evaluation framework](https://docs.livekit.io/agents/start/testing/). To run them, use `pytest`.

```console
uv run pytest
```

## Using this template repo for your own project

Once you've started your own project based on this repo, you should:

1. **Check in your `uv.lock`**: This file is currently untracked for the template, but you should commit it to your repository for reproducible builds and proper configuration management. (The same applies to `livekit.toml`, if you run your agents in LiveKit Cloud)

2. **Remove the git tracking test**: Delete the "Check files not tracked in git" step from `.github/workflows/tests.yml` since you'll now want this file to be tracked. These are just there for development purposes in the template repo itself.

3. **Add your own repository secrets**: You must [add secrets](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-what-your-workflow-does/using-secrets-in-github-actions) for `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` so that the tests can run in CI.

## Deploying to production

This project is production-ready and includes a working `Dockerfile`. To deploy it to LiveKit Cloud or another environment, see the [deploying to production](https://docs.livekit.io/deploy/agents/) guide.

## Self-hosted LiveKit

You can also self-host LiveKit instead of using LiveKit Cloud. See the [self-hosting](https://docs.livekit.io/transport/self-hosting/local/) guide for more information. If you choose to self-host, you'll need to also use [model plugins](https://docs.livekit.io/agents/models/#plugins) instead of LiveKit Inference and will need to remove the [LiveKit Cloud noise cancellation](https://docs.livekit.io/transport/media/noise-cancellation/) plugin.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
=======
# V4C ⚡

> A modern, full-stack web application built with React 18, TypeScript, and a best-in-class toolchain — featuring 3D graphics, real-time data, and a polished accessible UI.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-v4c--mu.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://v4c-mu.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Commands](#development-commands)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

V4C is a production-grade React TypeScript application that combines cutting-edge frontend technologies to deliver a seamless, accessible, and visually rich user experience. It leverages real-time database capabilities through Supabase, immersive 3D rendering via Three.js, and a fully type-safe development workflow throughout.

---

## 🚀 Live Demo

👉 **[https://v4c-mu.vercel.app](v4c-orpin.vercel.app)**

Deployed on Vercel with automatic CI/CD from the main branch.

---

## ✨ Key Features

- **Modern React + TypeScript** — Strict type safety across the entire codebase
- **3D Graphics** — Immersive rendering with Three.js and React Three Fiber
- **Real-Time Database** — Live data sync powered by Supabase
- **Accessible UI** — WCAG-compliant components via Radix UI primitives and shadcn/ui
- **Responsive Design** — Mobile-first layouts with Tailwind CSS
- **Type-Safe Forms** — Schema validation using React Hook Form + Zod
- **Smooth Animations** — Polished transitions and motion with Framer Motion
- **Global State** — Lightweight, scalable state management via Zustand
- **Smart Data Fetching** — Caching, loading states, and sync with TanStack React Query
- **Tested & Linted** — Vitest, React Testing Library, and ESLint baked in from day one

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     React 18 Application                     │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │   Routing   │  │    State    │  │   Data Fetching     │  │   │
│  │  │React Router │  │   Zustand   │  │  TanStack Query     │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │                   UI Layer                          │    │   │
│  │  │  shadcn/ui  ──  Radix UI  ──  Tailwind CSS          │    │   │
│  │  │  Framer Motion (animations)                         │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │                   3D Layer                          │    │   │
│  │  │  React Three Fiber  ──  Three.js                    │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │                   Form Layer                        │    │   │
│  │  │  React Hook Form  ──  Zod validation                │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │  HTTPS / WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          VERCEL (CDN / Edge)                        │
│             Static Assets  ──  Edge Functions  ──  CDN              │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (Backend)                          │
│                                                                     │
│   ┌──────────────┐   ┌──────────────┐   ┌───────────────────────┐  │
│   │  PostgreSQL  │   │  Auth (JWT)  │   │   Realtime Engine     │  │
│   │   Database   │   │              │   │  (WebSocket / pgRPC)  │  │
│   └──────────────┘   └──────────────┘   └───────────────────────┘  │
│                                                                     │
│   ┌──────────────┐   ┌──────────────┐                              │
│   │   Storage    │   │  Auto REST   │                              │
│   │  (Buckets)   │   │     API      │                              │
│   └──────────────┘   └──────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Interaction
      │
      ▼
React Component
      │
      ├──► Zustand Store (global/shared state)
      │
      ├──► TanStack Query (server state, caching, sync)
      │         │
      │         ▼
      │    Supabase Client ──► PostgreSQL / Realtime
      │
      └──► React Hook Form + Zod (local form state & validation)
```

---

## 🛠️ Technology Stack

| Category           | Technology                          | Purpose                            |
|--------------------|-------------------------------------|------------------------------------|
| Language           | TypeScript 5.x                      | Type safety across the codebase    |
| Framework          | React 18.3                          | Core UI framework                  |
| Build Tool         | Vite                                | Fast dev server & bundler          |
| Styling            | Tailwind CSS + PostCSS              | Utility-first responsive design    |
| UI Components      | shadcn/ui + Radix UI                | Accessible component primitives    |
| 3D Rendering       | Three.js + React Three Fiber        | 3D scenes and WebGL rendering      |
| Animations         | Framer Motion                       | Declarative UI animations          |
| State Management   | Zustand                             | Lightweight global state           |
| Data Fetching      | TanStack React Query                | Server state, caching & sync       |
| Routing            | React Router DOM                    | Client-side navigation             |
| Forms              | React Hook Form + Zod               | Validation and form management     |
| Database           | Supabase (PostgreSQL)               | Real-time backend & auth           |
| Deployment         | Vercel                              | CI/CD and global CDN hosting       |
| Testing            | Vitest + React Testing Library      | Unit and component tests           |
| Linting            | ESLint                              | Code quality enforcement           |
| Package Manager    | npm / Bun                           | Dependency management              |

---

## 📦 Prerequisites

Make sure you have the following installed before getting started:

- **Node.js** `>= 18.0.0` — [Download](https://nodejs.org/)
- **npm** `>= 9.0.0` or **Bun** `>= 1.0.0` — [Bun Download](https://bun.sh/)
- A **Supabase** account and project — [supabase.com](https://supabase.com/)
- **Git** — [Download](https://git-scm.com/)

---

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/v4c.git
cd v4c
```

### 2. Install dependencies

Using npm:
```bash
npm install
```

Or using Bun (faster):
```bash
bun install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Then fill in your values in `.env.local` (see [Environment Variables](#environment-variables)).

### 4. Start the development server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 💻 Development Commands

| Command            | npm                   | Bun                  | Description                          |
|--------------------|-----------------------|----------------------|--------------------------------------|
| Start dev server   | `npm run dev`         | `bun dev`            | Starts Vite dev server on port 5173  |
| Production build   | `npm run build`       | `bun run build`      | Compiles and bundles for production  |
| Preview build      | `npm run preview`     | `bun run preview`    | Serves the production build locally  |
| Run tests          | `npm run test`        | `bun test`           | Runs Vitest test suite               |
| Tests (watch mode) | `npm run test:watch`  | `bun test --watch`   | Runs tests in interactive watch mode |
| Lint               | `npm run lint`        | `bun run lint`       | Runs ESLint on the codebase          |
| Type check         | `npm run typecheck`   | `bun run typecheck`  | Runs the TypeScript compiler check   |

---

## 📁 Project Structure

```
v4c/
├── public/                   # Static assets (favicons, images, fonts)
│
├── src/
│   ├── assets/               # Imported assets (SVGs, images)
│   ├── components/
│   │   ├── ui/               # shadcn/ui base components (Button, Input, etc.)
│   │   ├── layout/           # App layout components (Navbar, Sidebar, Footer)
│   │   ├── 3d/               # Three.js / R3F scene components
│   │   └── features/         # Feature-specific composite components
│   │
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client configuration
│   │   ├── utils.ts          # Shared utility functions
│   │   └── validations/      # Zod schemas
│   │
│   ├── pages/                # Route-level page components
│   ├── routes/               # React Router configuration
│   ├── store/                # Zustand global state stores
│   ├── services/             # API and data-fetching service layer
│   ├── types/                # Global TypeScript types and interfaces
│   │
│   ├── App.tsx               # Root application component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles + Tailwind directives
│
├── tests/                    # Test files (mirrors src/ structure)
│
├── .env.example              # Example environment variables
├── .eslintrc.json            # ESLint configuration
├── components.json           # shadcn/ui configuration
├── index.html                # HTML entry point
├── postcss.config.js         # PostCSS + Tailwind config
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── vitest.config.ts          # Vitest test configuration
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root. Below are the required variables:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# App (optional)
VITE_APP_NAME=V4C
VITE_APP_URL=http://localhost:5173
```

> ⚠️ **Never commit `.env.local` or any file containing real secrets to version control.**
> All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser.

---

## 🤝 Contributing

Contributions are warmly welcomed! Whether it's a bug fix, a new feature, or an improvement to the docs — every PR counts.

### Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/v4c.git
   ```
3. **Create a branch** for your change:
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. **Make your changes**, following the code style guidelines below
5. **Run tests and lint** to verify everything is healthy:
   ```bash
   npm run lint && npm run test
   ```
6. **Commit** using a clear, descriptive message:
   ```bash
   git commit -m "feat: add 3D orbit controls to scene viewer"
   ```
7. **Push** to your fork and open a **Pull Request** against `main`

### Code Style Guidelines

- Follow the existing TypeScript and ESLint configuration
- Prefer named exports over default exports for components
- Co-locate component tests alongside the component file (`Component.test.tsx`)
- Use Zod schemas for all external data validation
- Keep components small, focused, and composable
- Document non-obvious logic with inline comments

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix     | When to use                              |
|------------|------------------------------------------|
| `feat:`    | A new feature                            |
| `fix:`     | A bug fix                                |
| `docs:`    | Documentation changes only               |
| `style:`   | Formatting, no logic change              |
| `refactor:`| Code change that's neither fix nor feat  |
| `test:`    | Adding or updating tests                 |
| `chore:`   | Build process or tooling changes         |

### Reporting Issues

If you find a bug or want to request a feature, please [open an issue](https://github.com/your-username/v4c/issues) with as much detail as possible, including steps to reproduce, expected behaviour, and screenshots if applicable.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for full details.

```
MIT License

Copyright (c) 2024 V4C Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

**Built with ❤️ by the V4C team**

[Live Demo](https://v4c-mu.vercel.app) · [Report Bug](https://github.com/your-username/v4c/issues) · [Request Feature](https://github.com/your-username/v4c/issues)

</div>
>>>>>>> 9c7dba34decd0f4d375632f1c30c9d139a17080b
