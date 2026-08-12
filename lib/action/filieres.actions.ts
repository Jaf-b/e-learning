"use server"

import { db } from "@/db";
import { filieres } from "@/db/schema";
import {and, eq, ilike, or} from "drizzle-orm";

// --- GET ALL ---
export async function getAllFilieres() {
    try {
        const result = await db.query.filieres.findMany();
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getAllFilieres:", error);
        return { success: false, data: [], error: "Erreur de chargement." };
    }
}

// --- CREATE ---
export async function createFiliere(data: { departmentId: string; code: string; name: string }) {
    try {
        const [newFiliere] = await db.insert(filieres).values(data).returning();
        return { success: true, data: newFiliere };
    } catch (error) {
        console.error("Erreur createFiliere:", error);
        return { success: false, error: "Impossible de créer la filière." };
    }
}

// --- READ (Filières d'un département spécifique) ---
export async function getFilieresByDepartment(departmentId: string) {
    try {
        const result = await db.query.filieres.findMany({
            where: eq(filieres.departmentId, departmentId),
        });
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getFilieresByDepartment:", error);
        return { success: false, data: [], error: "Erreur de chargement." };
    }
}

// --- UPDATE ---
export async function updateFiliere(
    id: string,
    data: Partial<{ departmentId: string; code: string; name: string }>
) {
    try {
        const [updated] = await db
            .update(filieres)
            .set(data)
            .where(eq(filieres.id, id))
            .returning();
        return { success: true, data: updated };
    } catch (error) {
        console.error("Erreur updateFiliere:", error);
        return { success: false, error: "Échec de la mise à jour." };
    }
}

// --- DELETE ---
export async function deleteFiliere(id: string) {
    try {
        const [deleted] = await db.delete(filieres).where(eq(filieres.id, id)).returning();
        return { success: true, data: deleted };
    } catch (error) {
        console.error("Erreur deleteFiliere:", error);
        return { success: false, error: "Impossible de supprimer la filière." };
    }
}
export async function searchFilieres(searchTerm: string, departmentId?: string) {
    try {
        if (!searchTerm || searchTerm.trim() === "") {
            return { success: true, data: [] };
        }

        const query = searchTerm.trim();

        const textMatch = or(
            ilike(filieres.name, `%${query}%`),
            ilike(filieres.code, `%${query}%`)
        );

        const whereClause = departmentId
            ? and(eq(filieres.departmentId, departmentId), textMatch)
            : textMatch;

        const result = await db.query.filieres.findMany({
            where: whereClause,
            with: {
                department: {
                    with: {
                        faculty: true, // Remonte toute la chaîne hiérarchique (Filière -> Dept -> Faculté)
                    },
                },
            },
        });

        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur searchFilieres:", error);
        return { success: false, data: [], error: "Échec de la recherche." };
    }
}