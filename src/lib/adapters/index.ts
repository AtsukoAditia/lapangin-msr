import type { DatabaseAdapter } from "./database-adapter";
import { GoogleSheetsAdapter } from "./google-sheets-adapter";
import { MockAdapter } from "./mock-adapter";
import { PostgresAdapter } from "./postgres-adapter";

let cachedAdapter: DatabaseAdapter | null = null;

export function getDatabaseAdapter(): DatabaseAdapter {
  if (cachedAdapter) return cachedAdapter;

  const provider = process.env.DATABASE_PROVIDER ?? "mock";

  switch (provider) {
    case "postgres":
      cachedAdapter = new PostgresAdapter();
      break;
    case "google_sheets":
      cachedAdapter = new GoogleSheetsAdapter();
      break;
    default:
      cachedAdapter = new MockAdapter();
      break;
  }

  return cachedAdapter;
}
