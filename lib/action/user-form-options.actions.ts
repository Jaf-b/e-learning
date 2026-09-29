"use server";

import { asc } from "drizzle-orm";
import { db } from "@/db";
import {
    academicYears,
    degreeLevels,
    degrees,
    departments,
    faculties,
    filieres,
    promotions,
} from "@/db/schema";

export async function getUserFormOptions() {
    try {
        const [
            facultyOptions,
            departmentOptions,
            filiereOptions,
            promotionOptions,
            degreeOptions,
            degreeLevelOptions,
            academicYearOptions,
        ] = await Promise.all([
            db.select().from(faculties).orderBy(asc(faculties.name)),
            db.select().from(departments).orderBy(asc(departments.name)),
            db.select().from(filieres).orderBy(asc(filieres.name)),
            db.select().from(promotions).orderBy(asc(promotions.code)),
            db.select().from(degrees).orderBy(asc(degrees.hierarchyRank)),
            db.select().from(degreeLevels).orderBy(asc(degreeLevels.levelOrder)),
            db.select().from(academicYears).orderBy(asc(academicYears.year)),
        ]);

        return {
            success: true as const,
            data: {
                faculties: facultyOptions,
                departments: departmentOptions,
                filieres: filiereOptions,
                promotions: promotionOptions,
                degrees: degreeOptions,
                degreeLevels: degreeLevelOptions,
                academicYears: academicYearOptions,
            },
        };
    } catch (error) {
        console.error("Erreur getUserFormOptions:", error);
        return {
            success: false as const,
            error: "Impossible de charger les options du formulaire utilisateur.",
        };
    }
}
