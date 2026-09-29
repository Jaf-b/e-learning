"use server"

import { db } from "@/db";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { departments } from "@/db/schema";
import { unstable_cache, updateTag, revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Cached reads
// ---------------------------------------------------------------------------

export const getAllDepartments = unstable_cache(
    async () => {
        try {
            const result = await db.query.departments.findMany({
                orderBy: (departments, { asc }) => [asc(departments.name)],
            });
            return { success: true, data: result ?? [] };
        } catch (error) {
            console.error("Erreur getAllDepartments:", error);
            return { success: false, data: [], error: "Erreur de chargement des départements." };
        }
    },
    ["departments-all"],
    { tags: ["academic-structure"], revalidate: 3600 }
);

export async function getDepartmentsByFaculty(facultyId: string) {
    try {
        const result = await db.query.departments.findMany({
            where: eq(departments.facultyId, facultyId),
            orderBy: (departments, { asc }) => [asc(departments.name)],
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

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createDepartment(data: { facultyId: string; code: string; name: string }) {
    try {
        const payload = {
            facultyId: data.facultyId,
            code: data.code,
            name: data.name,
        };
        const [newDept] = await db.insert(departments).values(payload).returning();
        updateTag("academic-structure");
        updateTag("admin-dashboard");
        revalidatePath("/admin/academic-structure");
        revalidatePath("/admin");
        return { success: true, data: newDept };
    } catch (error: any) {
        console.error("Erreur createDepartment:", error);
        return { success: false, error: error?.message || "Impossible de créer le département." };
    }
}

export async function updateDepartment(
    id: string,
    data: Partial<{ facultyId: string; code: string; name: string }>
) {
    try {
        const payload: Record<string, unknown> = {};
        if (data.facultyId !== undefined) payload.facultyId = data.facultyId;
        if (data.code !== undefined) payload.code = data.code;
        if (data.name !== undefined) payload.name = data.name;

        const [updated] = await db
            .update(departments)
            .set(payload)
            .where(eq(departments.id, id))
            .returning();

        updateTag("academic-structure");
        updateTag("admin-dashboard");
        revalidatePath("/admin/academic-structure");
        revalidatePath("/admin");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Erreur updateDepartment:", error);
        return { success: false, error: error?.message || "Échec de la mise à jour." };
    }
}

export async function deleteDepartment(id: string) {
    try {
        const [deleted] = await db.delete(departments).where(eq(departments.id, id)).returning();
        updateTag("academic-structure");
        updateTag("admin-dashboard");
        revalidatePath("/admin/academic-structure");
        revalidatePath("/admin");
        return { success: true, data: deleted };
    } catch (error: any) {
        console.error("Erreur deleteDepartment:", error);
        return { success: false, error: "Impossible de supprimer le département. Des filières y sont peut-être rattachées." };
    }
}

// ---------------------------------------------------------------------------
// Search helper (not cached — real-time search)
// ---------------------------------------------------------------------------

export async function searchDepartments(searchTerm: string, facultyId?: string) {
    try {
        if (!searchTerm || searchTerm.trim() === "") {
            return { success: true, data: [] };
        }

        const query = searchTerm.trim();

        const textMatch = or(
            ilike(departments.name, `%${query}%`),
            ilike(departments.code, `%${query}%`)
        );

        const whereClause = facultyId
            ? and(eq(departments.facultyId, facultyId), textMatch)
            : textMatch;

        const result = await db.query.departments.findMany({
            where: whereClause,
            with: {
                faculty: true,
                filieres: true,
            },
        });

        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur searchDepartments:", error);
        return { success: false, data: [], error: "Échec de la recherche." };
    }
}