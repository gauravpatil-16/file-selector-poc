# MCP File Selector POC

AI-powered intelligent file selection for code changes. Built with Cloudflare Workers, xAI (Grok), and Ngrok.

## How It Works

```
User Query ("Add dark mode to navbar")
        │
        ▼
Cloudflare Worker (MCP Orchestrator)
        │
        ├──→ Calls xAI (Grok) with tool definitions
        │         │
        │         ├── AI calls list_files → gets project file tree
        │         ├── AI calls read_files → reads relevant files
        │         ├── AI calls read_files → reads more files (imports, deps)
        │         └── AI finalizes → outputs selected files
        │
        └──→ Calls Local File Server (via Ngrok tunnel)
                  │
                  └── Serves files from your local codebase
```

The AI agent loops autonomously — it decides when to list files, which files to read, and when it has enough context to finalize. No fixed passes.

## Architecture

```
┌─────────────┐     HTTPS      ┌────────────────────┐     HTTPS     ┌──────────┐
│  Frontend /  │ ──────────────→│  Cloudflare Worker  │ ────────────→│  xAI API │
│  curl / App  │                │  (Orchestrator)     │←────────────│  (Grok)  │
└─────────────┘                └────────┬───────────┘              └──────────┘
                                        │
                                        │ HTTPS (Ngrok Tunnel)
                                        ▼
                               ┌─────────────────┐
                               │  Local File      │
                               │  Server (Express)│
                               │  localhost:3001   │
                               └─────────────────┘
```

## Prerequisites

- **Node.js** v18+ → https://nodejs.org
- **Ngrok CLI** → https://ngrok.com/download
- **Cloudflare account** (free) → https://dash.cloudflare.com/sign-up
- **xAI API key** (Grok) → https://console.x.ai

---

## Setup (One-Time)

### 1. Install Ngrok (Windows)

```powershell
# Download and extract
Invoke-WebRequest -Uri "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip" -OutFile "$env:USERPROFILE\Downloads\ngrok.zip"
New-Item -ItemType Directory -Force -Path "C:\ngrok"
Expand-Archive -Path "$env:USERPROFILE\Downloads\ngrok.zip" -DestinationPath "C:\ngrok" -Force

# Add to PATH
$env:PATH += ";C:\ngrok"
[Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\ngrok", [EnvironmentVariableTarget]::User)

# Verify
ngrok version

# Add your auth token (get from https://dashboard.ngrok.com/get-started/your-authtoken)
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

### 2. Install Wrangler (Cloudflare CLI)

```powershell
npm install -g wrangler
wrangler login
# → Opens browser to authorize
```

### 3. Create Project Structure

```powershell
mkdir mcp-file-selector-poc
cd mcp-file-selector-poc
mkdir local-file-server
mkdir cloudflare-worker
mkdir test-project
```

### 4. Create Dummy Test Project

```powershell
# Create folders
mkdir -p test-project/src/components
mkdir -p test-project/src/pages
mkdir -p test-project/src/utils
mkdir -p test-project/src/styles
```

> **Note:** On Windows, if `mkdir -p` doesn't work, create each folder individually:
> ```powershell
> mkdir test-project\src\components
> mkdir test-project\src\pages
> mkdir test-project\src\utils
> mkdir test-project\src\styles
> ```

Then create these files inside `test-project/`:

<details>
<summary><b>Click to see all test project files</b></summary>

**test-project/package.json**
```json
{
  "name": "my-web-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.0.0"
  }
}
```

**test-project/src/App.jsx**
```jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
```

**test-project/src/components/Navbar.jsx**
```jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">MyApp</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
```

**test-project/src/components/Footer.jsx**
```jsx
import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <p>© 2025 MyApp. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
```

**test-project/src/components/Button.jsx**
```jsx
import React from "react";

