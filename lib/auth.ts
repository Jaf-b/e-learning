import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { admin } from "better-auth/plugins";
import {db} from "@/db";
import * as schema from "@/db/schema";
import {eq} from "drizzle-orm";
import {nextCookies} from "better-auth/next-js";

export const auth = betterAuth({

    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema
        // or "pg" or "mysql"
    }),
    user:{
        additionalFields:{
            role: {
                type: "string",
                defaultValue: "STUDENT",
                input: true,
            },
            isActive: {
                type: "boolean",
                defaultValue: true,
                input: false,
            },
            lastLoginAt: {
                type: "date",
                input: false,
            },
        }
    },
    databaseHooks: {
        user:{
            create:{
                after: async (user) => {
                    await db
                        .update(schema.user)
                        .set({ lastLoginAt: new Date() })
                        .where(eq(schema.user.id, user.id));
                }
            }
        }
    },

    emailAndPassword: {
        enabled: true,
        // Optional: autoSignInAfterSignUp: true,
        // Optional: requireEmailVerification: true,
    },
    //... the rest of your config
    secret: process.env.BETTER_AUTH_SECRET,
    plugins: [nextCookies(), admin()]
});
