
# AETHER / ORCHESTRATE

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-3.4.0-D90429.svg)
![Stack](https://img.shields.io/badge/tech-React_19_•_TypeScript_•_Gemini_AI-000000.svg)

> **The Engine of Intelligence.**  
> A  platform for visually building, orchestrating, and deploying autonomous AI agent workflows.

---

## ✧ Overview

**Aether** is a visual IDE for Large Language Model (LLM) orchestration. Unlike traditional chat interfaces, Aether treats prompts as functions and context as immutable state. It allows architects to construct deterministic Directed Acyclic Graphs (DAGs) where nodes represent AI agents, triggers, or integrations.

The platform is designed with a **"Glass Engine"** aesthetic—utilizing deep blacks, kinetic typography, and complex glassmorphism to create a workspace that feels like a futuristic cockpit.

## ✧ Key Features

### 🧠 Visual DAG Builder
- **Drag-and-Drop Topology**: Construct complex chains using a physics-based node editor.
- **Type-Safe Handoffs**: Pass context (text, JSON, files) between nodes with strict schema validation.
- **Agent Library**: Pre-configured templates for Development, Sales, Marketing, and Operations.

### ⚡ Gemini Core
- **Multi-Model Orchestration**: Seamlessly switch between `gemini-2.5-flash` (for speed) and `gemini-3.0-pro` (for reasoning) within the same workflow.
- **Search Grounding**: Built-in support for Google Search integration for factual accuracy.

### 📂 Multi-Modal Context
- **PDF Parsing**: Drag and drop PDF documents directly into nodes. The system parses text client-side using `pdfjs-dist` to provide context to agents.
- **PDF Generation**: "Doc Generator" agents can output formatted PDF reports directly to the browser.

### 💾 Local State Persistence
- **No-Backend Storage**: Utilizes a robust `localStorage` database simulation.
- **User Sessions**: Workflows are automatically saved and tied to email addresses.
- **Guest-to-User Handoff**: Start building as a guest; your graph is preserved when you sign up.

### 📊 Observability & Metrics
- **Live Console**: Real-time execution logs with status indicators.
- **Dynamic Profile**: Stats (Compute usage, Vector storage, Cost) are calculated dynamically based on the complexity of your active graph.

---

## 🛠️ Tech Stack

*   **Framework**: React 19 (Hooks, Context API)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (Custom "Cherry/Cream" configuration)
*   **AI SDK**: `@google/genai`
*   **Icons**: Lucide React
*   **PDF Processing**: `pdfjs-dist`, `jspdf`

---

## 🚀 Getting Started

### Prerequisites

*   Node.js v18+
*   A Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/aether-orchestrate.git
    cd aether-orchestrate
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    # Required for AI generation
    API_KEY=your_google_gemini_api_key_here
    ```

4.  **Start the Development Server**
    ```bash
    npm start
    ```

---

## 🎨 Design System

Aether follows a strict design language defined in `index.html` (Tailwind config):

| Color Name | Hex | Usage |
| :--- | :--- | :--- |
| **Black** | `#000000` | Primary Background |
| **Cherry** | `#D90429` | Accents, Active States, Brand |
| **Cream** | `#F4F1EA` | Typography, Borders |
| **Glass** | `rgba(15,15,15,0.6)` | Panels, Modals |

**Typography**:
*   *Display*: Space Grotesk (Headings)
*   *Body*: Inter (UI Text)
*   *Accent*: Playfair Display (Italicized hero text)

---

## 📂 Project Structure

```
src/
├── components/
│   ├── Auth.tsx          # Login/Signup with session persistence
│   ├── Builder.tsx       # The core Node Graph editor
│   ├── Deployments.tsx   # Dashboard for active endpoints
│   ├── InfoPage.tsx      # Static content (Architecture, Docs, etc.)
│   ├── Landing.tsx       # Marketing homepage with scroll reveals
│   ├── Layout.tsx        # Global shell and navigation
│   └── Profile.tsx       # User stats and settings
├── services/
│   └── geminiService.ts  # Interface with Google GenAI SDK
├── types.ts              # TypeScript interfaces (Node, User, LogEntry)
├── App.tsx               # Routing and Data Layer (loadDB/saveDB)
└── index.tsx             # Entry point
```

---

## 🛡️ Architecture Note

**Current State**: This application runs primarily **Client-Side**.
*   The "Database" is a JSON object stored in the browser's LocalStorage.
*   AI calls are made directly from the browser to Google's API (using the key provided in build env).

**Production Roadmap**:
*   The `backend/` folder contains the reference implementation for a secure Node.js/Express gateway.
*   In a production environment, the `geminiService.ts` would point to this gateway rather than calling Google directly, ensuring API keys remain server-side.

---

## © License

Designed & Engineered in 2025.
MIT License.
