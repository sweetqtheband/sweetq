import { getImport } from "@/app/services/api/imports";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const importId = searchParams.get("id");

    if (!importId) {
        return new Response("Missing id", { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const interval = setInterval(() => {
                const progress = getImport(importId);

                if (!progress) {
                    clearInterval(interval);
                    controller.close();
                    return;
                }

                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify(progress)}\n\n`
                    )
                );

                if (
                    progress.status === "completed" ||
                    progress.status === "error"
                ) {
                    clearInterval(interval);
                    controller.close();
                }
            }, 500);

            // Importante para limpiar si el cliente cierra la conexión
            req.signal.addEventListener("abort", () => {
                clearInterval(interval);

                try {
                    controller.close();
                } catch { }
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}