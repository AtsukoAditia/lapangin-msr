import type { DatabaseAdapter } from "./database-adapter";
import { GoogleSheetsAdapter } from "./google-sheets-adapter";
import { PostgresAdapter } from "./postgres-adapter";

export function getDatabaseAdapter(): DatabaseAdapter {
  const provider = process.env.DATABASE_PROVIDER ?? "google_sheets";

  if (provider === "postgres") {
    return new PostgresAdapter();
  }

  return new GoogleSheetsAdapter();
}
