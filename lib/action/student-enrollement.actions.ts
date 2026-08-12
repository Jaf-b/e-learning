"use server"

import { db } from "@/db";
import { studentEnrollments, creditTransfers, promotions, user } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function enrollStudent(data: {
    studentId: string;
    promotionId: string;
    status?: "ACTIVE" | "PASSED" | "FAILED" | "REORIENTED" | "GRADUATED";
}) {
    try {
        // 1. Vérification si l'étudiant est déjà inscrit dans cette promotion
        const existingEnrollment = await db.query.studentEnrollments.findFirst({
            where: and(
                eq(studentEnrollments.studentId, data.studentId),
                eq(studentEnrollments.promotionId, data.promotionId)
            ),
        });

        if (existingEnrollment) {
            return {
                success: false,
                error: "L'étudiant est déjà inscrit dans cette promotion.",
                data: existingEnrollment,
            };
        }

        // 2. Création de l'inscription
        const [newEnrollment] = await db
            .insert(studentEnrollments)
            .values({
                studentId: data.studentId,
                promotionId: data.promotionId,
                status: data.status ?? "ACTIVE",
            })
            .returning();

        return { success: true, data: newEnrollment };
    } catch (error) {
        console.error("Erreur enrollStudent:", error);
        return { success: false, error: "Échec de l'inscription de l'étudiant." };
    }
}
export async function updateEnrollmentStatus(
    enrollmentId: string,
    status: "ACTIVE" | "PASSED" | "FAILED" | "REORIENTED" | "GRADUATED"
) {
    try {
        const [updated] = await db
            .update(studentEnrollments)
            .set({ status })
            .where(eq(studentEnrollments.id, enrollmentId))
            .returning();

        return { success: true, data: updated };
    } catch (error) {
        console.error("Erreur updateEnrollmentStatus:", error);
        return { success: false, error: "Impossible de mettre à jour le statut d'inscription." };
    }
}
export async function getStudentEnrollmentHistory(studentId: string) {
    try {
        const result = await db.query.studentEnrollments.findMany({
            where: eq(studentEnrollments.studentId, studentId),
            orderBy: (studentEnrollments, { desc }) => [desc(studentEnrollments.enrolledAt)],
            with: {
                promotion: {
                    with: {
                        filiere: true,
                        degreeLevel: {
                            with: {
                                degree: true,
                            },
                        },
                        academicYear: true,
                    },
                },
                grades: true,
            },
        });

        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getStudentEnrollmentHistory:", error);
        return { success: false, data: [], error: "Erreur de chargement de l'historique." };
    }
}

