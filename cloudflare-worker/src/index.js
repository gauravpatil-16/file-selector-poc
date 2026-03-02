// ============================================
// cloudflare-worker/src/index.js
// Flow: Files → Batched Parallel Declarative → AI
// ============================================

// ────────────────────────────────────────────
// MODELS & PRICING
// ────────────────────────────────────────────
const MODELS = {
  "grok-4-1-fast-reasoning": {
    name: "Grok 4.1 Fast (Reasoning)",
    input: 0.2, output: 0.5, cachedInput: 0.05, context: 2097152,
  },
  "grok-4-1-fast-non-reasoning": {
    name: "Grok 4.1 Fast (Non-Reasoning)",
    input: 0.2, output: 0.5, cachedInput: 0.05, context: 2097152,
  },
  "grok-code-fast-1": {
    name: "Grok Code Fast 1",
    input: 0.2, output: 1.5, cachedInput: 0.02, context: 262144,
  },
  "grok-4-fast-reasoning": {
    name: "Grok 4 Fast (Reasoning)",
    input: 0.2, output: 0.5, cachedInput: 0.05, context: 2097152,
  },
  "grok-4-fast-non-reasoning": {
    name: "Grok 4 Fast (Non-Reasoning)",
    input: 0.2, output: 0.5, cachedInput: 0.05, context: 2097152,
  },
  "grok-4-0709": {
    name: "Grok 4 (0709)",
    input: 3.0, output: 15.0, cachedInput: 0.75, context: 262144,
  },
  "grok-3-mini": {
    name: "Grok 3 Mini",
    input: 0.3, output: 0.5, cachedInput: 0.075, context: 131072,
  },
  "grok-3": {
    name: "Grok 3",
    input: 3.0, output: 15.0, cachedInput: 0.75, context: 131072,
  },
};

const DEFAULT_MODEL = "grok-4-1-fast-reasoning";
const BATCH_SIZE = 10;

// ────────────────────────────────────────────
// SYSTEM PROMPT
// ────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert code analyst working as a file selector for an AI web application builder.

Your job: Given a user's change request, determine exactly which files need to be modified or referenced to implement that change.

You will be provided with:
- User's change request
- All file paths in the project
- Metadata for each file (imports, internal functions/components — no actual code)

Analyze the user's query to understand what change is needed. Then use the file paths and metadata to identify which files are involved — check their imports, internal functions/components, and trace dependencies to build the complete picture.

## What matters:
- Select every file that would need to be modified, referenced, or understood to correctly implement the user's request.
- Do not select files that aren't actually relevant.
- Trace dependencies thoroughly — follow imports, shared state, context providers, utility functions, type definitions, route configs, and anything else that connects to the change.
- Stop only when you're confident you have the complete picture.

Select two categories of files:
- **modify**: Files that will be directly changed to implement the request.
- **reference**: Files that won't be modified but are needed as context — imported utilities, shared components, types, configs used by the modified files that are directly related to the modification.

