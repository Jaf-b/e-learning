"use server"

import {db} from "@/db";
import {searchFilieres} from "@/lib/action/filieres.actions";
import {searchDepartments} from "@/lib/action/departement.actions";
import { ilike, or, eq } from "drizzle-orm";
import {faculties} from "@/db/schema";

export async function createFaculty(data: { code: string; name: string; description: string | null }) {
    try {
        const [newFaculty] = await db.insert(faculties).values(data).returning();
        return { success: true, data: newFaculty };
    } catch (error) {
        console.error("Erreur createFaculty:", error);
        return { success: false, error: "Impossible de créer la faculté." };
    }
}

export async function updateFaculty(id: string, data: Partial<{ code: string; name: string; description: string | null }>) {
    try {
        const [updated] = await db
            .update(faculties)
            .set(data)
            .where(eq(faculties.id, id))
            .returning();
        return { success: true, data: updated };
    } catch (error) {
        console.error("Erreur updateFaculty:", error);
        return { success: false, error: "Échec de la mise à jour." };
    }
}

export async function getFacultiesWithTree() {
    try {
        const result = await db.query.faculties.findMany({
            with: {
                departments: {
                    with: {
                        filieres: true,
                    },
                },
            },
        });

        return { success: true, data: result };
    } catch (error) {
        // Intercepte les erreurs réseau, de connexion DB, ou d'initialisation
        console.error("Erreur lors de la récupération des facultés :", error);
        return {
            success: false,
            error: "Impossible de récupérer la structure académique.",
            data: []
        };
    }
}

export async function searchFaculties(searchTerm: string, includeTree = false) {
    try {
        if (!searchTerm || searchTerm.trim() === "") {
            return { success: true, data: [] };
        }

        const query = searchTerm.trim();

        const result = await db.query.faculties.findMany({
            where: or(
                ilike(faculties.name, `%${query}%`),
                ilike(faculties.code, `%${query}%`),
                ilike(faculties.description, `%${query}%`)
            ),
            with: includeTree
                ? {
                    departments: {
                        with: {
                            filieres: true,
                        },
                    },
                }
                : undefined,
        });

        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur searchFaculties:", error);
        return { success: false, data: [], error: "Échec de la recherche." };
    }
}

export async function searchAcademicStructure(searchTerm: string) {
    try {
        if (!searchTerm || searchTerm.trim() === "") {
            return {
                success: true,
                data: { faculties: [], departments: [], filieres: [] },
            };
        }

        // Exécution en parallèle pour de meilleures performances
        const [facultiesRes, departmentsRes, filieresRes] = await Promise.all([
            searchFaculties(searchTerm, false),
            searchDepartments(searchTerm),
            searchFilieres(searchTerm),
        ]);

        return {
            success: true,
            data: {
                faculties: facultiesRes.data,
                departments: departmentsRes.data,
                filieres: filieresRes.data,
            },
        };
    } catch (error) {
        console.error("Erreur searchAcademicStructure:", error);
        return {
            success: false,
            data: { faculties: [], departments: [], filieres: [] },
            error: "Erreur lors de la recherche globale.",
        };
    }
}