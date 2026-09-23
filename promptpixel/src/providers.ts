import type { ProviderKind, ProviderProfile } from "./types";

export interface ImageInput {
  base64: string;
  mimeType: string;
}

const DEFAULT_MODELS: Record<ProviderKind, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-sonnet-latest",
  gemini: "gemini-2.0-flash",
  openrouter: "openrouter/auto",
  "openai-compatible": "",
  custom: ""
};

const DEFAULT_ORIGINS: Partial<Record<ProviderKind, string>> = {
  openai: "https://api.openai.com",
  anthropic: "https://api.anthropic.com",
  gemini: "https://generativelanguage.googleapis.com",
  openrouter: "https://openrouter.ai"
};

// A detailed screen (HTML wireframe, or a leaf-mapping JSON reply over a large catalog) can
// easily need several thousand tokens — a cap that's too small silently truncates mid-generation
// instead of erroring outright. Shared by every provider's own generation call so none of them
// falls back to a provider-side default that may be much lower (OpenAI-compatible/self-hosted
// endpoints commonly default to ~4096 when `max_tokens` is omitted entirely).
const MAX_OUTPUT_TOKENS = 16384;

function resolveModel(profile: ProviderProfile): string {
  const requested = profile.model?.trim();
  if (requested && requested !== "auto") return requested;
  const fallback = DEFAULT_MODELS[profile.provider];
  if (!fallback) {
    throw new Error(
      `${profile.name || profile.provider}: hãy nhập model trong Advanced settings (không có model mặc định cho ${profile.provider}).`
    );
  }
  return fallback;
}

function resolveOrigin(profile: ProviderProfile): string {
  const custom = profile.baseUrl?.trim().replace(/\/+$/, "");
  if (custom) return custom;
  const fallback = DEFAULT_ORIGINS[profile.provider];
  if (!fallback) {
    throw new Error(
      `${profile.name || profile.provider}: hãy nhập Base URL trong Advanced settings cho provider này.`
    );
  }
  return fallback;
}

// A generic (non-AbortError) fetch-level failure can mean several different things — a domain
// missing from manifest.json's allowedDomains, but just as often (especially for a large
// catalog + a full HTML wireframe in one request body) the request payload itself being too
// large for the sandbox's fetch to send at all. Surface the underlying error's own message
// (when there is one) alongside the request's approximate size so this doesn't need yet another
// round-trip to diagnose which one it actually was.
function describeNetworkFailure(err: unknown, init: RequestInit): string {
  const bodySize = typeof init.body === "string" ? init.body.length : undefined;
  const sizeNote =
    bodySize !== undefined ? ` (request body ~${Math.round(bodySize / 1024)}KB)` : "";
  const detail = err instanceof Error && err.message ? ` Chi tiết: ${err.message}.` : "";
  return (
    `Network request thất bại${sizeNote}.${detail} Có thể do domain chưa được thêm vào ` +
    "manifest.json → networkAccess.allowedDomains (nếu là custom/OpenAI-compatible endpoint), " +
    "hoặc request quá lớn (catalog nhiều component + ảnh/HTML đính kèm) — thử giảm bớt catalog " +
    "đang bật hoặc bỏ ảnh đính kèm rồi thử lại."
  );
}

async function fetchWithTimeout(url: string, init: RequestInit, ms = 60_000): Promise<Response> {
  // Figma's plugin main-thread sandbox doesn't always provide AbortController even though
  // it provides fetch — fall back to a plain, unbounded fetch when it's unavailable rather
  // than crashing the whole request.
  if (typeof AbortController === "undefined") {
    try {
      return await fetch(url, init);
    } catch (err) {
      throw new Error(describeNetworkFailure(err, init));
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Request timed out sau ${ms / 1000}s.`);
    }
    throw new Error(describeNetworkFailure(err, init));
  } finally {
    clearTimeout(timer);
  }
}

async function readErrorMessage(response: Response, providerLabel: string): Promise<string> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    // response body isn't JSON, fall through with an empty body
  }
  const nested =
    (body as { error?: { message?: string }; message?: string } | undefined)?.error?.message ??
    (body as { message?: string } | undefined)?.message ??
    JSON.stringify(body ?? {});
  return `${providerLabel} request thất bại (HTTP ${response.status}): ${nested}`;
}

function buildOpenAIUserContent(userPrompt: string, image?: ImageInput): unknown {
  if (!image) return userPrompt;
  return [
    { type: "text", text: userPrompt },
    { type: "image_url", image_url: { url: `data:${image.mimeType};base64,${image.base64}` } }
  ];
}

type OpenAIResponseFormat =
  | { type: "json_object" }
  | { type: "json_schema"; schema: Record<string, unknown> }
  | undefined;

async function callOpenAIChatCompletions(
  url: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  image: ImageInput | undefined,
  options: { responseFormat: OpenAIResponseFormat; providerLabel: string }
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: buildOpenAIUserContent(userPrompt, image) }
    ],
    temperature: 0.2,
    max_tokens: MAX_OUTPUT_TOKENS
  };
  if (options.responseFormat?.type === "json_object") {
    body.response_format = { type: "json_object" };
  } else if (options.responseFormat?.type === "json_schema") {
    body.response_format = {
      type: "json_schema",
      json_schema: { name: "UIPlan", schema: options.responseFormat.schema }
    };
  }

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, options.providerLabel));
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${options.providerLabel} không trả về nội dung message.`);
  }
  return content;
}

