import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Ajustez l'import vers votre config Better Auth

export async function GET() {
    try {
        // Récupère automatiquement la session via le token présent dans les cookies
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Si aucun token valide ou session expirée
        if (!session) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 401 }
            );
        }

        // Renvoie les données de l'utilisateur
        return NextResponse.json({
            user: session.user,
            session: session.session,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}