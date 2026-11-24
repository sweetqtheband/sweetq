import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { test } from "node:test";
import { MongoClient } from "mongodb";

const uri = process.env.MCP_TEST_MONGO_URI;

test("concurrent story workers coordinate and persist a single snapshot", { skip: !uri, timeout: 30000 }, async () => {
  const client = new MongoClient(uri!);
  const database = `story_worker_${randomUUID().replaceAll("-", "")}`;
  const db = client.db(database);
  const server = createServer((request, response) => {
    const url = new URL(request.url!, "http://localhost");
    const payload = url.pathname.endsWith("/stories")
      ? { data: [{ id: "456", media_type: "IMAGE", timestamp: new Date().toISOString() }] }
      : { data: [{ name: url.searchParams.get("metric"), values: [{ value: 3 }] }] };
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(payload));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test server address");
  await client.connect();
  await db.collection("instagram").insertOne({ id: "instagram", user_id: "123", long_live_access_token: "test-token" });
  const env = {
    ...process.env, NODE_ENV: "development", DB_PROD: "", MONGODB_URI_DEV: uri!,
    MONGODB_DATABASE: database, GRAPH_INSTAGRAM: `http://127.0.0.1:${address.port}`,
    NEXT_PUBLIC_AWS_REGION: "us-east-1",
  };
  const workers = Array.from({ length: 2 }, () => spawn(process.execPath, ["--import", "tsx", "updates/stories.ts"], {
    cwd: process.cwd(), env, stdio: "ignore",
  }));
  try {
    let story;
    for (let i = 0; i < 100; i++) {
      story = await db.collection("instagram_stories").findOne({ id: "456" });
      if (story?.snapshots?.length) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(story?.snapshots?.length, 1);
    await new Promise((resolve) => setTimeout(resolve, 500));
    assert.equal((await db.collection("instagram_stories").findOne({ id: "456" }))?.snapshots.length, 1);
    assert.equal(await db.collection("instagram_stories").countDocuments(), 1);
  } finally {
    for (const worker of workers) worker.kill("SIGTERM");
    await Promise.all(workers.map((worker) => new Promise<void>((resolve) => {
      if (worker.exitCode !== null || worker.signalCode !== null) resolve();
      else worker.once("exit", () => resolve());
    })));
    await db.dropDatabase();
    await client.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
