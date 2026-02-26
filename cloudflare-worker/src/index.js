// ============================================
// cloudflare-worker/src/index.js
// MCP Orchestrator - Agentic Tool Loop
// Supports model selection + full cost/token tracking
// ============================================

// ────────────────────────────────────────────
// AVAILABLE MODELS & PRICING (per million tokens)
// Source: https://docs.x.ai/developers/models
// ────────────────────────────────────────────
const MODELS = {
  "grok-4-1-fast-reasoning": {
    name: "Grok 4.1 Fast (Reasoning)",
    input: 0.2,
    output: 0.5,
    cachedInput: 0.05,
    context: 2097152,
  },
  "grok-4-1-fast-non-reasoning": {
    name: "Grok 4.1 Fast (Non-Reasoning)",
    input: 0.2,
    output: 0.5,
    cachedInput: 0.05,
    context: 2097152,
  },
  "grok-code-fast-1": {
    name: "Grok Code Fast 1",
    input: 0.2,
    output: 1.5,
    cachedInput: 0.02,
    context: 262144,
  },
  "grok-4-fast-reasoning": {
    name: "Grok 4 Fast (Reasoning)",
    input: 0.2,
    output: 0.5,
    cachedInput: 0.05,
    context: 2097152,
  },
  "grok-4-fast-non-reasoning": {
    name: "Grok 4 Fast (Non-Reasoning)",
    input: 0.2,
    output: 0.5,
    cachedInput: 0.05,
    context: 2097152,
  },
  "grok-4-0709": {
    name: "Grok 4 (0709)",
    input: 3.0,
    output: 15.0,
    cachedInput: 0.75,
    context: 262144,
  },
  "grok-3-mini": {
    name: "Grok 3 Mini",
    input: 0.3,
    output: 0.5,
    cachedInput: 0.075,
    context: 131072,
  },
  "grok-3": {
    name: "Grok 3",
    input: 3.0,
    output: 15.0,
    cachedInput: 0.75,
    context: 131072,
  },
};

const DEFAULT_MODEL = "grok-4-1-fast-reasoning";

// ────────────────────────────────────────────
// TOOL DEFINITIONS
// ────────────────────────────────────────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "list_files",
      description:
        "List all files in the project. Returns an array of file paths. Call this first to understand the project structure.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "read_files",
      description:
        "Read the content of one or more files. Use this to inspect file contents and understand code, imports, dependencies, etc. You can call this multiple times with different files.",
      parameters: {
        type: "object",
        properties: {
          files: {
            type: "array",
            items: { type: "string" },
            description:
              "Array of file paths to read (e.g. ['src/App.jsx', 'src/utils/helpers.js'])",
          },
        },
        required: ["files"],
      },
    },
  },
];

// ────────────────────────────────────────────
// SYSTEM PROMPT
// ────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert code analyst working as a file selector for an AI web application builder.

Your job: Given a user's change request, determine exactly which files need to be modified or referenced to implement that change.

## Tools Available:
1. **list_files** - Lists all files in the project.
2. **read_files** - Reads content of specific files.

You may use these tools as many times as needed, in any order, until you are confident in your answer. There is no fixed sequence — use your judgment based on the user's query to explore the codebase however makes sense. Sometimes you may need to list files first; other times you may already know what to read. You might need multiple rounds of reading to trace imports, shared components, utilities, styles, configs, types, or any other dependencies.

## What matters:
- Select every file that would need to be **modified, referenced, or understood** to correctly implement the user's request.
- Do not select files that aren't actually relevant.
- Trace dependencies thoroughly — follow imports, shared state, context providers, utility functions, type definitions, route configs, styles, and anything else that connects to the change.
- If reading a file reveals connections to other files you haven't checked yet, go read those too.
- Stop only when you're confident you have the complete picture.

