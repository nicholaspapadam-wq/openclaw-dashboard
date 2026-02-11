import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

// Initialize tables (prefixed with oc_ to avoid conflicts)
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS oc_activities (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS oc_cron_snapshots (
      id SERIAL PRIMARY KEY,
      jobs JSONB NOT NULL,
      captured_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_oc_activities_timestamp ON oc_activities(timestamp DESC)
  `;
}

// Activity functions
export async function logActivity(
  type: string,
  title: string,
  description?: string,
  metadata?: Record<string, unknown>
) {
  await sql`
    INSERT INTO oc_activities (type, title, description, metadata)
    VALUES (${type}, ${title}, ${description || null}, ${JSON.stringify(metadata || {})})
  `;
}

export async function getActivities(limit = 50, type?: string) {
  if (type && type !== "all") {
    return sql`
      SELECT * FROM oc_activities 
      WHERE type = ${type}
      ORDER BY timestamp DESC 
      LIMIT ${limit}
    `;
  }
  return sql`
    SELECT * FROM oc_activities 
    ORDER BY timestamp DESC 
    LIMIT ${limit}
  `;
}

// Cron snapshot functions
export async function saveCronSnapshot(jobs: unknown[]) {
  await sql`
    INSERT INTO oc_cron_snapshots (jobs)
    VALUES (${JSON.stringify(jobs)})
  `;
}

export async function getLatestCronSnapshot() {
  const result = await sql`
    SELECT * FROM oc_cron_snapshots 
    ORDER BY captured_at DESC 
    LIMIT 1
  `;
  return result[0];
}
