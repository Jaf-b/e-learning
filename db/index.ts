
import dotenv from 'dotenv';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// On indique explicitement le chemin vers .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const databaseUrl = process.env.DATABASE_URL;

console.log(databaseUrl)
if (!databaseUrl) {
    throw new Error("❌ DATABASE_URL est manquante dans les variables d'environnement.");
}

const sql = neon(databaseUrl);
export const db = drizzle({ client: sql, schema: schema });