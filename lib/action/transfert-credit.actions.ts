"use server"

import {db} from "@/db";
import {creditTransfers, studentEnrollments} from "@/db/schema";
import {and, eq} from "drizzle-orm";

export async function transferStudentCredits(data: {
    studentId: string;
    fromPromotionId?: string;
    toPromotionId: string;
    transferredCredits: number;
    reason?: string;
    updateOldEnrollmentStatus?: boolean; // Passe l'ancienne inscription en REORIENTED si true
}) {
    try {
        // Utilisation d'une transaction SQL atomique
        const transactionResult = await db.transaction(async (tx) => {
            // 1. Enregistrer l'opération de transfert de crédits
            const [transferRecord] = await tx
                .insert(creditTransfers)
                .values({
                    studentId: data.studentId,
                    fromPromotionId: data.fromPromotionId ?? null,
                    toPromotionId: data.toPromotionId,
                    transferredCredits: data.transferredCredits,
                    reason: data.reason ?? null,
                })
                .returning();

            // 2. Optionnel : Mettre à jour le statut de l'ancienne inscription
            if (data.fromPromotionId && data.updateOldEnrollmentStatus) {
                await tx
                    .update(studentEnrollments)
                    .set({ status: "REORIENTED" })
                    .where(
                        and(
                            eq(studentEnrollments.studentId, data.studentId),
                            eq(studentEnrollments.promotionId, data.fromPromotionId)
                        )
                    );
            }

            // 3. Inscrire l'étudiant dans la nouvelle promotion si pas encore inscrit
            const existingNewEnrollment = await tx.query.studentEnrollments.findFirst({
                where: and(
                    eq(studentEnrollments.studentId, data.studentId),
                    eq(studentEnrollments.promotionId, data.toPromotionId)
                ),
            });

            let newEnrollment = existingNewEnrollment;
            if (!existingNewEnrollment) {
                [newEnrollment] = await tx
                    .insert(studentEnrollments)
                    .values({
                        studentId: data.studentId,
                        promotionId: data.toPromotionId,
                        status: "ACTIVE",
                    })
                    .returning();
            }

            return { transferRecord, newEnrollment };
        });

        return { success: true, data: transactionResult };
    } catch (error) {
        console.error("Erreur transferStudentCredits:", error);
        return { success: false, error: "Échec du transfert de crédits." };
    }
}
export async function getStudentCreditTransfers(studentId: string) {
    try {
        const result = await db.query.creditTransfers.findMany({
            where: eq(creditTransfers.studentId, studentId),
            orderBy: (creditTransfers, { desc }) => [desc(creditTransfers.createdAt)],
            with: {
                fromPromotion: {
                    with: { filiere: true, degreeLevel: true, academicYear: true },
                },
                toPromotion: {
                    with: { filiere: true, degreeLevel: true, academicYear: true },
                },
            },
        });

        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getStudentCreditTransfers:", error);
        return { success: false, data: [] };
    }
}