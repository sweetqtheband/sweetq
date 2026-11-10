import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const css = await readFile(join(process.cwd(), "node_modules/@carbon/styles/css/styles.min.css"), "utf8");
    return new Response(css.replace(/@font-face\s*\{[^{}]*\}/g, ""), {
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[MCP OAuth] Styles unavailable", error instanceof Error ? error.name : "unknown error");
    return new Response("Styles unavailable", { status: 500 });
  }
}
