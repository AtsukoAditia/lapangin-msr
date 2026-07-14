import type { DatabaseAdapter } from "./database-adapter";
import { GoogleSheetsAdapter } from "./google-sheets-adapter";
import { MockAdapter } from "./mock-adapter";
import { PostgresAdapter } from "./postgres-adapter";

// Use globalThis to ensure singleton across Next.js module boundaries in dev mode
const globalForAdapter = globalThis as unknown as {
  __lapanginAdapter: DatabaseAdapter | undefined;
};

export function getDatabaseAdapter(): DatabaseAdapter {
  if (globalForAdapter.__lapanginAdapter) return globalForAdapter.__lapanginAdapter;

  const provider = process.env.DATABASE_PROVIDER ?? "mock";

  switch (provider) {
    case "postgres":
      if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
        globalForAdapter.__lapanginAdapter = new PostgresAdapter();
      } else {
        console.warn("Postgres env vars not set, falling back to mock adapter");
        globalForAdapter.__lapanginAdapter = new MockAdapter();
      }
      break;
    case "google_sheets":
      if (
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
        process.env.GOOGLE_SHEETS_CLIENT_EMAIL &&
        process.env.GOOGLE_SHEETS_PRIVATE_KEY
      ) {
        globalForAdapter.__lapanginAdapter = new GoogleSheetsAdapter();
      } else {
        console.warn("Google Sheets env vars not set, falling back to mock adapter");
        globalForAdapter.__lapanginAdapter = new MockAdapter();
      }
      break;
    default:
      globalForAdapter.__lapanginAdapter = new MockAdapter();
      break;
  }

  return globalForAdapter.__lapanginAdapter!;
}