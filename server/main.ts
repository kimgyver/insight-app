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

type CreateInsightInput = {
  brand: number;
  text: string;
};

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };

const invalid = (code: string, message: string): ValidationResult<never> => ({
  ok: false,
  error: { code, message },
});

const parseInsightId = (
  rawId: string | undefined,
): ValidationResult<number> => {
  const id = Number(rawId);

  if (!Number.isInteger(id) || id < 0) {
    return invalid("INVALID_ID", "Invalid id");
  }

  return { ok: true, value: id };
};

const parseCreateInsightInput = (
  body: unknown,
): ValidationResult<CreateInsightInput> => {
  if (typeof body !== "object" || body === null) {
    return invalid("INVALID_INPUT", "Invalid brand or text");
  }

  const input = body as Record<string, unknown>;
  const brand = Number(input.brand);
  const textValue = input.text;

  if (!Number.isInteger(brand) || brand < 0) {
    return invalid("INVALID_INPUT", "Invalid brand or text");
  }

  if (typeof textValue !== "string") {
    return invalid("INVALID_INPUT", "Invalid brand or text");
  }

  const text = textValue.trim();

  if (!text) {
    return invalid("INVALID_INPUT", "Invalid brand or text");
  }

  return { ok: true, value: { brand, text } };
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
  const parsedId = parseInsightId(ctx.params.id);

  if (!parsedId.ok) {
    setError(ctx, 400, parsedId.error.code, parsedId.error.message);
    return;
  }

  const result = lookupInsight({ db, id: parsedId.value });

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

  const parsedInput = parseCreateInsightInput(body);

  if (!parsedInput.ok) {
    setError(ctx, 400, parsedInput.error.code, parsedInput.error.message);
    return;
  }

  const result = createInsight({
    db,
    brand: parsedInput.value.brand,
    text: parsedInput.value.text,
  });

  ctx.response.body = result;
  ctx.response.status = 201;
});

router.delete("/insights/:id", (ctx) => {
  const parsedId = parseInsightId(ctx.params.id);

  if (!parsedId.ok) {
    setError(ctx, 400, parsedId.error.code, parsedId.error.message);
    return;
  }

  const deleted = deleteInsight({ db, id: parsedId.value });

  if (!deleted) {
    setError(ctx, 404, "NOT_FOUND", "Insight not found");
    return;
  }

  ctx.response.body = { success: true };
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
