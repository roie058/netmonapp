const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const { app } = require("../src/server");

test("Node.js runtime environment version check", (t) => {
  const version = process.version;
  console.log(`Running on Node.js ${version}`);
  assert.ok(process.version.startsWith("v24"), `Expected Node v24.x, got ${process.version}`);
});

test("Express server routes and static file serving", async (t) => {
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, "127.0.0.1", resolve));
  const port = testServer.address().port;

  try {
    // Test root route
    await t.test("GET / serves static React index.html", async () => {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      assert.strictEqual(res.status, 200);
      const html = await res.text();
      assert.ok(html.includes("Flow Analyzer"));
    });

    // Test flow-analyzer route
    await t.test("GET /flow-analyzer serves React index.html", async () => {
      const res = await fetch(`http://127.0.0.1:${port}/flow-analyzer`);
      assert.strictEqual(res.status, 200);
      const html = await res.text();
      assert.ok(html.includes("Flow Analyzer"));
    });

    // Test DNS lookup endpoint
    await t.test("POST /flow-analyzer/api/dns resolves IP", async () => {
      const res = await fetch(`http://127.0.0.1:${port}/flow-analyzer/api/dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipHost: "8.8.8.8" }),
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(typeof json.host, "string");
    });
  } finally {
    testServer.close();
  }
});
