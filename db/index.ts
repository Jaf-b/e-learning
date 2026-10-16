import dotenv from "dotenv";
import path from "path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const dbPath = path.resolve(process.cwd(), "local.db").replace(/\\/g, "/");
const client = createClient({
  url: process.env.DATABASE_URL?.startsWith("file:")
    ? process.env.DATABASE_URL
    : `file:${dbPath}`,
});

export const db = drizzle(client, { schema });