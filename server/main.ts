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

router.get("/_health", (ctx) => {
  ctx.response.body = "OK";
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
    ctx.response.body = { error: "Invalid id" };
    ctx.response.status = 400;
    return;
  }

  const result = lookupInsight({ db, id });

  if (!result) {
    ctx.response.status = 404;
    return;
  }

  ctx.response.body = result;
  ctx.response.status = 200;
});

router.post("/insights", async (ctx) => {
  let brand: number;
  let text: string;

  try {
    const body = await ctx.request.body.json();
    brand = Number(body?.brand);
    text = typeof body?.text === "string" ? body.text.trim() : "";
  } catch {
    ctx.response.body = { error: "Invalid request body" };
    ctx.response.status = 400;
    return;
  }

  if (!Number.isInteger(brand) || !text) {
    ctx.response.body = { error: "Invalid input" };
    ctx.response.status = 400;
    return;
  }

  const result = createInsight({ db, brand, text });

  ctx.response.body = result;
  ctx.response.status = 201;
});

router.delete("/insights/:id", (ctx) => {
  const id = Number(ctx.params.id);

  if (!Number.isInteger(id)) {
    ctx.response.body = { error: "Invalid id" };
    ctx.response.status = 400;
    return;
  }

  const existing = lookupInsight({ db, id });

  if (!existing) {
    ctx.response.status = 404;
    return;
  }

  const result = deleteInsight({ db, id });

  ctx.response.body = result;
  ctx.response.status = 200;
});
const app = new oak.Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(env);
console.log(`Started server on port ${env.port}`);