## Final Answer:
Once you're done exploring, respond with EXACTLY this JSON and nothing else:
{
  "finalFiles": ["path/to/file1.jsx", "path/to/file2.js"],
  "reasoning": "Explanation of why each file was selected"
}`;

// ────────────────────────────────────────────
// WORKER ENTRY POINT
// ────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Health check
      if (url.pathname === "/health") {
        return jsonRes({ status: "ok", service: "mcp-file-selector" }, 200, corsHeaders);
      }

      // List available models
      if (url.pathname === "/api/models" && request.method === "GET") {
        const modelList = Object.entries(MODELS).map(([id, info]) => ({
          id,
          name: info.name,
          inputPricePerMillion: info.input,
          outputPricePerMillion: info.output,
          cachedInputPricePerMillion: info.cachedInput,
          contextWindow: info.context,
        }));
        return jsonRes({ models: modelList, default: DEFAULT_MODEL }, 200, corsHeaders);
      }

      // Main endpoint
      if (url.pathname === "/api/select-files" && request.method === "POST") {
        const { query, ngrokUrl, model } = await request.json();

        if (!query || !ngrokUrl) {
          return jsonRes({ error: "Missing 'query' and 'ngrokUrl'" }, 400, corsHeaders);
        }

        const selectedModel = model && MODELS[model] ? model : DEFAULT_MODEL;

        if (model && !MODELS[model]) {
          return jsonRes(
            {
              error: `Unknown model '${model}'. Use GET /api/models to see available models.`,
              availableModels: Object.keys(MODELS),
            },
            400,
            corsHeaders
          );
        }

        const result = await agentLoop(query, ngrokUrl, env.XAI_API_KEY, selectedModel);
        return jsonRes(result, 200, corsHeaders);
      }

      return jsonRes({ error: "Not found. Use POST /api/select-files or GET /api/models" }, 404, corsHeaders);
    } catch (err) {
      console.error("Worker error:", err);
      return jsonRes({ error: err.message }, 500, corsHeaders);
    }
  },
};

// ============================================
// COST CALCULATOR
// ============================================
function calculateCost(usage, modelId) {
  const pricing = MODELS[modelId];
  if (!usage || !pricing) return { inputCost: 0, outputCost: 0, cachedCost: 0, totalCost: 0 };

  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const cachedTokens = usage.prompt_tokens_details?.cached_tokens || 0;
  const totalTokens = usage.total_tokens || 0;

  // xAI may report prompt_tokens as non-cached only, or as total inclusive of cached.
  // To be safe, ensure non-cached is never negative.
  const nonCachedInput = Math.max(0, promptTokens - cachedTokens);

  const inputCost = (nonCachedInput / 1_000_000) * pricing.input;
  const cachedCost = (cachedTokens / 1_000_000) * pricing.cachedInput;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + cachedCost + outputCost;

  return {
    promptTokens,
    completionTokens,
    cachedTokens,
    nonCachedInputTokens: nonCachedInput,
    totalTokens,
    inputCost: +inputCost.toFixed(8),
    cachedCost: +cachedCost.toFixed(8),
    outputCost: +outputCost.toFixed(8),
    totalCost: +totalCost.toFixed(8),
  };
}

// ============================================
// AGENTIC LOOP
// ============================================
async function agentLoop(userQuery, ngrokUrl, xaiApiKey, modelId) {
  const logs = [];
  const log = (msg) => {
    console.log(msg);
    logs.push(msg);
  };

  const MAX_ITERATIONS = 15;
  let iteration = 0;
  const requestStartTime = Date.now();

  // Per-iteration metrics
  const iterations = [];

  // Totals
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCachedTokens = 0;
  let totalCost = 0;

  const modelInfo = MODELS[modelId];

  // Conversation history
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `User wants to make this change: "${userQuery}"\n\nPlease analyze the project and select all relevant files for this change. Start by listing the files.`,
    },
  ];

  const toolCalls = [];
  let finalResult = null;

  log(`🚀 Starting agentic file selection`);
  log(`   Query: "${userQuery}"`);
  log(`   Model: ${modelInfo.name} (${modelId})`);
  log(`   Pricing: ${modelInfo.input}/M input, ${modelInfo.output}/M output`);
  log(`   Cached pricing: ${modelInfo.cachedInput}/M`);

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    const iterStartTime = Date.now();

    log(`\n🔄 Iteration ${iteration}/${MAX_ITERATIONS}`);

    // Call xAI
    const response = await callXAI(messages, xaiApiKey, modelId);
    const iterEndTime = Date.now();
    const iterDuration = iterEndTime - iterStartTime;

    // Extract usage
    const usage = response.usage || {};
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const cachedTokens = usage.prompt_tokens_details?.cached_tokens || 0;
    const iterCost = calculateCost(usage, modelId);

    // Accumulate totals
    totalInputTokens += promptTokens;
    totalOutputTokens += completionTokens;
    totalCachedTokens += cachedTokens;
    totalCost += iterCost.totalCost;

    // Build iteration record
    const iterRecord = {
      iteration,
      durationMs: iterDuration,
      durationFormatted: `${(iterDuration / 1000).toFixed(2)}s`,
      tokens: {
        input: promptTokens,
        output: completionTokens,
        cached: cachedTokens,
        total: promptTokens + completionTokens,
      },
      cost: iterCost,
      toolsCalled: [],
    };

    log(`   ⏱️  Duration: ${iterRecord.durationFormatted}`);
    log(`   📊 Tokens — Input: ${promptTokens}, Output: ${completionTokens}, Cached: ${cachedTokens}`);
    log(`   💰 Cost: $${iterCost.totalCost.toFixed(6)}`);

    const assistantMessage = response.choices[0].message;
    messages.push(assistantMessage);

    // ── Case 1: AI is calling tools ──
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      for (const toolCall of assistantMessage.tool_calls) {
        const fnName = toolCall.function.name;
        const fnArgs = JSON.parse(toolCall.function.arguments || "{}");

        log(`   🔧 Tool: ${fnName}(${JSON.stringify(fnArgs)})`);
        iterRecord.toolsCalled.push({ tool: fnName, args: fnArgs });

        let toolResult;

        if (fnName === "list_files") {
          toolResult = await executeListFiles(ngrokUrl);
          log(`   📂 Listed ${toolResult.files.length} files`);
          toolCalls.push({ tool: "list_files", result: `${toolResult.files.length} files` });
        } else if (fnName === "read_files") {
          toolResult = await executeReadFiles(ngrokUrl, fnArgs.files || []);
          const ok = toolResult.files.filter((f) => !f.error).length;
          log(`   📖 Read ${ok}/${fnArgs.files.length} files: ${fnArgs.files.join(", ")}`);
          toolCalls.push({ tool: "read_files", files: fnArgs.files });
        } else {
          toolResult = { error: `Unknown tool: ${fnName}` };
          log(`   ❌ Unknown tool: ${fnName}`);
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }
    }
    // ── Case 2: AI is done ──
    else if (assistantMessage.content) {
      log(`\n💬 AI responded with text`);

      try {
        const content = assistantMessage.content;
        const jsonMatch = content.match(/\{[\s\S]*"finalFiles"[\s\S]*\}/);

        if (jsonMatch) {
          finalResult = JSON.parse(jsonMatch[0]);
          log(`✅ Final selection: ${finalResult.finalFiles.length} files`);
          log(`   Files: ${finalResult.finalFiles.join(", ")}`);
          iterations.push(iterRecord);
          break;
        } else {
          log(`   ⚠️ No JSON found, asking AI to finalize...`);
          messages.push({
            role: "user",
            content: "Please provide your final answer now as JSON with finalFiles array and reasoning.",
          });
        }
      } catch (parseErr) {
        log(`   ⚠️ Parse error: ${parseErr.message}`);
        messages.push({
          role: "user",
          content: 'Your response wasn\'t valid JSON. Please respond with ONLY: { "finalFiles": [...], "reasoning": "..." }',
        });
      }
    }

    iterations.push(iterRecord);
  }

  if (!finalResult) {
    log(`\n⚠️ Reached max iterations without final answer`);
    finalResult = { finalFiles: [], reasoning: "Agent did not converge within iteration limit." };
  }

  const totalDuration = Date.now() - requestStartTime;

  return {
    success: true,
    query: userQuery,

    // Model info
    model: {
      id: modelId,
      name: modelInfo.name,
      pricing: {
        inputPerMillion: modelInfo.input,
        outputPerMillion: modelInfo.output,
        cachedInputPerMillion: modelInfo.cachedInput,
      },
    },

    // Final result
    finalFiles: finalResult.finalFiles,
    reasoning: finalResult.reasoning,

    // Timing
    timing: {
      totalDurationMs: totalDuration,
      totalDurationFormatted: `${(totalDuration / 1000).toFixed(2)}s`,
      iterationCount: iterations.length,
    },

    // Token totals
    tokens: {
      totalInput: totalInputTokens,
      totalOutput: totalOutputTokens,
      totalCached: totalCachedTokens,
      grandTotal: totalInputTokens + totalOutputTokens,
    },

    // Cost totals
    cost: {
      totalInputCost: +iterations.reduce((s, i) => s + (i.cost?.inputCost || 0), 0).toFixed(8),
      totalCachedCost: +iterations.reduce((s, i) => s + (i.cost?.cachedCost || 0), 0).toFixed(8),
      totalOutputCost: +iterations.reduce((s, i) => s + (i.cost?.outputCost || 0), 0).toFixed(8),
      totalCost: +totalCost.toFixed(8),
      currency: "USD",
    },

    // Per-iteration breakdown
    iterations,

    // Tool calls summary
    toolCalls,

    // Logs
    logs,
  };
}

// ============================================
// LOCAL FILE SERVER API CALLS (via ngrok)
// ============================================
async function executeListFiles(ngrokUrl) {
  const res = await fetch(`${ngrokUrl}/files`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!res.ok) throw new Error(`list_files failed: ${res.status}`);
  return await res.json();
}

async function executeReadFiles(ngrokUrl, filePaths) {
  const res = await fetch(`${ngrokUrl}/files/read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ files: filePaths }),
  });
  if (!res.ok) throw new Error(`read_files failed: ${res.status}`);
  return await res.json();
}

// ============================================
// xAI (GROK) API CALL
// ============================================
async function callXAI(messages, xaiApiKey, modelId) {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${xaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`xAI API error: ${data.error.message}`);
  }

  return data;
}

// ============================================
// HELPERS
// ============================================
function jsonRes(data, status, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}