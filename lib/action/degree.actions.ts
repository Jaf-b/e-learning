"use server"

import { db } from "@/db";
import { degrees, degreeLevels, academicYears, promotions } from "@/db/schema";
import { eq, ilike, or, and, asc } from "drizzle-orm";

// --- GET ALL DEGREES ---
export async function getAllDegrees() {
    try {
        const result = await db.query.degrees.findMany();
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getAllDegrees:", error);
        return { success: false, data: [], error: "Erreur de chargement." };
    }
}

// --- GET ALL DEGREE LEVELS ---
export async function getAllDegreeLevels() {
    try {
        const result = await db.query.degreeLevels.findMany();
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getAllDegreeLevels:", error);
        return { success: false, data: [], error: "Erreur de chargement." };
    }
}

// --- CREATE DEGREE ---
export async function createDegree(data: {
    code: string;
    name: string;
    hierarchyRank: number;
    totalCreditsRequired?: number;
}) {
    try {
        const [newDegree] = await db.insert(degrees).values(data).returning();
        return { success: true, data: newDegree };
    } catch (error) {
        console.error("Erreur createDegree:", error);
        return { success: false, error: "Impossible de créer le diplôme." };
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
        return { success: true, data: newLevel };
    } catch (error) {
        console.error("Erreur createDegreeLevel:", error);
        return { success: false, error: "Impossible de créer le niveau de diplôme." };
    }
}

// --- READ (Tous les diplômes avec leurs niveaux ordonnés) ---
export async function getDegreesWithLevels() {
    try {
        const result = await db.query.degrees.findMany({
            orderBy: (degrees, { asc }) => [asc(degrees.hierarchyRank)],
            with: {
                levels: {
                    orderBy: (degreeLevels, { asc }) => [asc(degreeLevels.levelOrder)],
                },
            },
        });
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getDegreesWithLevels:", error);
        return { success: false, data: [], error: "Erreur de chargement." };
    }
}

// --- UPDATE DEGREE ---
export async function updateDegree(
    id: string,
    data: Partial<{ code: string; name: string; hierarchyRank: number; totalCreditsRequired?: number }>
) {
    try {
        const [updated] = await db.update(degrees).set(data).where(eq(degrees.id, id)).returning();
        return { success: true, data: updated };
    } catch (error) {
        console.error("Erreur updateDegree:", error);
        return { success: false, error: "Échec de la mise à jour." };
    }
}

// --- DELETE DEGREE ---
export async function deleteDegree(id: string) {
    try {
        const [deleted] = await db.delete(degrees).where(eq(degrees.id, id)).returning();
        return { success: true, data: deleted };
    } catch (error) {
        console.error("Erreur deleteDegree:", error);
        return { success: false, error: "Impossible de supprimer le diplôme." };
    }
}