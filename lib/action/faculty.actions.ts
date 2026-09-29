"use server"

import { db } from "@/db";
import { searchFilieres } from "@/lib/action/filieres.actions";
import { searchDepartments } from "@/lib/action/departement.actions";
import { ilike, or, eq, asc } from "drizzle-orm";
import { faculties } from "@/db/schema";
import { unstable_cache, updateTag, revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Cached reads
// ---------------------------------------------------------------------------

export const getFacultiesWithTree = unstable_cache(
    async () => {
        try {
            const result = await db.query.faculties.findMany({
                orderBy: (faculties, { asc }) => [asc(faculties.name)],
                with: {
                    departments: {
                        orderBy: (departments, { asc }) => [asc(departments.name)],
                        with: {
                            filieres: {
                                orderBy: (filieres, { asc }) => [asc(filieres.name)],
                            },
                        },
                    },
                },
            });
            return { success: true, data: result ?? [] };
        } catch (error) {
            console.error("Erreur getFacultiesWithTree:", error);
            return { success: false, data: [], error: "Impossible de récupérer la structure académique." };
        }
    },
    ["academic-structure-tree"],
    { tags: ["academic-structure"], revalidate: 3600 }
);

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createFaculty(data: { code: string; name: string; description: string | null }) {
    try {
        const payload = {
            code: data.code,
            name: data.name,
            description: data.description || null,
        };
        const [newFaculty] = await db.insert(faculties).values(payload).returning();
        updateTag("academic-structure");
        updateTag("admin-dashboard");
        revalidatePath("/admin/academic-structure");
        revalidatePath("/admin");
        return { success: true, data: newFaculty };
    } catch (error: any) {
        console.error("Erreur createFaculty:", error);
        return { success: false, error: error?.message || "Impossible de créer la faculté." };
    }
}

export async function updateFaculty(
    id: string,
    data: Partial<{ code: string; name: string; description: string | null }>
) {
    try {
        const payload: Record<string, unknown> = {};
        if (data.code !== undefined) payload.code = data.code;
        if (data.name !== undefined) payload.name = data.name;
        if (data.description !== undefined) payload.description = data.description || null;

        const [updated] = await db
            .update(faculties)
            .set(payload)
            .where(eq(faculties.id, id))
            .returning();

        updateTag("academic-structure");
        updateTag("admin-dashboard");
        revalidatePath("/admin/academic-structure");
        revalidatePath("/admin");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Erreur updateFaculty:", error);
        return { success: false, error: error?.message || "Échec de la mise à jour." };
    }
}

export async function deleteFaculty(id: string) {
    try {
        const [deleted] = await db.delete(faculties).where(eq(faculties.id, id)).returning();
        updateTag("academic-structure");
        updateTag("admin-dashboard");
        revalidatePath("/admin/academic-structure");
        revalidatePath("/admin");
        return { success: true, data: deleted };
    } catch (error: any) {
        console.error("Erreur deleteFaculty:", error);
        return { success: false, error: "Impossible de supprimer la faculté. Des départements y sont peut-être rattachés." };
    }
}

// ---------------------------------------------------------------------------
// Search helpers (not cached — real-time search)
// ---------------------------------------------------------------------------

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