## Final Answer:
Respond with EXACTLY this JSON and nothing else:
{
  "modify": ["path/to/file1.jsx", "path/to/file2.js"],
  "reference": ["path/to/dep1.js", "path/to/dep2.js"],
  "reasoning": "Explanation of why each file was selected"
}`;

// ────────────────────────────────────────────
// TOOL DEFINITIONS (fallback)
// ────────────────────────────────────────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "read_files",
      description: "Read multiple files by paths whenever necessary",
      parameters: {
        type: "object",
        properties: {
          relativePaths: {
            type: "array",
            items: { type: "string" },
            description: "File paths to read",
          },
        },
        required: ["relativePaths"],
      },
    },
  },
];

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
      if (url.pathname === "/health") {
        return jsonRes({ status: "ok", service: "mcp-file-selector" }, 200, corsHeaders);
      }

      if (url.pathname === "/api/models" && request.method === "GET") {
        const modelList = Object.entries(MODELS).map(([id, info]) => ({
          id, name: info.name,
          inputPricePerMillion: info.input,
          outputPricePerMillion: info.output,
          contextWindow: info.context,
        }));
        return jsonRes({ models: modelList, default: DEFAULT_MODEL }, 200, corsHeaders);
      }

      if (url.pathname === "/api/select-files" && request.method === "POST") {
        const { query, ngrokUrl, declarativeUrl, model } = await request.json();

        if (!query || !ngrokUrl || !declarativeUrl) {
          return jsonRes(
            { error: "Missing required fields: 'query', 'ngrokUrl', 'declarativeUrl'" },
            400, corsHeaders
          );
        }

        const selectedModel = model && MODELS[model] ? model : DEFAULT_MODEL;

        if (model && !MODELS[model]) {
          return jsonRes(
            { error: `Unknown model '${model}'.`, availableModels: Object.keys(MODELS) },
            400, corsHeaders
          );
        }

        const result = await orchestrate(query, ngrokUrl, declarativeUrl, env.XAI_API_KEY, selectedModel);
        return jsonRes(result, 200, corsHeaders);
      }

      return jsonRes({ error: "Not found." }, 404, corsHeaders);
    } catch (err) {
      console.error("Worker error:", err);
      return jsonRes({ error: err.message }, 500, corsHeaders);
    }
  },
};

// ============================================
// UTILITY: Split array into batches
// ============================================
function makeBatches(arr, size) {
  const batches = [];
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size));
  }
  return batches;
}

// ============================================
// MAIN ORCHESTRATION
// ============================================
async function orchestrate(userQuery, ngrokUrl, declarativeUrl, xaiApiKey, modelId) {
  const logs = [];
  const log = (msg) => { console.log(msg); logs.push(msg); };

  const orchestrationStart = Date.now();
  const modelInfo = MODELS[modelId];

  log(`🚀 Starting orchestration`);
  log(`   Query: "${userQuery}"`);
  log(`   Model: ${modelInfo.name} (${modelId})`);
  log(`   Batch size: ${BATCH_SIZE}`);

  // ── STEP 1: Get all file paths ──
  const step1Start = Date.now();
  log(`\n📂 Step 1: Fetching file list...`);

  const fileListRes = await fetch(`${ngrokUrl}/files`, {
    headers: { "ngrok-skip-browser-warning": "true" },
  });
  if (!fileListRes.ok) throw new Error(`Failed to fetch file list: ${fileListRes.status}`);
  const { files: allFilePaths } = await fileListRes.json();

  const step1Duration = Date.now() - step1Start;
  log(`   ✅ Found ${allFilePaths.length} files (${step1Duration}ms)`);

  // ── STEP 2: Read all file contents ──
  const step2Start = Date.now();
  log(`\n📖 Step 2: Reading all file contents...`);

  const readRes = await fetch(`${ngrokUrl}/files/read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ files: allFilePaths }),
  });
  if (!readRes.ok) throw new Error(`Failed to read files: ${readRes.status}`);
  const { files: fileContents } = await readRes.json();

  const successfulReads = fileContents.filter((f) => !f.error);
  const step2Duration = Date.now() - step2Start;
  log(`   ✅ Read ${successfulReads.length}/${allFilePaths.length} files (${step2Duration}ms)`);

  // ── STEP 3: Batch + Parallel makeDeclarative calls ──
  const step3Start = Date.now();
  const batches = makeBatches(successfulReads, BATCH_SIZE);
  log(`\n🔬 Step 3: Generating metadata via makeDeclarative...`);
  log(`   Created ${batches.length} batches of up to ${BATCH_SIZE} files`);

  // Call all batches in parallel
  const batchPromises = batches.map((batch, idx) => {
    const batchFiles = batch.map((f) => ({
      name: f.path,
      content: f.content,
      options: {
        format: "min-json",
        extractFlatHTML: false,
        extractHTML: false,
      },
    }));

    return fetch(`${declarativeUrl}/makeDeclarative`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-batch-size": String(BATCH_SIZE),
      },
      body: JSON.stringify({ files: batchFiles }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Batch ${idx + 1} failed: ${res.status} — ${errText}`);
        }
        return res.json();
      })
      .then((data) => {
        log(`   ✅ Batch ${idx + 1}/${batches.length}: ${data.data?.length || 0} files processed`);
        return data;
      })
      .catch((err) => {
        log(`   ❌ Batch ${idx + 1}/${batches.length} failed: ${err.message}`);
        return { success: false, data: [], error: err.message };
      });
  });

  const batchResults = await Promise.all(batchPromises);

  // Collect all metadata results
  const allMetadata = [];
  for (const batchResult of batchResults) {
    if (batchResult.success && Array.isArray(batchResult.data)) {
      allMetadata.push(...batchResult.data);
    }
  }

  const step3Duration = Date.now() - step3Start;
  log(`   ✅ Total metadata generated: ${allMetadata.length} files (${step3Duration}ms)`);

  // ── STEP 4: Build metadata string ──
  // Format: "FileName:path\n{json}\nFileName:path\n{json}\n..."
  const metadataStr = allMetadata
    .map((item) => `FileName:${item.name}\n${JSON.stringify(item.result)}`)
    .join("\n");

  const filePathsStr = allFilePaths.join(",");

  log(`\n📋 Metadata string size: ${metadataStr.length} chars`);

  // ── STEP 5: AI file selection ──
  log(`\n🤖 Step 5: AI analyzing metadata...`);

  const aiResult = await agentLoop(
    userQuery, filePathsStr, metadataStr, ngrokUrl, xaiApiKey, modelId, log
  );

  const totalDuration = Date.now() - orchestrationStart;

  return {
    success: true,
    query: userQuery,

    model: {
      id: modelId,
      name: modelInfo.name,
      pricing: {
        inputPerMillion: modelInfo.input,
        outputPerMillion: modelInfo.output,
        cachedInputPerMillion: modelInfo.cachedInput,
      },
    },

    modify: aiResult.modify,
    reference: aiResult.reference,
    reasoning: aiResult.reasoning,

    orchestration: {
      step1_listFiles: { durationMs: step1Duration, fileCount: allFilePaths.length },
      step2_readFiles: { durationMs: step2Duration, readCount: successfulReads.length },
      step3_makeDeclarative: {
        durationMs: step3Duration,
        batchCount: batches.length,
        batchSize: BATCH_SIZE,
        metadataCount: allMetadata.length,
      },
      step4_aiSelection: {
        durationMs: aiResult.timing.totalDurationMs,
        iterationCount: aiResult.timing.iterationCount,
      },
    },

    timing: {
      totalDurationMs: totalDuration,
      totalDurationFormatted: `${(totalDuration / 1000).toFixed(2)}s`,
    },

    tokens: aiResult.tokens,
    cost: aiResult.cost,  
    iterations: aiResult.iterations,
    toolCalls: aiResult.toolCalls,
    logs,
  };
}

// ============================================
// AI AGENT LOOP
// ============================================
async function agentLoop(userQuery, filePaths, metadata, ngrokUrl, xaiApiKey, modelId, log) {
  const MAX_ITERATIONS = 10;
  let iteration = 0;
  const requestStartTime = Date.now();

  const iterations = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCachedTokens = 0;
  let totalCost = 0;

  const userMessage = `User wants to: "${userQuery}"

## All File Paths:
${filePaths}

## File Metadata:
${metadata}
`;
//Analyze the file paths and metadata. Select all relevant files — both files to modify and files needed as reference. Trace imports and dependencies. Respond with the JSON answer.

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  const toolCalls = [];
  let finalResult = null;

  while (iteration < MAX_ITERATIONS) {
    iteration++;
    const iterStartTime = Date.now();
    log(`   🔄 AI Iteration ${iteration}/${MAX_ITERATIONS}`);

    const response = await callXAI(messages, xaiApiKey, modelId, iteration > 1);
    const iterDuration = Date.now() - iterStartTime;

    const usage = response.usage || {};
    const iterCost = calculateCost(usage, modelId);

    totalInputTokens += (usage.prompt_tokens || 0);
    totalOutputTokens += (usage.completion_tokens || 0);
    totalCachedTokens += (usage.prompt_tokens_details?.cached_tokens || 0);
    totalCost += iterCost.totalCost;

    const iterRecord = {
      iteration,
      durationMs: iterDuration,
      durationFormatted: `${(iterDuration / 1000).toFixed(2)}s`,
      tokens: {
        input: usage.prompt_tokens || 0,
        output: usage.completion_tokens || 0,
        cached: usage.prompt_tokens_details?.cached_tokens || 0,
        total: (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
      },
      cost: iterCost,
      toolsCalled: [],
    };

    log(`      ⏱️ ${iterRecord.durationFormatted} | 📊 In:${iterRecord.tokens.input} Out:${iterRecord.tokens.output} | 💰 $${iterCost.totalCost.toFixed(6)}`);

    const assistantMessage = response.choices[0].message;
    messages.push(assistantMessage);

    // ── Fallback: AI wants to read files ──
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      for (const toolCall of assistantMessage.tool_calls) {
        const fnName = toolCall.function.name;
        const fnArgs = JSON.parse(toolCall.function.arguments || "{}");

        log(`      🔧 ${fnName}: ${(fnArgs.relativePaths || []).join(", ")}`);
        iterRecord.toolsCalled.push({ tool: fnName, args: fnArgs });

        let toolResult;
        if (fnName === "read_files") {
          toolResult = await executeReadFiles(ngrokUrl, fnArgs.relativePaths || []);
          toolCalls.push({ tool: "read_files", files: fnArgs.relativePaths });
        } else {
          toolResult = { error: `Unknown tool: ${fnName}` };
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }
    }
    // ── Final answer ──
    else if (assistantMessage.content) {
      try {
        const content = assistantMessage.content;
        const jsonMatch = content.match(/\{[\s\S]*"modify"[\s\S]*\}/);

        if (jsonMatch) {
          finalResult = JSON.parse(jsonMatch[0]);

          if (!Array.isArray(finalResult.modify) || !Array.isArray(finalResult.reference)) {
            throw new Error("'modify' and 'reference' must be arrays");
          }

          log(`   ✅ AI done: ${finalResult.modify.length} modify + ${finalResult.reference.length} reference`);
          iterations.push(iterRecord);
          break;
        } else {
          messages.push({
            role: "user",
            content: 'Provide your answer as JSON: { "modify": [...], "reference": [...], "reasoning": "..." }',
          });
        }
      } catch (parseErr) {
        messages.push({
          role: "user",
          content: 'Invalid JSON. Respond with ONLY: { "modify": [...], "reference": [...], "reasoning": "..." }',
        });
      }
    }

    iterations.push(iterRecord);
  }

  if (!finalResult) {
    finalResult = { modify: [], reference: [], reasoning: "Did not converge." };
  }

  const totalDuration = Date.now() - requestStartTime;

  return {
    modify: finalResult.modify || [],
    reference: finalResult.reference || [],
    reasoning: finalResult.reasoning || "",
    timing: {
      totalDurationMs: totalDuration,
      totalDurationFormatted: `${(totalDuration / 1000).toFixed(2)}s`,
      iterationCount: iterations.length,
    },
    tokens: {
      totalInput: totalInputTokens,
      totalOutput: totalOutputTokens,
      totalCached: totalCachedTokens,
      grandTotal: totalInputTokens + totalOutputTokens,
    },
    cost: {
      totalInputCost: +iterations.reduce((s, i) => s + (i.cost?.inputCost || 0), 0).toFixed(8),
      totalCachedCost: +iterations.reduce((s, i) => s + (i.cost?.cachedCost || 0), 0).toFixed(8),
      totalOutputCost: +iterations.reduce((s, i) => s + (i.cost?.outputCost || 0), 0).toFixed(8),
      totalCost: +totalCost.toFixed(8),
      currency: "USD",
    },
    iterations,
    toolCalls,
  };
}

// ============================================
// HELPERS
// ============================================
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

async function callXAI(messages, xaiApiKey, modelId, includeTools) {
  const body = {
    model: modelId,
    messages,
    temperature: 0.1,
    max_tokens: 4000,
  };

  if (includeTools) {
    body.tools = TOOLS;
    body.tool_choice = "auto";
  }

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${xaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.error) throw new Error(`xAI API error: ${data.error.message}`);
  return data;
}

function calculateCost(usage, modelId) {
  const pricing = MODELS[modelId];
  if (!usage || !pricing) return { inputCost: 0, outputCost: 0, cachedCost: 0, totalCost: 0 };

  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const cachedTokens = usage.prompt_tokens_details?.cached_tokens || 0;
  const totalTokens = usage.total_tokens || 0;
  const nonCachedInput = Math.max(0, promptTokens - cachedTokens);

  const inputCost = (nonCachedInput / 1_000_000) * pricing.input;
  const cachedCost = (cachedTokens / 1_000_000) * pricing.cachedInput;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;

  return {
    promptTokens, completionTokens, cachedTokens,
    nonCachedInputTokens: nonCachedInput, totalTokens,
    inputCost: +inputCost.toFixed(8),
    cachedCost: +cachedCost.toFixed(8),
    outputCost: +outputCost.toFixed(8),
    totalCost: +(inputCost + cachedCost + outputCost).toFixed(8),
  };
}

function jsonRes(data, status, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}