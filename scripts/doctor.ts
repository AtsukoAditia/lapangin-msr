import { existsSync, readFileSync } from "node:fs";

const VALID_PROVIDERS = new Set(["mock", "google_sheets", "postgres"]);
const REQUIRED_FILES = [
  "package.json",
  "package-lock.json",
  "src/lib/adapters/database-adapter.ts",
  "src/lib/services/booking-service.ts",
  "docs/SYSTEM_TRUTH.md",
  "db/postgres/schema.sql",
];

function readEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1).replace(/^['\"]|['\"]$/g, "")];
      }),
  );
}

function getEnv(key: string, fileEnv: Record<string, string>): string {
  return process.env[key] ?? fileEnv[key] ?? "";
}

function assert(condition: boolean, message: string, errors: string[]) {
  if (!condition) errors.push(message);
}

function warn(condition: boolean, message: string, warnings: string[]) {
  if (!condition) warnings.push(message);
}

const envPath = existsSync(".env.local") ? ".env.local" : ".env";
const fileEnv = readEnvFile(envPath);
const errors: string[] = [];
const warnings: string[] = [];

for (const file of REQUIRED_FILES) {
  assert(existsSync(file), `Missing required file: ${file}`, errors);
}

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const allDeps = {
  ...(packageJson.dependencies ?? {}),
  ...(packageJson.devDependencies ?? {}),
};

const latestDeps = Object.entries(allDeps)
  .filter(([, version]) => version === "latest")
  .map(([name]) => name);

warn(
  latestDeps.length === 0,
  `Dependencies still using latest: ${latestDeps.join(", ")}. Pin in a dependency-only PR before production.`,
  warnings,
);

const provider = getEnv("DATABASE_PROVIDER", fileEnv) || "mock";
assert(
  VALID_PROVIDERS.has(provider),
  `DATABASE_PROVIDER must be one of: ${Array.from(VALID_PROVIDERS).join(", ")}`,
  errors,
);

const jwtSecret = getEnv("JWT_SECRET", fileEnv);
assert(jwtSecret.length >= 32, "JWT_SECRET must be set and at least 32 characters.", errors);

if (provider === "google_sheets") {
  assert(Boolean(getEnv("GOOGLE_SHEETS_SPREADSHEET_ID", fileEnv)), "GOOGLE_SHEETS_SPREADSHEET_ID is required for google_sheets provider.", errors);
  assert(Boolean(getEnv("GOOGLE_SHEETS_CLIENT_EMAIL", fileEnv)), "GOOGLE_SHEETS_CLIENT_EMAIL is required for google_sheets provider.", errors);
  assert(Boolean(getEnv("GOOGLE_SHEETS_PRIVATE_KEY", fileEnv)), "GOOGLE_SHEETS_PRIVATE_KEY is required for google_sheets provider.", errors);
}

if (provider === "postgres") {
  assert(Boolean(getEnv("DATABASE_URL", fileEnv) || getEnv("POSTGRES_URL", fileEnv)), "DATABASE_URL or POSTGRES_URL is required for postgres provider.", errors);
  warnings.push("PostgresAdapter is still a follow-up item. Keep DATABASE_PROVIDER=mock for local feature work unless implementing the adapter.");
}

console.log("\nLapangin local readiness check");
console.log("──────────────────────────────");
console.log(`Env file: ${existsSync(envPath) ? envPath : "not found"}`);
console.log(`DATABASE_PROVIDER: ${provider}`);
console.log(`JWT_SECRET: ${jwtSecret ? `${jwtSecret.length} chars` : "missing"}`);

if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const item of warnings) console.log(`- ${item}`);
}

if (errors.length > 0) {
  console.error("\nErrors:");
  for (const item of errors) console.error(`- ${item}`);
  process.exit(1);
}

console.log("\nOK: local setup is safe for mock-mode feature development.\n");
