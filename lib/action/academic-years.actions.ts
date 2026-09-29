"use server"

import { db } from "@/db";
import { academicYears } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { unstable_cache, updateTag, revalidatePath } from "next/cache";

// --- CREATE ACADEMIC YEAR (Ex: "2025-2026") ---
export async function createAcademicYear(data: { year: string; isCurrent?: boolean }) {
    try {
        if (data.isCurrent) {
            await db.update(academicYears).set({ isCurrent: false });
        }

        const [newYear] = await db.insert(academicYears).values(data).returning();
        updateTag("academic-years");
        revalidatePath("/admin/user-management");
        return { success: true, data: newYear };
    } catch (error: any) {
        console.error("Erreur createAcademicYear:", error);
        return { success: false, error: error?.message || "Impossible de créer l'année académique." };
    }
}

// --- READ ALL ACADEMIC YEARS ---
export const getAcademicYears = unstable_cache(
    async () => {
        try {
            const result = await db.query.academicYears.findMany({
                orderBy: (academicYears, { desc }) => [desc(academicYears.year)],
            });
            return { success: true, data: result ?? [] };
        } catch (error) {
            console.error("Erreur getAcademicYears:", error);
            return { success: false, data: [] };
        }
    },
    ["academic-years-all"],
    { tags: ["academic-years"], revalidate: 3600 }
);

// --- SET CURRENT ACADEMIC YEAR ---
export async function setCurrentAcademicYear(id: string) {
    try {
        await db.update(academicYears).set({ isCurrent: false });
        const [updated] = await db
            .update(academicYears)
            .set({ isCurrent: true })
            .where(eq(academicYears.id, id))
            .returning();

        updateTag("academic-years");
        revalidatePath("/admin/user-management");
        return { success: true, data: updated };
    } catch (error: any) {
        console.error("Erreur setCurrentAcademicYear:", error);
        return { success: false, error: error?.message || "Impossible de définir l'année courante." };
    }
}