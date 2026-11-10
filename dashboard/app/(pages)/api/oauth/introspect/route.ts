export async function POST() {
  return Response.json(
    { error: "temporarily_unavailable" },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}
