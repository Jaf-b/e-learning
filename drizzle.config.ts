import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL! || "postgresql://neondb_owner:npg_Bljwkq2FU0Gi@ep-soft-queen-axw2mwsi.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require",
    },
});
