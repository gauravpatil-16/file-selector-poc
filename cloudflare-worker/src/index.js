// ============================================
// cloudflare-worker/src/index.js
// MCP Orchestrator - Runs on Cloudflare Workers
// ============================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers (allow requests from anywhere for POC)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ── Routes ──
    try {
      // Health check
      if (url.pathname === "/health") {
        return jsonRes({ status: "ok", service: "mcp-file-selector" }, 200, corsHeaders);
      }

      // Main endpoint
      if (url.pathname === "/api/select-files" && request.method === "POST") {
        const body = await request.json();
        const { query, ngrokUrl } = body;

        if (!query || !ngrokUrl) {
          return jsonRes(
            { error: "Missing required fields: 'query' and 'ngrokUrl'" },
            400,
            corsHeaders
          );
        }

        const result = await orchestrate(query, ngrokUrl, env.GROQ_API_KEY);
        return jsonRes(result, 200, corsHeaders);
      }

      return jsonRes({ error: "Not found. Use POST /api/select-files" }, 404, corsHeaders);
    } catch (err) {
      console.error("Worker error:", err);
      return jsonRes({ error: err.message, stack: err.stack }, 500, corsHeaders);
    }
  },
};

// ============================================
// MAIN ORCHESTRATION FLOW
// ============================================
async function orchestrate(userQuery, ngrokUrl, groqApiKey) {
  const logs = [];
  const log = (msg) => {
    console.log(msg);
    logs.push(msg);
  };

  // ── STEP 1: Fetch file list from local server ──
  log("📂 Step 1: Fetching file list from local server...");
  const fileList = await getFileList(ngrokUrl);
  log(`   ✅ Found ${fileList.length} files`);
  log(`   Files: ${fileList.join(", ")}`);

  // ── STEP 2: Ask AI to pick initial relevant files ──
  log("\n🤖 Step 2: AI selecting initial files...");
  const pass1 = await aiPass1_SelectFiles(userQuery, fileList, groqApiKey);
  log(`   ✅ AI selected ${pass1.selectedFiles.length} files`);
  log(`   Selected: ${pass1.selectedFiles.join(", ")}`);
  log(`   Reasoning: ${pass1.reasoning}`);

  // ── STEP 3: Read those files' content ──
  log("\n📖 Step 3: Reading selected files...");
  const fileContents = await readFiles(ngrokUrl, pass1.selectedFiles);
  const successfulReads = fileContents.filter((f) => !f.error);
  log(`   ✅ Successfully read ${successfulReads.length} files`);

  // ── STEP 4: AI refines — add missing files, remove irrelevant ones ──
  log("\n🔍 Step 4: AI refining selection...");
  const remainingFiles = fileList.filter(
    (f) => !pass1.selectedFiles.includes(f)
  );
  const pass2 = await aiPass2_Refine(
    userQuery,
    successfulReads,
    remainingFiles,
    groqApiKey
  );
  log(`   Files to ADD: ${pass2.add.length > 0 ? pass2.add.join(", ") : "none"}`);
  log(`   Files to REMOVE: ${pass2.remove.length > 0 ? pass2.remove.join(", ") : "none"}`);
  log(`   Reasoning: ${pass2.reasoning}`);

  // ── STEP 5: Read any newly added files ──
  let allContents = [...successfulReads];
  if (pass2.add.length > 0) {
    log("\n📖 Step 5: Reading additional files...");
    const additional = await readFiles(ngrokUrl, pass2.add);
    const successfulAdditional = additional.filter((f) => !f.error);
    allContents = [...allContents, ...successfulAdditional];
    log(`   ✅ Read ${successfulAdditional.length} additional files`);
  } else {
    log("\n⏭️  Step 5: No additional files to read");
  }

  // ── STEP 6: Build final list ──
  const removeSet = new Set(pass2.remove);
  const finalContents = allContents.filter((f) => !removeSet.has(f.path));
  const finalPaths = finalContents.map((f) => f.path);

  log(`\n✅ FINAL RESULT: ${finalPaths.length} files selected`);
  log(`   Final files: ${finalPaths.join(", ")}`);

  return {
    success: true,
    query: userQuery,
    steps: {
      allFiles: fileList,
      initialSelection: pass1.selectedFiles,
      initialReasoning: pass1.reasoning,
      refinement: {
        added: pass2.add,
        removed: pass2.remove,
        reasoning: pass2.reasoning,
      },
    },
    finalFiles: finalPaths,
    fileContents: finalContents,
    logs,
  };
}

// ============================================
// LOCAL FILE SERVER API CALLS (via ngrok)
// ============================================
async function getFileList(ngrokUrl) {
  const res = await fetch(`${ngrokUrl}/files`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch file list: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.files;
}

async function readFiles(ngrokUrl, filePaths) {
  const res = await fetch(`${ngrokUrl}/files/read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ files: filePaths }),
  });

  if (!res.ok) {
    throw new Error(`Failed to read files: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.files;
}

// ============================================
// GROQ AI CALLS
// ============================================
async function callGroq(messages, groqApiKey) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Groq API error: ${data.error.message}`);
  }

  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch {
    throw new Error(`Failed to parse Groq response as JSON: ${content}`);
  }
}

// ── AI Pass 1: Initial file selection from file list ──
async function aiPass1_SelectFiles(userQuery, fileList, groqApiKey) {
  const messages = [
    {
      role: "system",
      content: `You are an expert code analyst. Given a user's requested change and a project's file list, select the files most likely relevant to implement that change.

Think about:
- Which files directly relate to the feature/change
- Entry points, components, pages involved
- Config files if config changes are needed  
- Utility files that might be affected
- Style files if UI changes are needed
- Be thorough but not excessive (don't select everything)

You MUST respond with ONLY valid JSON in this exact format:
{
  "selectedFiles": ["path/to/file1.jsx", "path/to/file2.js"],
  "reasoning": "Brief explanation of why these files were selected"
}`,
    },
    {
      role: "user",
      content: `User wants to: "${userQuery}"

Here are all the files in the project:
${fileList.map((f) => `- ${f}`).join("\n")}

Select the relevant files for this change.`,
    },
  ];

  return await callGroq(messages, groqApiKey);
}

// ── AI Pass 2: Refine after reading file contents ──
async function aiPass2_Refine(userQuery, fileContents, otherFiles, groqApiKey) {
  const filesStr = fileContents
    .map((f) => `\n=== FILE: ${f.path} ===\n${f.content}\n`)
    .join("\n");

  const messages = [
    {
      role: "system",
      content: `You are an expert code analyst. You previously selected some files for a code change, and now you've read their contents. 

Based on what you see in the code (imports, references, dependencies), decide:
1. Are there files in the "other available files" list that should be ADDED? (e.g., imported modules, shared types, related components)
2. Are there currently selected files that should be REMOVED? (e.g., they turned out to be unrelated)

You MUST respond with ONLY valid JSON in this exact format:
{
  "add": ["path/to/new-file.js"],
  "remove": ["path/to/unneeded-file.js"],
  "reasoning": "Brief explanation"
}

Use empty arrays if no changes needed.`,
    },
    {
      role: "user",
      content: `User wants to: "${userQuery}"

Currently selected files and their content:
${filesStr}

Other available files NOT yet selected:
${otherFiles.map((f) => `- ${f}`).join("\n")}

Should any files be added or removed?`,
    },
  ];

  return await callGroq(messages, groqApiKey);
}

// ============================================
// HELPERS
// ============================================
function jsonRes(data, status, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}