function Button({ children, onClick, variant = "primary" }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
```

**test-project/src/pages/Home.jsx**
```jsx
import React from "react";
import Button from "../components/Button";
import { formatDate } from "../utils/helpers";

function Home() {
  return (
    <div className="page home">
      <h1>Welcome to MyApp</h1>
      <p>Today is {formatDate(new Date())}</p>
      <Button onClick={() => alert("Clicked!")}>Get Started</Button>
    </div>
  );
}

export default Home;
```

**test-project/src/pages/About.jsx**
```jsx
import React from "react";

function About() {
  return (
    <div className="page about">
      <h1>About Us</h1>
      <p>We are a team of developers building amazing things.</p>
    </div>
  );
}

export default About;
```

**test-project/src/pages/Login.jsx**
```jsx
import React, { useState } from "react";
import Button from "../components/Button";
import { validateEmail } from "../utils/helpers";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      alert("Invalid email");
      return;
    }
    console.log("Logging in...", { email, password });
  };

  return (
    <div className="page login">
      <h1>Login</h1>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <Button onClick={handleSubmit}>Login</Button>
    </div>
  );
}

export default Login;
```

**test-project/src/utils/helpers.js**
```js
export function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

**test-project/src/styles/navbar.css**
```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #1a1a2e;
  color: white;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 1.5rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
}
```

**test-project/src/styles/global.css**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f5f5f5;
  color: #333;
}

.page {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}
```
</details>

### 5. Setup Local File Server

```powershell
cd local-file-server
npm init -y
npm install express
```

Create `local-file-server/index.js` — (see source file in repo)

### 6. Setup Cloudflare Worker

```powershell
cd ../cloudflare-worker
npm init -y
mkdir src
```

Create `cloudflare-worker/wrangler.toml`:
```toml
name = "mcp-file-selector"
main = "src/index.js"
compatibility_date = "2024-12-01"
```

Create `cloudflare-worker/src/index.js` — (see source file in repo)

Set your xAI API key:
```powershell
wrangler secret put XAI_API_KEY
# → Paste your key from https://console.x.ai
```

Deploy:
```powershell
wrangler deploy
# → Note the worker URL: https://mcp-file-selector.YOUR-SUBDOMAIN.workers.dev
```

---

## Running (Every Time)

You need **3 terminals** running simultaneously.

### Terminal 1: Start Local File Server

```powershell
cd C:\Users\Gaurav\Test\mcp-file-selector-poc\local-file-server
node index.js
```

Expected output:
```
🚀 ================================
   File Server running!
   URL: http://localhost:3001
   Project: C:\Users\Gaurav\Test\mcp-file-selector-poc\test-project
   ================================
```

### Terminal 2: Start Ngrok Tunnel

```powershell
# If ngrok is not in PATH in this terminal:
$env:PATH += ";C:\ngrok"

ngrok http 3001
```

Expected output:
```
Forwarding    https://xxxx-xxxx.ngrok-free.app -> http://localhost:3001
```

> **Copy the `https://....ngrok-free.app` URL** — you'll need it.

### Terminal 3: Test & Use

#### Verify local server:
```powershell
(Invoke-WebRequest -Uri "http://localhost:3001/health").Content
```

#### Verify ngrok tunnel:
```powershell
(Invoke-WebRequest -Uri "https://YOUR-NGROK-URL.ngrok-free.app/files" -Headers @{"ngrok-skip-browser-warning"="true"}).Content
```

#### Verify Cloudflare Worker:
```powershell
(Invoke-WebRequest -Uri "https://mcp-file-selector.YOUR-SUBDOMAIN.workers.dev/health").Content
```

