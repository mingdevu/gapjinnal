import { neon } from "@neondatabase/serverless";

export type MemoryRow = { id:string; title:string; place:string; owner:string; value:number; image:string; date:string; accent:string; ratingCount:number };
export const PROFILE_NAMES = ["박민영", "최미교", "최보연", "이주연", "이현정"] as const;

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
  await client()`CREATE TABLE IF NOT EXISTS memory_ratings (
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    profile_name TEXT NOT NULL,
    value BIGINT NOT NULL CHECK (value >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (memory_id, profile_name)
  )`;
  await client()`CREATE TABLE IF NOT EXISTS friend_profiles (
    name TEXT PRIMARY KEY,
    photo_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

function mapRow(row: Record<string, unknown>): MemoryRow {
  return {
    id:String(row.id), title:String(row.title), place:String(row.place), owner:String(row.owner),
    value:Number(row.total_value ?? row.value), image:String(row.image_url), accent:String(row.accent),
    ratingCount:Number(row.rating_count ?? 0),
    date:new Intl.DateTimeFormat("ko-KR", {year:"numeric",month:"2-digit",day:"2-digit",timeZone:"Asia/Seoul"}).format(new Date(String(row.created_at))),
  };
}

export async function listMemories() {
  await ensureMemoryTable();
  const rows = await client()`SELECT m.id,m.title,m.place,m.owner,m.image_url,m.accent,m.created_at,
    m.value + COALESCE(SUM(r.value),0) AS total_value, COUNT(r.profile_name) + 1 AS rating_count
    FROM memories m LEFT JOIN memory_ratings r ON r.memory_id=m.id
    GROUP BY m.id ORDER BY m.created_at DESC`;
  return rows.map(mapRow);
}

export async function createMemory(input: {title:string;place:string;owner:string;value:number;image:string}) {
  await ensureMemoryTable();
  const rows = await client()`INSERT INTO memories (title,place,owner,value,image_url)
    VALUES (${input.title},${input.place},${input.owner},${input.value},${input.image})
    RETURNING id,title,place,owner,value,image_url,accent,created_at,0 AS rating_count`;
  return mapRow(rows[0]);
}

export async function rateMemory(memoryId:string, profileName:string, value:number) {
  await ensureMemoryTable();
  if (!PROFILE_NAMES.includes(profileName as typeof PROFILE_NAMES[number])) throw new Error("Invalid profile");
  await client()`INSERT INTO memory_ratings (memory_id,profile_name,value)
    VALUES (${memoryId},${profileName},${value})
    ON CONFLICT (memory_id,profile_name) DO UPDATE SET value=EXCLUDED.value,created_at=NOW()`;
  const ratings=await client()`SELECT profile_name,value FROM memory_ratings WHERE memory_id=${memoryId} ORDER BY created_at`;
  return ratings.map(r=>({profileName:String(r.profile_name),value:Number(r.value)}));
}

export async function listProfiles() {
  await ensureMemoryTable();
  const rows=await client()`SELECT name,photo_url FROM friend_profiles`;
  const photos=new Map(rows.map(r=>[String(r.name),r.photo_url?String(r.photo_url):null]));
  return PROFILE_NAMES.map(name=>({name,photo:photos.get(name)??null}));
}

export async function saveProfilePhoto(name:string, photo:string) {
  await ensureMemoryTable();
  if (!PROFILE_NAMES.includes(name as typeof PROFILE_NAMES[number])) throw new Error("Invalid profile");
  await client()`INSERT INTO friend_profiles (name,photo_url) VALUES (${name},${photo})
    ON CONFLICT (name) DO UPDATE SET photo_url=EXCLUDED.photo_url,updated_at=NOW()`;
  return {name,photo};
}
