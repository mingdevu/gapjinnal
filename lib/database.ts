import { neon } from "@neondatabase/serverless";

export type MemoryRow = { id:string; title:string; place:string; owner:string; value:number; image:string; date:string; accent:string };

function client() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  return neon(process.env.DATABASE_URL);
}

export async function ensureMemoryTable() {
  await client()`CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL, place TEXT NOT NULL, owner TEXT NOT NULL,
    value BIGINT NOT NULL CHECK (value >= 0), image_url TEXT NOT NULL,
    accent TEXT NOT NULL DEFAULT '#7655f6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

function mapRow(row: Record<string, unknown>): MemoryRow {
  return {
    id:String(row.id), title:String(row.title), place:String(row.place), owner:String(row.owner),
    value:Number(row.value), image:String(row.image_url), accent:String(row.accent),
    date:new Intl.DateTimeFormat("ko-KR", {year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Asia/Seoul"}).format(new Date(String(row.created_at))),
  };
}

export async function listMemories() {
  await ensureMemoryTable();
  const rows = await client()`SELECT id,title,place,owner,value,image_url,accent,created_at FROM memories ORDER BY created_at DESC`;
  return rows.map(mapRow);
}

export async function createMemory(input: {title:string;place:string;owner:string;value:number;image:string}) {
  await ensureMemoryTable();
  const rows = await client()`INSERT INTO memories (title,place,owner,value,image_url)
    VALUES (${input.title},${input.place},${input.owner},${input.value},${input.image})
    RETURNING id,title,place,owner,value,image_url,accent,created_at`;
  return mapRow(rows[0]);
}
