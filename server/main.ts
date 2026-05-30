import { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import * as path from "@std/path";
import { Port } from "../lib/utils/index.ts";
import listInsights from "./operations/list-insights.ts";
import lookupInsight from "./operations/lookup-insight.ts";
import createInsight from "./operations/create-insight.ts";
import deleteInsight from "./operations/delete-insight.ts";
import { createTableIfNotExists } from "./tables/insights.ts";

console.log("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

const dbFilePath = path.resolve("tmp", "db.sqlite3");

console.log(`Opening SQLite database at ${dbFilePath}`);

await Deno.mkdir(path.dirname(dbFilePath), { recursive: true });
const db = new Database(dbFilePath);

db.exec(createTableIfNotExists);

console.log("Initialising server");

const router = new oak.Router();

const setError = (
  ctx: oak.Context,
  status: number,
  code: string,
  message: string,
) => {
  ctx.response.status = status;
  ctx.response.body = { error: { code, message } };
};

router.get("/_health", (ctx) => {
  ctx.response.body = { status: "ok" };
  ctx.response.status = 200;
});

router.get("/insights", (ctx) => {
  const result = listInsights({ db });
  ctx.response.body = result;
  ctx.response.status = 200;
});

router.get("/insights/:id", (ctx) => {
  const id = Number(ctx.params.id);

  if (!Number.isInteger(id)) {
    setError(ctx, 400, "INVALID_ID", "Invalid id");
    return;
  }

  const result = lookupInsight({ db, id });

  if (!result) {
    setError(ctx, 404, "NOT_FOUND", "Insight not found");
    return;
  }

  ctx.response.body = result;
  ctx.response.status = 200;
});

router.post("/insights", async (ctx) => {
  let body: unknown;

  try {
    body = await ctx.request.body.json();
  } catch {
    setError(ctx, 400, "INVALID_REQUEST_BODY", "Invalid request body");
    return;
  }

  if (typeof body !== "object" || body === null) {
    setError(ctx, 400, "INVALID_REQUEST_BODY", "Invalid request body");
    return;
  }

  const input = body as Record<string, unknown>;
  const hasBrand = Object.hasOwn(input, "brand");
  const hasText = Object.hasOwn(input, "text");

  if (!hasBrand) {
    setError(ctx, 400, "INVALID_BRAND", "Missing brand");
    return;
  }

  if (!hasText) {
    setError(ctx, 400, "INVALID_TEXT", "Missing text");
    return;
  }

  const brand = Number(input.brand);
  const text = typeof input.text === "string" ? input.text.trim() : "";

  if (!Number.isInteger(brand) || brand < 0) {
    setError(ctx, 400, "INVALID_BRAND", "Invalid brand");
    return;
  }

  if (!text) {
    setError(ctx, 400, "INVALID_TEXT", "Text is required");
    return;
  }

  if (text.length > 500) {
    setError(ctx, 400, "TEXT_TOO_LONG", "Text must be 500 characters or less");
    return;
  }

  const result = createInsight({ db, brand, text });

  ctx.response.body = result;
  ctx.response.status = 201;
});

router.delete("/insights/:id", (ctx) => {
  const id = Number(ctx.params.id);

  if (!Number.isInteger(id)) {
    setError(ctx, 400, "INVALID_ID", "Invalid id");
    return;
  }

  const existing = lookupInsight({ db, id });

  if (!existing) {
    setError(ctx, 404, "NOT_FOUND", "Insight not found");
    return;
  }

  const result = deleteInsight({ db, id });

  ctx.response.body = result;
  ctx.response.status = 200;
});
const app = new oak.Application();

app.use(async (ctx, next) => {
  try {
    await next();

    if (ctx.response.status === 404 && !ctx.response.body) {
      setError(ctx, 404, "NOT_FOUND", "Not found");
    }
  } catch (error) {
    console.error(error);
    setError(ctx, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(env);
console.log(`Started server on port ${env.port}`);
