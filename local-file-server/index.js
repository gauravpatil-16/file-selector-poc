// ============================================
// local-file-server/index.js
// Serves your project files via REST API
// ============================================

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

// ⚠️ IMPORTANT: Change this to your actual project path
// For testing, we point to our dummy test-project
const PROJECT_ROOT = path.resolve(__dirname, "../test-project");

// Files/folders to ignore
const IGNORE_LIST = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".env",
  ".DS_Store",
  "package-lock.json",
  "yarn.lock",
];

function shouldIgnore(name) {
  return IGNORE_LIST.some(
    (ignored) => name === ignored || name.startsWith(".")
  );
}

// ────────────────────────────────────────────
// ENDPOINT 1: GET /files
// Returns flat list of all file paths
// ────────────────────────────────────────────
function getAllFiles(dir, basePath = "") {
  let results = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (shouldIgnore(entry.name)) continue;

      const relativePath = path.join(basePath, entry.name);
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        results = results.concat(getAllFiles(fullPath, relativePath));
      } else {
        results.push(relativePath);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }

  return results;
}

app.get("/files", (req, res) => {
  console.log("📂 GET /files - Listing all files");

  try {
    const files = getAllFiles(PROJECT_ROOT);
    console.log(`   Found ${files.length} files`);
    res.json({ files, count: files.length });
  } catch (err) {
    console.error("   Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────
// ENDPOINT 2: POST /files/read
// Reads content of specified files
// Body: { "files": ["src/App.jsx", "src/components/Navbar.jsx"] }
// ────────────────────────────────────────────
app.use(express.json());

app.post("/files/read", (req, res) => {
  const { files } = req.body;
  console.log(`📖 POST /files/read - Reading ${files?.length || 0} files`);

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: "Provide an array of file paths in 'files'" });
  }

  const results = files.map((filePath) => {
    // Normalize the path
    const normalizedPath = path.normalize(filePath);
    const fullPath = path.join(PROJECT_ROOT, normalizedPath);

    // Security: prevent path traversal attacks
    if (!fullPath.startsWith(PROJECT_ROOT)) {
      console.log(`   ⚠️ Blocked path traversal attempt: ${filePath}`);
      return { path: filePath, error: "Access denied" };
    }

    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      console.log(`   ✅ Read: ${filePath} (${content.length} chars)`);
      return { path: filePath, content };
    } catch (err) {
      console.log(`   ❌ Not found: ${filePath}`);
      return { path: filePath, error: "File not found" };
    }
  });

  res.json({ files: results });
});

// ────────────────────────────────────────────
// ENDPOINT 3: GET /health
// Simple health check
// ────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    projectRoot: PROJECT_ROOT,
    timestamp: new Date().toISOString(),
  });
});

// ────────────────────────────────────────────
// Start server
// ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ================================`);
  console.log(`   File Server running!`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Project: ${PROJECT_ROOT}`);
  console.log(`   ================================\n`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /files       - List all files`);
  console.log(`   POST /files/read  - Read file contents`);
  console.log(`   GET  /health      - Health check\n`);
});