async function callOpenAI(
  profile: ProviderProfile,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  image?: ImageInput,
  jsonSchema?: Record<string, unknown>
): Promise<string> {
  return callOpenAIChatCompletions(
    `${resolveOrigin(profile)}/v1/chat/completions`,
    apiKey,
    resolveModel(profile),
    systemPrompt,
    userPrompt,
    image,
    {
      // Only force JSON mode when the caller actually wants structured output — a freeform call
      // (the HTML wireframe step, the image-description pass) has no jsonSchema and must get
      // plain text back; forcing `json_object` mode on it made the model wrap the whole HTML
      // response inside a JSON string, so every real newline came back as a literal `\n` escape
      // sequence instead of an actual line break.
      responseFormat: jsonSchema ? { type: "json_schema", schema: jsonSchema } : undefined,
      providerLabel: "OpenAI"
    }
  );
}

async function callOpenRouter(
  profile: ProviderProfile,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  image?: ImageInput,
  jsonSchema?: Record<string, unknown>
): Promise<string> {
  return callOpenAIChatCompletions(
    `${resolveOrigin(profile)}/api/v1/chat/completions`,
    apiKey,
    resolveModel(profile),
    systemPrompt,
    userPrompt,
    image,
    {
      // See callOpenAI's comment above — same fix, same reason.
      responseFormat: jsonSchema ? { type: "json_schema", schema: jsonSchema } : undefined,
      providerLabel: "OpenRouter"
    }
  );
}

async function callOpenAICompatible(
  profile: ProviderProfile,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  image?: ImageInput
): Promise<string> {
  if (!profile.baseUrl?.trim()) {
    throw new Error(
      `${profile.name || profile.provider}: hãy nhập Base URL trong Advanced settings cho custom/OpenAI-compatible provider.`
    );
  }
  return callOpenAIChatCompletions(
    `${resolveOrigin(profile)}/v1/chat/completions`,
    apiKey,
    resolveModel(profile),
    systemPrompt,
    userPrompt,
    image,
    { responseFormat: undefined, providerLabel: profile.name || "Custom" }
  );
}

async function callAnthropic(
  profile: ProviderProfile,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  image?: ImageInput
): Promise<string> {
  const content: unknown = image
    ? [
        { type: "image", source: { type: "base64", media_type: image.mimeType, data: image.base64 } },
        { type: "text", text: userPrompt }
      ]
    : userPrompt;

  const response = await fetchWithTimeout(`${resolveOrigin(profile)}/v1/messages`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: resolveModel(profile),
      system: systemPrompt,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [{ role: "user", content }]
    })
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Anthropic"));
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const textBlock = data.content?.find((block) => block.type === "text" && block.text);
  if (!textBlock?.text) {
    throw new Error("Anthropic không trả về text block.");
  }
  return textBlock.text;
}

function describeGeminiFailure(data: {
  candidates?: Array<{ finishReason?: string }>;
  promptFeedback?: { blockReason?: string };
}): string {
  const blockReason = data.promptFeedback?.blockReason;
  if (blockReason) return `bị chặn vì lý do an toàn (${blockReason})`;
  const finishReason = data.candidates?.[0]?.finishReason;
  if (finishReason === "MAX_TOKENS") {
    return "hết giới hạn token trước khi tạo xong nội dung — thử rút gọn yêu cầu hoặc giảm bớt catalog";
  }
  if (finishReason) return `finishReason "${finishReason}"`;
  return "không rõ lý do";
}

