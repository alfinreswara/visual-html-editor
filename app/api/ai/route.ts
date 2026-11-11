import { NextResponse } from "next/server";
import {
  AI_REQUEST_TIMEOUT_MS,
  MAX_AI_HTML_CHARS,
  MAX_AI_INSTRUCTION_CHARS,
  MAX_AI_STYLESHEET_CHARS,
  MAX_AI_STYLESHEETS,
  buildAiPrompt,
  parseOpenAiChatResponse,
  resolveAiConfig,
  validateAiHtmlOutput,
  type AiSelection,
  type AiStylesheet,
} from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 120;

interface AiRequestBody {
  html?: unknown;
  instruction?: unknown;
  selected?: unknown;
  stylesheets?: unknown;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function parseSelection(value: unknown): AiSelection | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Data elemen terpilih tidak valid.");
  }

  const selection = value as Record<string, unknown>;
  const { tag, className, html } = selection;

  if (typeof tag !== "string" || !/^[a-z][a-z0-9-]*$/i.test(tag)) {
    throw new Error("Tag elemen terpilih tidak valid.");
  }
  if (typeof className !== "string" || className.length > 4_000) {
    throw new Error("Class elemen terpilih tidak valid.");
  }
  if (typeof html !== "string" || html.length < 3 || html.length > 150_000) {
    throw new Error("HTML elemen terpilih tidak valid.");
  }

  return { tag, className, html };
}

function parseStylesheets(value: unknown): AiStylesheet[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error("Data stylesheet tidak valid.");
  }
  if (value.length > MAX_AI_STYLESHEETS) {
    throw new Error(
      `Terlalu banyak stylesheet. Maksimal ${MAX_AI_STYLESHEETS} file.`,
    );
  }

  const stylesheets: AiStylesheet[] = [];
  let total = 0;

  for (const item of value) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error("Data stylesheet tidak valid.");
    }
    const record = item as Record<string, unknown>;
    if (
      typeof record.path !== "string" ||
      !record.path.trim() ||
      record.path.length > 320 ||
      record.path.includes("\0")
    ) {
      throw new Error("Path stylesheet tidak valid.");
    }
    if (
      typeof record.content !== "string" ||
      record.content.length > MAX_AI_STYLESHEET_CHARS
    ) {
      throw new Error("Isi stylesheet tidak valid atau terlalu besar.");
    }

    total += record.content.length;
    if (total > MAX_AI_STYLESHEET_CHARS) {
      throw new Error("Total CSS yang dikirim ke AI terlalu besar.");
    }

    stylesheets.push({
      path: record.path.trim(),
      content: record.content,
    });
  }

  return stylesheets;
}

function upstreamErrorMessage(status: number): string {
  if (status === 401 || status === 403) {
    return `Kunci API AI ditolak (status ${status}). Periksa AI_API_KEY di .env.local lalu restart server.`;
  }
  if (status === 429) {
    return "Layanan AI sedang membatasi permintaan (429). Tunggu beberapa saat lalu coba lagi.";
  }
  if (status === 404) {
    return "Endpoint AI tidak ditemukan (404). Periksa AI_BASE_URL, biasanya diakhiri /v1.";
  }
  if (status === 400 || status === 422) {
    return `Layanan AI menolak permintaan (status ${status}). Periksa AI_MODEL dan AI_BASE_URL lalu coba lagi.`;
  }
  if (status === 408 || status === 504) {
    return "Layanan AI tidak merespons tepat waktu. Coba lagi beberapa saat lagi.";
  }
  if (status >= 500) {
    return `Layanan AI sedang bermasalah (status ${status}). Coba lagi beberapa saat lagi.`;
  }
  return `Layanan AI menolak permintaan (status ${status}). Coba lagi beberapa saat lagi.`;
}

