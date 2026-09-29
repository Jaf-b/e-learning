"use server"

import { db } from "@/db";
import { filieres } from "@/db/schema";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { unstable_cache, updateTag, revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Cached reads
// ---------------------------------------------------------------------------

export const getAllFilieres = unstable_cache(
    async () => {
        try {
            const result = await db.query.filieres.findMany({
                orderBy: (filieres, { asc }) => [asc(filieres.name)],
            });
            return { success: true, data: result ?? [] };
        } catch (error) {
            console.error("Erreur getAllFilieres:", error);
            return { success: false, data: [], error: "Erreur de chargement des filières." };
        }
    },
    ["filieres-all"],
    { tags: ["academic-structure"], revalidate: 3600 }
);

export async function getFilieresByDepartment(departmentId: string) {
    try {
        const result = await db.query.filieres.findMany({
            where: eq(filieres.departmentId, departmentId),
            orderBy: (filieres, { asc }) => [asc(filieres.name)],
        });
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getFilieresByDepartment:", error);
        return { success: false, data: [], error: "Erreur de chargement." };
    }
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createFiliere(data: { departmentId: string; code: string; name: string }) {
    try {
        const payload = {
            departmentId: data.departmentId,
            code: data.code,
            name: data.name,
        };
        const [newFiliere] = await db.insert(filieres).values(payload).returning();
        updateTag("academic-structure");
        updateTag("admin-dashboard");
        revalidatePath("/admin/academic-structure");
        revalidatePath("/admin");
        return { success: true, data: newFiliere };
    } catch (error: any) {
        console.error("Erreur createFiliere:", error);
        return { success: false, error: error?.message || "Impossible de créer la filière." };
    }
}

export async function updateFiliere(
    id: string,
    data: Partial<{ departmentId: string; code: string; name: string }>
) {
    try {
        const payload: Record<string, unknown> = {};
        if (data.departmentId !== undefined) payload.departmentId = data.departmentId;
        if (data.code !== undefined) payload.code = data.code;
        if (data.name !== undefined) payload.name = data.name;

        const [updated] = await db
            .update(filieres)
            .set(payload)
            .where(eq(filieres.id, id))
            .returning();

        updateTag("academic-structure");
        updateTag("admin-dashboard");
        revalidatePath("/admin/academic-structure");
        revalidatePath("/admin");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Erreur updateFiliere:", error);
        return { success: false, error: error?.message || "Échec de la mise à jour." };
    }
}

export async function deleteFiliere(id: string) {
    try {
        const [deleted] = await db.delete(filieres).where(eq(filieres.id, id)).returning();
        updateTag("academic-structure");
        updateTag("admin-dashboard");
        revalidatePath("/admin/academic-structure");
        revalidatePath("/admin");
        return { success: true, data: deleted };
    } catch (error: any) {
        console.error("Erreur deleteFiliere:", error);
        return { success: false, error: "Impossible de supprimer la filière. Des cours y sont peut-être rattachés." };
    }
}

// ---------------------------------------------------------------------------
// Search helper (not cached — real-time search)
// ---------------------------------------------------------------------------

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
                        faculty: true,
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