async function callGemini(
  profile: ProviderProfile,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  image?: ImageInput,
  responseSchema?: Record<string, unknown>
): Promise<string> {
  const model = resolveModel(profile);
  const parts: unknown[] = [{ text: userPrompt }];
  if (image) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  }

  const generationConfig: Record<string, unknown> = {
    temperature: 0.2,
    // Set explicitly rather than relying on an unconfirmed provider/model default (see
    // MAX_OUTPUT_TOKENS above).
    maxOutputTokens: MAX_OUTPUT_TOKENS
  };
  // Only force JSON mode when the caller actually wants structured output — a freeform call (the
  // HTML wireframe step, the image-description pass) has no responseSchema and must get plain
  // text back; forcing JSON mode unconditionally made the model wrap its whole HTML response
  // inside a JSON string, so every real newline came back as a literal `\n` escape sequence.
  if (responseSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = responseSchema;
  }

  const response = await fetchWithTimeout(
    `${resolveOrigin(profile)}/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts }],
        generationConfig
      })
    }
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Gemini"));
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    promptFeedback?: { blockReason?: string };
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Gemini không trả về candidate text (${describeGeminiFailure(data)}).`);
  }
  return text;
}

// Excludes non-chat model families (audio transcription/TTS, image generation, embeddings,
// moderation, legacy completion-only models) that show up in a provider's raw model list but
// can never produce the JSON UIPlan output this plugin needs.
const NON_CHAT_MODEL_PATTERN = /whisper|tts-|dall-e|embedding|moderation|davinci|babbage|curie|^ada(-|$)/i;

function isChatModelId(id: string): boolean {
  return !NON_CHAT_MODEL_PATTERN.test(id);
}

async function listOpenAIShapedModels(
  url: string,
  apiKey: string,
  providerLabel: string
): Promise<string[]> {
  const response = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, providerLabel));
  }
  const data = (await response.json()) as { data?: Array<{ id: string }> };
  return (data.data ?? [])
    .map((model) => model.id)
    .filter(isChatModelId)
    .sort();
}

async function listOpenRouterModels(url: string, apiKey: string): Promise<string[]> {
  const response = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "OpenRouter"));
  }
  const data = (await response.json()) as {
    data?: Array<{ id: string; architecture?: { output_modalities?: string[] } }>;
  };
  return (data.data ?? [])
    .filter(
      (model) =>
        !model.architecture?.output_modalities ||
        model.architecture.output_modalities.includes("text")
    )
    .map((model) => model.id)
    .filter(isChatModelId)
    .sort();
}

export async function listModels(profile: ProviderProfile, apiKey: string): Promise<string[]> {
  switch (profile.provider) {
    case "openai":
      return listOpenAIShapedModels(`${resolveOrigin(profile)}/v1/models`, apiKey, "OpenAI");
    case "openrouter":
      return listOpenRouterModels(`${resolveOrigin(profile)}/api/v1/models`, apiKey);
    case "openai-compatible":
    case "custom":
      if (!profile.baseUrl?.trim()) {
        throw new Error(
          `${profile.name || profile.provider}: hãy nhập Base URL trong Advanced settings trước khi tải danh sách model.`
        );
      }
      return listOpenAIShapedModels(
        `${resolveOrigin(profile)}/v1/models`,
        apiKey,
        profile.name || "Custom"
      );
    case "anthropic": {
      const response = await fetchWithTimeout(`${resolveOrigin(profile)}/v1/models`, {
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" }
      });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Anthropic"));
      }
      const data = (await response.json()) as { data?: Array<{ id: string }> };
      return (data.data ?? [])
        .map((model) => model.id)
        .filter(isChatModelId)
        .sort();
    }
    case "gemini": {
      const response = await fetchWithTimeout(`${resolveOrigin(profile)}/v1beta/models`, {
        headers: { "x-goog-api-key": apiKey }
      });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, "Gemini"));
      }
      const data = (await response.json()) as {
        models?: Array<{ name: string; supportedGenerationMethods?: string[] }>;
      };
      // Gemini's own supportedGenerationMethods flag is the authoritative "is this a chat
      // model" signal here (it already excludes embedding-only models), so no name-pattern
      // filtering is layered on top.
      return (data.models ?? [])
        .filter(
          (model) =>
            !model.supportedGenerationMethods ||
            model.supportedGenerationMethods.includes("generateContent")
        )
        .map((model) => model.name.replace(/^models\//, ""))
        .sort();
    }
    default: {
      const exhaustiveCheck: never = profile.provider;
      throw new Error(`Provider không được hỗ trợ: ${exhaustiveCheck}`);
    }
  }
}