export async function POST(request: Request) {
  let body: AiRequestBody;
  try {
    body = (await request.json()) as AiRequestBody;
  } catch {
    return errorResponse("Format permintaan AI tidak valid.", 400);
  }

  if (typeof body.html !== "string") {
    return errorResponse("HTML halaman wajib berupa teks.", 400);
  }

  if (body.html.length > MAX_AI_HTML_CHARS) {
    return errorResponse(
      `HTML terlalu besar untuk AI. Maksimal ${Math.round(MAX_AI_HTML_CHARS / 1_000)} ribu karakter.`,
      413,
    );
  }

  if (
    typeof body.instruction !== "string" ||
    !body.instruction.trim() ||
    body.instruction.length > MAX_AI_INSTRUCTION_CHARS
  ) {
    return errorResponse(
      `Instruksi wajib diisi dan maksimal ${MAX_AI_INSTRUCTION_CHARS} karakter.`,
      400,
    );
  }

  let selection: AiSelection | null;
  try {
    selection = parseSelection(body.selected);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Elemen terpilih tidak valid.",
      400,
    );
  }

  let stylesheets: AiStylesheet[];
  try {
    stylesheets = parseStylesheets(body.stylesheets);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Stylesheet tidak valid.",
      400,
    );
  }

  const config = resolveAiConfig();
  if (!config) {
    const hasApiKey = Boolean(process.env.AI_API_KEY?.trim());
    const hasModel = Boolean(process.env.AI_MODEL?.trim());

    if (!hasApiKey || !hasModel) {
      return errorResponse(
        "Layanan AI belum dikonfigurasi. Isi AI_API_KEY dan AI_MODEL di .env.local, atur AI_BASE_URL bila perlu, lalu restart server.",
        503,
      );
    }

    return errorResponse(
      "AI_BASE_URL tidak valid. Gunakan URL http(s) lengkap, misalnya http://localhost:20128/v1.",
      503,
    );
  }

  const { system, user, mode } = buildAiPrompt(
    body.html,
    body.instruction.trim(),
    selection,
    stylesheets,
  );

  let upstream: Response;
  try {
    upstream = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.2,
        max_tokens: 12_000,
        stream: false,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    console.error("AI request failed:", error);

    const errorName = error instanceof Error ? error.name : "";
    if (errorName === "TimeoutError" || errorName === "AbortError") {
      return errorResponse(
        "Layanan AI tidak merespons dalam 90 detik. Coba lagi dengan instruksi yang lebih singkat.",
        502,
      );
    }

    return errorResponse(
      "Tidak dapat terhubung ke layanan AI. Pastikan AI_BASE_URL aktif dan dapat diakses dari server, lalu coba lagi.",
      502,
    );
  }

  const rawBody = await upstream.text();
  if (!upstream.ok) {
    console.error("AI API error:", upstream.status, rawBody.slice(0, 800));
    return errorResponse(upstreamErrorMessage(upstream.status), 502);
  }

  let data: unknown;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return errorResponse("Respons layanan AI tidak valid.", 502);
  }

  let rawText: string;
  let truncated: boolean;
  try {
    const parsed = parseOpenAiChatResponse(data);
    rawText = parsed.text;
    truncated = parsed.truncated;
  } catch (error) {
    console.error("AI response parsing failed:", error);
    return errorResponse(
      error instanceof Error
        ? error.message
        : "Respons layanan AI tidak berisi konten.",
      502,
    );
  }

  if (truncated) {
    return errorResponse(
      "Hasil AI terpotong karena terlalu panjang. Persempit instruksi lalu coba lagi.",
      502,
    );
  }

  if (!rawText) {
    return errorResponse(
      "AI tidak mengembalikan hasil. Coba ubah instruksimu.",
      502,
    );
  }

  try {
    const result = validateAiHtmlOutput(rawText, mode);

    return NextResponse.json(result, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    console.error("AI output processing failed:", error);
    return errorResponse(
      error instanceof Error
        ? error.message
        : "Respons AI tidak dapat diproses. Coba lagi.",
      502,
    );
  }
}
