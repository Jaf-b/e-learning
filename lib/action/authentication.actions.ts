"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface LoginData {
    email: string;
    password: string;
    callbackUrl: string;
}

export async function Loging(Data: LoginData) {
    try {
        const session = await auth.api.signInEmail({
            body: {
                email: Data.email,
                password: Data.password,
                callbackURL: Data.callbackUrl,
            },
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, error: "Identifiants invalides." };
        }

        return {
            success: true,
            user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                role: (session.user as any).role ?? "STUDENT",
            },
        };
    } catch (e: any) {
        console.error("login error from server action", e);
        const message = e?.body?.message || e?.message || "Identifiants invalides.";
        return { success: false, error: message };
    }
}