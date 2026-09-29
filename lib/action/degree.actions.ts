"use server"

import { db } from "@/db";
import { degrees, degreeLevels } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { unstable_cache, updateTag, revalidatePath } from "next/cache";

// --- GET ALL DEGREES ---
export const getAllDegrees = unstable_cache(
    async () => {
        try {
            const result = await db.query.degrees.findMany({
                orderBy: (degrees, { asc }) => [asc(degrees.hierarchyRank)],
            });
            return { success: true, data: result ?? [] };
        } catch (error) {
            console.error("Erreur getAllDegrees:", error);
            return { success: false, data: [], error: "Erreur de chargement." };
        }
    },
    ["degrees-all"],
    { tags: ["degrees"], revalidate: 3600 }
);

// --- GET ALL DEGREE LEVELS ---
export const getAllDegreeLevels = unstable_cache(
    async () => {
        try {
            const result = await db.query.degreeLevels.findMany({
                orderBy: (degreeLevels, { asc }) => [asc(degreeLevels.levelOrder)],
            });
            return { success: true, data: result ?? [] };
        } catch (error) {
            console.error("Erreur getAllDegreeLevels:", error);
            return { success: false, data: [], error: "Erreur de chargement." };
        }
    },
    ["degree-levels-all"],
    { tags: ["degrees"], revalidate: 3600 }
);

// --- READ (Tous les diplômes avec leurs niveaux ordonnés) ---
export const getDegreesWithLevels = unstable_cache(
    async () => {
        try {
            const result = await db.query.degrees.findMany({
                orderBy: (degrees, { asc }) => [asc(degrees.hierarchyRank)],
                with: {
                    levels: {
                        orderBy: (dl: any, ops: any) => [ops.asc(dl.levelOrder)],
                    },
                },
            });
            return { success: true, data: result ?? [] };
        } catch (error) {
            console.error("Erreur getDegreesWithLevels:", error);
            return { success: false, data: [], error: "Erreur de chargement." };
        }
    },
    ["degrees-with-levels"],
    { tags: ["degrees"], revalidate: 3600 }
);

// --- CREATE DEGREE ---
export async function createDegree(data: {
    code: string;
    name: string;
    hierarchyRank: number;
    totalCreditsRequired?: number;
}) {
    try {
        const [newDegree] = await db.insert(degrees).values(data).returning();
        updateTag("degrees");
        revalidatePath("/admin/courses");
        revalidatePath("/admin/academic-structure");
        return { success: true, data: newDegree };
    } catch (error: any) {
        console.error("Erreur createDegree:", error);
        return { success: false, error: error?.message || "Impossible de créer le diplôme." };
    }
}

// --- CREATE DEGREE LEVEL (Ex: L1, L2 pour Licence) ---
export async function createDegreeLevel(data: {
    degreeId: string;
    code: string;
    name: string;
    levelOrder: number;
}) {
    try {
        const [newLevel] = await db.insert(degreeLevels).values(data).returning();
        updateTag("degrees");
        revalidatePath("/admin/courses");
        revalidatePath("/admin/academic-structure");
        return { success: true, data: newLevel };
    } catch (error: any) {
        console.error("Erreur createDegreeLevel:", error);
        return { success: false, error: error?.message || "Impossible de créer le niveau de diplôme." };
    }
}

// --- UPDATE DEGREE ---
export async function updateDegree(
    id: string,
    data: Partial<{ code: string; name: string; hierarchyRank: number; totalCreditsRequired?: number }>
) {
    try {
        const [updated] = await db.update(degrees).set(data).where(eq(degrees.id, id)).returning();
        updateTag("degrees");
        revalidatePath("/admin/courses");
        revalidatePath("/admin/academic-structure");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Erreur updateDegree:", error);
        return { success: false, error: error?.message || "Échec de la mise à jour." };
    }
}

// --- DELETE DEGREE ---
export async function deleteDegree(id: string) {
    try {
        const [deleted] = await db.delete(degrees).where(eq(degrees.id, id)).returning();
        updateTag("degrees");
        revalidatePath("/admin/courses");
        revalidatePath("/admin/academic-structure");
        return { success: true, data: deleted };
    } catch (error: any) {
        console.error("Erreur deleteDegree:", error);
        return { success: false, error: error?.message || "Impossible de supprimer le diplôme." };
    }
}