#### Run File Selection:
```powershell
$body = @{
    query = "Add a dark mode toggle to the navbar"
    ngrokUrl = "https://YOUR-NGROK-URL.ngrok-free.app"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://mcp-file-selector.YOUR-SUBDOMAIN.workers.dev/api/select-files" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

---

## Test Examples

### Example 1: Dark Mode
```powershell
$body = @{ query = "Add a dark mode toggle to the navbar"; ngrokUrl = "https://YOUR-NGROK-URL.ngrok-free.app" } | ConvertTo-Json
(Invoke-WebRequest -Uri "https://YOUR-WORKER-URL.workers.dev/api/select-files" -Method POST -ContentType "application/json" -Body $body).Content
```

### Example 2: Login Validation
```powershell
$body = @{ query = "Add password strength validation to the login page"; ngrokUrl = "https://YOUR-NGROK-URL.ngrok-free.app" } | ConvertTo-Json
(Invoke-WebRequest -Uri "https://YOUR-WORKER-URL.workers.dev/api/select-files" -Method POST -ContentType "application/json" -Body $body).Content
```

### Example 3: New Page
```powershell
$body = @{ query = "Add a new Contact Us page with a form"; ngrokUrl = "https://YOUR-NGROK-URL.ngrok-free.app" } | ConvertTo-Json
(Invoke-WebRequest -Uri "https://YOUR-WORKER-URL.workers.dev/api/select-files" -Method POST -ContentType "application/json" -Body $body).Content
```

---

## API Reference

### POST /api/select-files

**Request:**
```json
{
  "query": "Description of the change you want to make",
  "ngrokUrl": "https://your-ngrok-url.ngrok-free.app"
}
```

**Response:**
```json
{
  "success": true,
  "query": "Add a dark mode toggle to the navbar",
  "finalFiles": [
    "src/components/Navbar.jsx",
    "src/styles/navbar.css",
    "src/App.jsx"
  ],
  "reasoning": "Navbar.jsx needs the toggle button, navbar.css needs dark mode styles, App.jsx needs theme state management",
  "iterations": 4,
  "toolCalls": [
    { "tool": "list_files", "result": "10 files" },
    { "tool": "read_files", "files": ["src/components/Navbar.jsx", "src/App.jsx"] },
    { "tool": "read_files", "files": ["src/styles/navbar.css"] }
  ],
  "logs": ["...step by step logs..."]
}
```

### GET /health

Returns `{ "status": "ok", "service": "mcp-file-selector" }`

---

## Local File Server Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/files` | List all project files |
| POST | `/files/read` | Read content of specific files |
| GET | `/health` | Health check |

**POST /files/read body:**
```json
{
  "files": ["src/App.jsx", "src/components/Navbar.jsx"]
}
```

---

## Folder Structure

```
mcp-file-selector-poc/
├── README.md
├── local-file-server/
│   ├── package.json
│   ├── node_modules/
│   └── index.js                ← Express server serving project files
├── cloudflare-worker/
│   ├── package.json
│   ├── wrangler.toml           ← Cloudflare config
│   └── src/
│       └── index.js            ← MCP orchestrator with agentic tool loop
├── test-project/               ← Sample project (replace with your own)
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   └── Button.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── About.jsx
│       │   └── Login.jsx
│       ├── utils/
│       │   └── helpers.js
│       └── styles/
│           ├── navbar.css
│           └── global.css
└── test-frontend.html          ← Optional browser UI for testing
```

---

## Using Your Own Project

To point to a real project instead of the dummy one, edit `local-file-server/index.js`:

```js
// Change this line:
const PROJECT_ROOT = path.resolve(__dirname, "../test-project");

// To your actual project path:
const PROJECT_ROOT = path.resolve("C:/Users/Gaurav/Projects/my-real-app");
```

Then restart the file server.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ngrok` not recognized | Run `$env:PATH += ";C:\ngrok"` in current terminal |
| Port 3001 already in use | Another server is running. Kill it: `Stop-Process -Name node -Force` |
| Ngrok URL shows "offline" | Make sure local file server (Terminal 1) is running |
| xAI API error | Check your API key: `wrangler secret put XAI_API_KEY` |
| Worker returns 500 | Check logs: `wrangler tail` (shows live logs) |
| CORS errors in browser | Worker already has CORS headers. Check browser console for details |
| Ngrok free plan warning page | We add `ngrok-skip-browser-warning: true` header automatically |

---

## Tech Stack

- **Orchestrator:** Cloudflare Workers (serverless, edge)
- **AI:** xAI Grok API (tool calling, agentic loop)
- **File Server:** Express.js (local)
- **Tunnel:** Ngrok (local → public HTTPS)

---

## License

MIT
