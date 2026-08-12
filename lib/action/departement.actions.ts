"use server"

import { db } from "@/db";
import {and, eq, ilike, or} from "drizzle-orm";
import {departments} from "@/db/schema";

// --- GET ALL ---
export async function getAllDepartments() {
    try {
        const result = await db.query.departments.findMany();
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getAllDepartments:", error);
        return { success: false, data: [], error: "Erreur de chargement." };
    }
}

// --- CREATE ---
export async function createDepartment(data: { facultyId: string; code: string; name: string }) {
    try {
        const [newDept] = await db.insert(departments).values(data).returning();
        return { success: true, data: newDept };
    } catch (error) {
        console.error("Erreur createDepartment:", error);
        return { success: false, error: "Impossible de créer le département." };
    }
}

// --- READ (Départements d'une faculté spécifique) ---
export async function getDepartmentsByFaculty(facultyId: string) {
    try {
        const result = await db.query.departments.findMany({
            where: eq(departments.facultyId, facultyId),
            with: {
                filieres: true,
            },
        });
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getDepartmentsByFaculty:", error);
        return { success: false, data: [], error: "Erreur de chargement." };
    }
}

// --- UPDATE ---
export async function updateDepartment(
    id: string,
    data: Partial<{ facultyId: string; code: string; name: string }>
) {
    try {
        const [updated] = await db
            .update(departments)
            .set(data)
            .where(eq(departments.id, id))
            .returning();
        return { success: true, data: updated };
    } catch (error) {
        console.error("Erreur updateDepartment:", error);
        return { success: false, error: "Échec de la mise à jour." };
    }
}

// --- DELETE ---
export async function deleteDepartment(id: string) {
    try {
        const [deleted] = await db.delete(departments).where(eq(departments.id, id)).returning();
        return { success: true, data: deleted };
    } catch (error) {
        console.error("Erreur deleteDepartment:", error);
        return { success: false, error: "Impossible de supprimer le département." };
    }
}

export async function searchDepartments(searchTerm: string, facultyId?: string) {
    try {
        if (!searchTerm || searchTerm.trim() === "") {
            return { success: true, data: [] };
        }

        const query = searchTerm.trim();

        // Condition de texte : correspond au code OU au nom
        const textMatch = or(
            ilike(departments.name, `%${query}%`),
            ilike(departments.code, `%${query}%`)
        );

        // Si facultyId est fourni, on combine avec AND
        const whereClause = facultyId
            ? and(eq(departments.facultyId, facultyId), textMatch)
            : textMatch;

        const result = await db.query.departments.findMany({
            where: whereClause,
            with: {
                faculty: true, // Inclut les infos de la faculté parente
                filieres: true, // Inclut les filières rattachées
            },
        });

        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur searchDepartments:", error);
        return { success: false, data: [], error: "Échec de la recherche." };
    }
}