"use server"

import { db } from "@/db";
import {academicYears} from "@/db/schema";
import {eq} from "drizzle-orm";

// --- CREATE ACADEMIC YEAR (Ex: "2025-2026") ---
export async function createAcademicYear(data: { year: string; isCurrent?: boolean }) {
    try {
        // Si la nouvelle année est définie comme courante, réinitialiser les autres
        if (data.isCurrent) {
            await db.update(academicYears).set({ isCurrent: false });
        }

        const [newYear] = await db.insert(academicYears).values(data).returning();
        return { success: true, data: newYear };
    } catch (error) {
        console.error("Erreur createAcademicYear:", error);
        return { success: false, error: "Impossible de créer l'année académique." };
    }
}

// --- READ ALL ACADEMIC YEARS ---
export async function getAcademicYears() {
    try {
        const result = await db.query.academicYears.findMany({
            orderBy: (academicYears, { desc }) => [desc(academicYears.year)],
        });
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getAcademicYears:", error);
        return { success: false, data: [] };
    }
}

// --- SET CURRENT ACADEMIC YEAR ---
export async function setCurrentAcademicYear(id: string) {
    try {
        await db.update(academicYears).set({ isCurrent: false });
        const [updated] = await db
            .update(academicYears)
            .set({ isCurrent: true })
            .where(eq(academicYears.id, id))
            .returning();
        return { success: true, data: updated };
    } catch (error) {
        console.error("Erreur setCurrentAcademicYear:", error);
        return { success: false, error: "Impossible de définir l'année courante." };
    }
}