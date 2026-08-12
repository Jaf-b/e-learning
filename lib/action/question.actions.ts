"use server"

import { db } from "@/db";
import { questions, questionOptions, assessments, promotionCourses, courses, promotions } from "@/db/schema";
import { eq, and, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Récupère les informations d'un cours ou d'une évaluation pour l'éditeur de quiz
 */
export async function getQuizInitialData(id: string) {
    try {
        // Check if `id` is an assessment ID
        const existingAssessment = await db.query.assessments.findFirst({
            where: eq(assessments.id, id),
            with: {
                promotionCourse: {
                    with: {
                        course: true,
                    },
                },
                questions: {
                    with: {
                        options: true,
                    },
                    orderBy: (questions, { asc }) => [asc(questions.orderIndex)],
                },
            },
        });

        if (existingAssessment) {
            const courseId = existingAssessment.promotionCourse.courseId;

            // Récupérer toutes les évaluations de ce cours pour connaître les types déjà pris
            const allCoursePromotions = await db.query.promotionCourses.findMany({
                where: eq(promotionCourses.courseId, courseId),
                columns: { id: true },
            });
            const promotionCourseIds = allCoursePromotions.map((pc) => pc.id);

            let existingTypes: string[] = [];
            if (promotionCourseIds.length > 0) {
                const otherAssessments = await db.query.assessments.findMany({
                    where: inArray(assessments.promotionCourseId, promotionCourseIds),
                });
                existingTypes = otherAssessments.map((a) => a.type);
            }

            return {
                success: true,
                isExistingAssessment: true,
                assessment: existingAssessment,
                course: existingAssessment.promotionCourse.course,
                existingTypes,
            };
        }

        // Sinon, `id` est présumé être un `courseId`
        const course = await db.query.courses.findFirst({
            where: eq(courses.id, id),
        });

        if (!course) {
            return { success: false, error: "Cours ou évaluation introuvable." };
        }

        // Récupérer les types d'évaluations déjà créées pour ce cours
        const allCoursePromotions = await db.query.promotionCourses.findMany({
            where: eq(promotionCourses.courseId, id),
            columns: { id: true },
        });
        const promotionCourseIds = allCoursePromotions.map((pc) => pc.id);

        let existingTypes: string[] = [];
        if (promotionCourseIds.length > 0) {
            const existingCourseAssessments = await db.query.assessments.findMany({
                where: inArray(assessments.promotionCourseId, promotionCourseIds),
            });
            existingTypes = existingCourseAssessments.map((a) => a.type);
        }

        return {
            success: true,
            isExistingAssessment: false,
            assessment: null,
            course,
            existingTypes,
        };
    } catch (error) {
        console.error("Erreur getQuizInitialData:", error);
        return { success: false, error: "Échec de récupération des données." };
    }
}

/**
 * Crée une évaluation pour un cours en garantissant l'unicité de QUIZ et EXAM
 */
export async function createAssessmentForCourse(courseId: string, data: {
    title: string;
    description?: string;
    type: "QUIZ" | "EXAM" | "RETAKE_EXAM" | "TP" | "ASSIGNMENT";
    maxScore?: string;
    weight?: string;
    dueDate?: string;
}) {
    try {
        // 1. Obtenir ou créer une liaison promotionCourse pour ce cours
        let promotionCourse = await db.query.promotionCourses.findFirst({
            where: eq(promotionCourses.courseId, courseId),
        });

        if (!promotionCourse) {
            // Chercher une promotion existante par défaut
            const defaultPromotion = await db.query.promotions.findFirst();
            if (!defaultPromotion) {
                return { success: false, error: "Aucune promotion trouvée dans le système pour rattacher le cours." };
            }

            const [newPc] = await db.insert(promotionCourses).values({
                courseId,
                promotionId: defaultPromotion.id,
                semester: "S1",
            }).returning();
            promotionCourse = newPc;
        }

        // 2. Vérifier les contraintes d'unicité selon le type d'évaluation
        if (data.type === "QUIZ" || data.type === "EXAM" || data.type === "RETAKE_EXAM") {
            const allCoursePromotions = await db.query.promotionCourses.findMany({
                where: eq(promotionCourses.courseId, courseId),
                columns: { id: true },
            });
            const promotionCourseIds = allCoursePromotions.map((pc) => pc.id);

            if (promotionCourseIds.length > 0) {
                const existing = await db.query.assessments.findFirst({
                    where: and(
                        inArray(assessments.promotionCourseId, promotionCourseIds),
                        eq(assessments.type, data.type)
                    ),
                });

                if (existing) {
                    const label = data.type === "QUIZ" ? "un quiz" : data.type === "EXAM" ? "un examen" : "un examen de rattrapage";
                    return {
                        success: false,
                        error: `Vous ne pouvez créer qu'${label} par cours. Une évaluation de ce type existe déjà.`,
                    };
                }
            }
        }

        // 3. Créer l'évaluation
        const [newAssessment] = await db.insert(assessments).values({
            title: data.title,
            description: data.description || "",
            type: data.type,
            promotionCourseId: promotionCourse.id,
            maxScore: data.maxScore || "20.00",
            weight: data.weight || "1.00",
            dueDate: data.dueDate || null,
        }).returning();

        revalidatePath(`/teacher/courses/${courseId}`);
        revalidatePath(`/teacher/create-quiz/${newAssessment.id}`);

        return { success: true, data: newAssessment };
    } catch (error) {
        console.error("Erreur createAssessmentForCourse:", error);
        return { success: false, error: "Impossible de créer l'évaluation." };
    }
}

/**
 * Met à jour une évaluation existante
 */
export async function updateAssessment(assessmentId: string, data: {
    title?: string;
    description?: string;
    type?: "QUIZ" | "EXAM" | "RETAKE_EXAM" | "TP" | "ASSIGNMENT";
    maxScore?: string;
    weight?: string;
    dueDate?: string;
}) {
    try {
        const existingAssessment = await db.query.assessments.findFirst({
            where: eq(assessments.id, assessmentId),
            with: { promotionCourse: true },
        });

        if (!existingAssessment) {
            return { success: false, error: "Évaluation introuvable." };
        }

        // Si le type change vers QUIZ ou EXAM, vérifier qu'un autre n'existe pas déjà
        if (data.type && data.type !== existingAssessment.type && (data.type === "QUIZ" || data.type === "EXAM")) {
            const courseId = existingAssessment.promotionCourse.courseId;
            const allCoursePromotions = await db.query.promotionCourses.findMany({
                where: eq(promotionCourses.courseId, courseId),
                columns: { id: true },
            });
            const promotionCourseIds = allCoursePromotions.map((pc) => pc.id);

            if (promotionCourseIds.length > 0) {
                const duplicate = await db.query.assessments.findFirst({
                    where: and(
                        inArray(assessments.promotionCourseId, promotionCourseIds),
                        eq(assessments.type, data.type),
                        ne(assessments.id, assessmentId)
                    ),
                });

                if (duplicate) {
                    const label = data.type === "QUIZ" ? "un quiz" : "un examen";
                    return {
                        success: false,
                        error: `Impossible de changer le type. Vous ne pouvez avoir qu'${label} par cours.`,
                    };
                }
            }
        }

        const [updated] = await db.update(assessments)
            .set({
                ...(data.title !== undefined && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.type !== undefined && { type: data.type }),
                ...(data.maxScore !== undefined && { maxScore: data.maxScore }),
                ...(data.weight !== undefined && { weight: data.weight }),
                ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
                updatedAt: new Date(),
            })
            .where(eq(assessments.id, assessmentId))
            .returning();

        revalidatePath(`/teacher/courses/${existingAssessment.promotionCourse.courseId}`);
        revalidatePath(`/teacher/create-quiz/${assessmentId}`);

        return { success: true, data: updated };
    } catch (error) {
        console.error("Erreur updateAssessment:", error);
        return { success: false, error: "Échec de mise à jour de l'évaluation." };
    }
}

/**
 * Récupère toutes les questions avec leurs options pour une évaluation
 */
export async function getQuestionsByAssessmentId(assessmentId: string) {
    try {
        const result = await db.query.questions.findMany({
            where: eq(questions.assessmentId, assessmentId),
            with: {
                options: {
                    orderBy: (options, { asc }) => [asc(options.orderIndex)],
                },
            },
            orderBy: (questions, { asc }) => [asc(questions.orderIndex)],
        });

        return { success: true, data: result };
    } catch (error) {
        console.error("Erreur getQuestionsByAssessmentId:", error);
        return { success: false, data: [], error: "Échec du chargement des questions." };
    }
}

/**
 * Supprime une évaluation
 */
export async function deleteAssessment(assessmentId: string) {
    try {
        const existingAssessment = await db.query.assessments.findFirst({
            where: eq(assessments.id, assessmentId),
            with: { promotionCourse: true },
        });

        await db.delete(assessments).where(eq(assessments.id, assessmentId));

        if (existingAssessment?.promotionCourse?.courseId) {
            revalidatePath(`/teacher/courses/${existingAssessment.promotionCourse.courseId}`);
        }
        return { success: true };
    } catch (error) {
        console.error("Erreur deleteAssessment:", error);
        return { success: false, error: "Impossible de supprimer l'évaluation." };
    }
}

export async function createQuestion(assessmentId: string, data: any) {

    try {
        const { options, ...questionData } = data;

        // Récupérer le nombre total de questions existantes pour définir orderIndex
        const existingQuestions = await db.query.questions.findMany({
            where: eq(questions.assessmentId, assessmentId),
        });

        const [newQuestion] = await db.insert(questions).values({
            ...questionData,
            assessmentId,
            orderIndex: questionData.orderIndex ?? existingQuestions.length,
        }).returning();

        if (options && options.length > 0) {
            const optionsData = options.map((option: any, idx: number) => ({
                questionId: newQuestion.id,
                optionText: option.optionText || "",
                isCorrect: Boolean(option.isCorrect),
                orderIndex: idx,
            }));
            await db.insert(questionOptions).values(optionsData);
        }

        revalidatePath(`/teacher/create-quiz/${assessmentId}`);
        return { success: true, data: newQuestion };
    } catch (error) {
        console.error("Error creating question:", error);
        return { success: false, error: "Impossible de créer la question." };
    }
}

export async function updateQuestion(questionId: string, data: any) {
    try {
        const { options, id: _, ...questionData } = data;
        const [updatedQuestion] = await db.update(questions)
            .set(questionData)
            .where(eq(questions.id, questionId))
            .returning();

        // Effacer les anciennes options et réinsérer les nouvelles
        await db.delete(questionOptions).where(eq(questionOptions.questionId, questionId));

        if (options && options.length > 0) {
            const optionsData = options.map((option: any, idx: number) => ({
                questionId,
                optionText: option.optionText || "",
                isCorrect: Boolean(option.isCorrect),
                orderIndex: idx,
            }));
            await db.insert(questionOptions).values(optionsData);
        }

        if (updatedQuestion?.assessmentId) {
            revalidatePath(`/teacher/create-quiz/${updatedQuestion.assessmentId}`);
        }
        return { success: true, data: updatedQuestion };
    } catch (error) {
        console.error("Error updating question:", error);
        return { success: false, error: "Impossible de mettre à jour la question." };
    }
}

export async function deleteQuestion(questionId: string) {
    try {
        const [deletedQuestion] = await db.delete(questions).where(eq(questions.id, questionId)).returning();
        if (deletedQuestion?.assessmentId) {
            revalidatePath(`/teacher/create-quiz/${deletedQuestion.assessmentId}`);
        }
        return { success: true };
    } catch (error) {
        console.error("Error deleting question:", error);
        return { success: false, error: "Impossible de supprimer la question." };
    }
}

