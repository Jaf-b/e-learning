"use server"

import { db } from "@/db";
import { promotions } from "@/db/schema";
import {and, eq, ilike} from "drizzle-orm";

// --- CREATE PROMOTION ---
export async function createPromotion(data: {
    filiereId: string;
    degreeLevelId: string;
    academicYearId: string;
    code: string; // Ex: "L3-GL-2025"
}) {
    try {
        const [newPromotion] = await db.insert(promotions).values(data).returning();
        return { success: true, data: newPromotion };
    } catch (error) {
        console.error("Erreur createPromotion:", error);
        return { success: false, error: "Impossible de créer la promotion." };
    }
}

// --- READ ALL PROMOTIONS (Avec détails complets) ---
export async function getPromotions() {
    try {
        const result = await db.query.promotions.findMany({
            with: {
                filiere: {
                    with: {
                        department: {
                            with: {
                                faculty: true,
                            },
                        },
                    },
                },
                degreeLevel: {
                    with: {
                        degree: true,
                    },
                },
                academicYear: true,
                students: true, // Inscriptions des étudiants
                courses: true,  // Cours dispensés à cette promotion
            },
        });
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getPromotions:", error);
        return { success: false, data: [], error: "Échec de récupération des promotions." };
    }
}

// --- SEARCH PROMOTIONS ---
export async function searchPromotions(searchTerm: string, academicYearId?: string) {
    try {
        if (!searchTerm || searchTerm.trim() === "") {
            return { success: true, data: [] };
        }

        const query = searchTerm.trim();
        const textMatch = ilike(promotions.code, `%${query}%`);

        const whereClause = academicYearId
            ? and(eq(promotions.academicYearId, academicYearId), textMatch)
            : textMatch;

        const result = await db.query.promotions.findMany({
            where: whereClause,
            with: {
                filiere: true,
                degreeLevel: true,
                academicYear: true,
            },
        });

        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur searchPromotions:", error);
        return { success: false, data: [] };
    }
}

// --- UPDATE PROMOTION ---
export async function updatePromotion(
    id: string,
    data: Partial<{
        filiereId: string;
        degreeLevelId: string;
        academicYearId: string;
        code: string;
    }>
) {
    try {
        const [updated] = await db
            .update(promotions)
            .set(data)
            .where(eq(promotions.id, id))
            .returning();
        return { success: true, data: updated };
    } catch (error) {
        console.error("Erreur updatePromotion:", error);
        return { success: false, error: "Échec de la mise à jour." };
    }
}

// --- DELETE PROMOTION ---
export async function deletePromotion(id: string) {
    try {
        const [deleted] = await db.delete(promotions).where(eq(promotions.id, id)).returning();
        return { success: true, data: deleted };
    } catch (error) {
        console.error("Erreur deletePromotion:", error);
        return { success: false, error: "Impossible de supprimer la promotion." };
    }
}