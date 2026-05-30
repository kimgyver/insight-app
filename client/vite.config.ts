import { Port } from "../lib/utils/index.ts";
import react from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import process from "node:process";

const isDenoRuntime = typeof Deno !== "undefined";

const env = {
  clientPort: Port.parse(
    (isDenoRuntime ? Deno.env.get("CLIENT_PORT") : process.env.CLIENT_PORT) ??
      5173,
  ),
  serverBaseUrl: String(
    (isDenoRuntime
      ? Deno.env.get("SERVER_BASE_URL")
      : process.env.SERVER_BASE_URL) ??
      "http://localhost",
  ),
  serverPort: Port.parse(
    (isDenoRuntime ? Deno.env.get("SERVER_PORT") : process.env.SERVER_PORT) ??
      8080,
  ),
};

export default defineConfig(async () => {
  const denoPlugin = isDenoRuntime
    ? (await import("@deno/vite-plugin")).default
    : undefined;

  return {
    root: "./src",
    build: {
      outDir: "./dist",
      emptyOutDir: true,
    },
    plugins: [react(), ...(denoPlugin ? [denoPlugin()] : [])],
    server: {
      port: env.clientPort,
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd()), "../../node_modules"],
      },
      proxy: {
        "/api": {
          target: `${env.serverBaseUrl}:${env.serverPort}`,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
    },
  };
});