async function compareOpenAIShaped(
  url: string,
  apiKey: string,
  model: string,
  instruction: string,
  referenceImage: ImageInput,
  resultImage: ImageInput,
  providerLabel: string
): Promise<string> {
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: instruction },
            {
              type: "image_url",
              image_url: { url: `data:${referenceImage.mimeType};base64,${referenceImage.base64}` }
            },
            {
              type: "image_url",
              image_url: { url: `data:${resultImage.mimeType};base64,${resultImage.base64}` }
            }
          ]
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, providerLabel));
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${providerLabel} không trả về nội dung message.`);
  }
  return content;
}

async function compareAnthropic(
  profile: ProviderProfile,
  apiKey: string,
  instruction: string,
  referenceImage: ImageInput,
  resultImage: ImageInput
): Promise<string> {
  const response = await fetchWithTimeout(`${resolveOrigin(profile)}/v1/messages`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: resolveModel(profile),
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: referenceImage.mimeType, data: referenceImage.base64 }
            },
            {
              type: "image",
              source: { type: "base64", media_type: resultImage.mimeType, data: resultImage.base64 }
            },
            { type: "text", text: instruction }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Anthropic"));
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const textBlock = data.content?.find((block) => block.type === "text" && block.text);
  if (!textBlock?.text) {
    throw new Error("Anthropic không trả về text block.");
  }
  return textBlock.text;
}

async function compareGemini(
  profile: ProviderProfile,
  apiKey: string,
  instruction: string,
  referenceImage: ImageInput,
  resultImage: ImageInput
): Promise<string> {
  const model = resolveModel(profile);
  const response = await fetchWithTimeout(
    `${resolveOrigin(profile)}/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: instruction },
              { inlineData: { mimeType: referenceImage.mimeType, data: referenceImage.base64 } },
              { inlineData: { mimeType: resultImage.mimeType, data: resultImage.base64 } }
            ]
          }
        ],
        generationConfig: { temperature: 0.2 }
      })
    }
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Gemini"));
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    promptFeedback?: { blockReason?: string };
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Gemini không trả về candidate text (${describeGeminiFailure(data)}).`);
  }
  return text;
}

export async function compareScreens(
  profile: ProviderProfile,
  apiKey: string,
  referenceImage: ImageInput,
  resultImage: ImageInput,
  instruction: string
): Promise<string> {
  switch (profile.provider) {
    case "openai":
      return compareOpenAIShaped(
        `${resolveOrigin(profile)}/v1/chat/completions`,
        apiKey,
        resolveModel(profile),
        instruction,
        referenceImage,
        resultImage,
        "OpenAI"
      );
    case "openrouter":
      return compareOpenAIShaped(
        `${resolveOrigin(profile)}/api/v1/chat/completions`,
        apiKey,
        resolveModel(profile),
        instruction,
        referenceImage,
        resultImage,
        "OpenRouter"
      );
    case "openai-compatible":
    case "custom":
      if (!profile.baseUrl?.trim()) {
        throw new Error(
          `${profile.name || profile.provider}: hãy nhập Base URL trong Advanced settings cho custom/OpenAI-compatible provider.`
        );
      }
      return compareOpenAIShaped(
        `${resolveOrigin(profile)}/v1/chat/completions`,
        apiKey,
        resolveModel(profile),
        instruction,
        referenceImage,
        resultImage,
        profile.name || "Custom"
      );
    case "anthropic":
      return compareAnthropic(profile, apiKey, instruction, referenceImage, resultImage);
    case "gemini":
      return compareGemini(profile, apiKey, instruction, referenceImage, resultImage);
    default: {
      const exhaustiveCheck: never = profile.provider;
      throw new Error(`Provider không được hỗ trợ: ${exhaustiveCheck}`);
    }
  }
}

export async function callProvider(
  profile: ProviderProfile,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  image?: ImageInput,
  jsonSchema?: Record<string, unknown>,
  geminiSchema?: Record<string, unknown>
): Promise<string> {
  switch (profile.provider) {
    case "openai":
      return callOpenAI(profile, apiKey, systemPrompt, userPrompt, image, jsonSchema);
    case "anthropic":
      return callAnthropic(profile, apiKey, systemPrompt, userPrompt, image);
    case "gemini":
      return callGemini(profile, apiKey, systemPrompt, userPrompt, image, geminiSchema);
    case "openrouter":
      return callOpenRouter(profile, apiKey, systemPrompt, userPrompt, image, jsonSchema);
    case "openai-compatible":
    case "custom":
      return callOpenAICompatible(profile, apiKey, systemPrompt, userPrompt, image);
    default: {
      const exhaustiveCheck: never = profile.provider;
      throw new Error(`Provider không được hỗ trợ: ${exhaustiveCheck}`);
    }
  }
}
