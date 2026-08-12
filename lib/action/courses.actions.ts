"use server";

import { db } from "@/db";
import {
  courses,
  degreeLevels,
  filieres,
  studentEnrollments,
  assessments,
  grades,
  promotionCourses,
  modules,
  lessons,
} from "@/db/schema";
import { StudentRecord, AssessmentRecord, StudentGradeOverview } from "@/types/academic";
import { and, asc, eq, inArray } from "drizzle-orm";
import { Course } from "@/lib/types";
import { revalidatePath } from "next/cache";

interface UpdateStudentCourseGradesParams {
  studentEnrollmentId: string;
  courseId: string;
  quizScore?: number | null;
  tpScore?: number | null;
  examScore?: number | null;
}

export async function getAllCourses() {
  try {
    const result = await db.query.courses.findMany({
      with: {
        author: true,
        modules: true,
      },
    });
    return { success: true, data: result ?? [] };
  } catch (error) {
    console.error("Erreur getAllCourses:", error);
    return { success: false, data: [], error: "Erreur de chargement." };
  }
}

export async function getCoursesByuserID(id: string) {
  try {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.authorId, id))
      .innerJoin(filieres, eq(courses.filiereId, filieres.id))
      .innerJoin(degreeLevels, eq(degreeLevels.id, courses.degreeLevelId));
    return { success: true, data: result ?? [] };
  } catch (error) {
    console.error("Erreur getCoursesByuserID:", error);
    return { success: false, data: [], error: "Erreur de chargement." };
  }
}

export async function createCourse(data: any) {
  try {
    const [newCourse] = await db.insert(courses).values(data).returning();
    return { success: true, data: newCourse };
  } catch (error) {
    console.error("Erreur createCourse:", error);
    return { success: false, error: "Impossible de créer le cours." };
  }
}

export async function updateCourse(id: string, data: any) {
  try {
    const [updated] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, id))
      .returning();
    return { success: true, data: updated };
  } catch (error) {
    console.error("Erreur updateCourse:", error);
    return { success: false, error: "Échec de la mise à jour." };
  }
}

export async function getStudents(): Promise<StudentRecord[]> {
  const data = await db.query.studentEnrollments.findMany({
    with: {
      student: true,
      promotion: {
        with: {
          filiere: true,
          degreeLevel: true,
          academicYear: true,
        },
      },
    },
  });

  return data.map((item) => ({
    id: item.student.id,
    enrollmentId: item.id,
    name: item.student.name,
    email: item.student.email,
    image: item.student.image,
    enrollmentStatus: item.status,
    filiere: {
      code: item.promotion.filiere.code,
      name: item.promotion.filiere.name,
    },
    promotion: {
      code: item.promotion.code,
      degreeLevel: item.promotion.degreeLevel.code,
      academicYear: item.promotion.academicYear.year,
    },
  }));
}

export async function getAssessmentsByCourseId(courseId: string): Promise<AssessmentRecord[]> {
  if (!courseId) return [];

  const activePromotionCourses = await db.query.promotionCourses.findMany({
    where: eq(promotionCourses.courseId, courseId),
    columns: {
      id: true,
    },
  });

  const promotionCourseIds = activePromotionCourses.map((pc) => pc.id);

  if (promotionCourseIds.length === 0) {
    return [];
  }

  const data = await db.query.assessments.findMany({
    where: inArray(assessments.promotionCourseId, promotionCourseIds),
    with: {
      promotionCourse: {
        with: {
          course: true,
        },
      },
    },
    orderBy: (assessments: any, { desc }: any) => [desc(assessments.createdAt)],
  });

  return data.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    promotionCourseId: item.promotionCourseId,
    courseTitle: item.promotionCourse?.course
      ? `${item.promotionCourse.course.code} : ${item.promotionCourse.course.title}`
      : undefined,
    maxScore: Number(item.maxScore),
    weight: Number(item.weight),
    dueDate: item.dueDate,
  }));
}

export async function getStudentGradesOverview(courseId: string): Promise<StudentGradeOverview[]> {
  if (!courseId) return [];

  const activePromotions = await db.query.promotionCourses.findMany({
    where: eq(promotionCourses.courseId, courseId),
    columns: {
      promotionId: true,
    },
  });

  const promotionIds = activePromotions.map((p) => p.promotionId);

  if (promotionIds.length === 0) {
    return [];
  }

  const data = await db.query.studentEnrollments.findMany({
    where: inArray(studentEnrollments.promotionId, promotionIds),
    with: {
      student: true,
      promotion: {
        with: {
          filiere: true,
        },
      },
      grades: {
        with: {
          assessment: true,
        },
      },
    },
  });

  return data.map((enrollment) => {
    let quizScore: number | null = null;
    let tpScore: number | null = null;
    let examScore: number | null = null;

    enrollment.grades.forEach((g) => {
      if (!g.assessment || g.score === null) return;
      if (g.assessment.promotionCourseId && g.assessment.promotionCourseId !== courseId) return;

      const scoreNum = Number(g.score);

      if (g.assessment.type === "QUIZ") quizScore = scoreNum;
      if (g.assessment.type === "TP") tpScore = scoreNum;
      if (g.assessment.type === "EXAM") examScore = scoreNum;
    });

    return {
      studentEnrollmentId: enrollment.id,
      studentName: enrollment.student.name,
      filiereCode: enrollment.promotion.filiere.code,
      promotionCode: enrollment.promotion.code,
      quizScore,
      tpScore,
      examScore,
    };
  });
}

export async function getCourseWithModules(courseId: string) {
  if (!courseId) return null;

  const courseData = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      filiere: true,
      degreeLevel: true,
      author: true,
      modules: {
        orderBy: (modules: any, { asc }: any) => [asc(modules.order)],
        with: {
          lessons: {
            orderBy: (lessons: any, { asc }: any) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return courseData ?? null;
}

export async function getEnrolledStudentsByCourseId(courseId: string) {
  if (!courseId) return [];

  const pCourses = await db.query.promotionCourses.findMany({
    where: eq(promotionCourses.courseId, courseId),
    columns: {
      promotionId: true,
    },
  });

  const promotionIds = pCourses.map((pc) => pc.promotionId);

  if (promotionIds.length === 0) {
    return [];
  }

  const enrollments = await db.query.studentEnrollments.findMany({
    where: inArray(studentEnrollments.promotionId, promotionIds),
    with: {
      student: true,
      promotion: {
        with: {
          filiere: true,
          degreeLevel: true,
          academicYear: true,
        },
      },
    },
  });

  return enrollments.map((e) => ({
    id: e.student.id,
    enrollmentId: e.id,
    name: e.student.name,
    email: e.student.email,
    image: e.student.image,
    enrollmentStatus: e.status,
    filiere: {
      code: e.promotion.filiere.code,
      name: e.promotion.filiere.name,
    },
    promotion: {
      code: e.promotion.code,
      degreeLevel: e.promotion.degreeLevel.code,
      academicYear: e.promotion.academicYear.year,
    },
  }));
}

export async function updateStudentCourseGrades({
  studentEnrollmentId,
  courseId,
  quizScore,
  tpScore,
  examScore,
}: UpdateStudentCourseGradesParams) {
  try {
    const activePromotionCourses = await db.query.promotionCourses.findMany({
      where: eq(promotionCourses.courseId, courseId),
      columns: { id: true },
    });

    const promotionCourseIds = activePromotionCourses.map((pc) => pc.id);

    if (promotionCourseIds.length === 0) {
      return { success: false, error: "Aucune promotion associée à ce cours." };
    }

    const courseAssessments = await db.query.assessments.findMany({
      where: inArray(assessments.promotionCourseId, promotionCourseIds),
    });

    const quizAssessment = courseAssessments.find((a) => a.type === "QUIZ");
    const tpAssessment = courseAssessments.find((a) => a.type === "TP");
    const examAssessment = courseAssessments.find((a) => a.type === "EXAM");

    const updatesToApply: { assessmentId: string; score: number }[] = [];

    if (quizScore !== undefined && quizScore !== null && quizAssessment) {
      updatesToApply.push({ assessmentId: quizAssessment.id, score: quizScore });
    }
    if (tpScore !== undefined && tpScore !== null && tpAssessment) {
      updatesToApply.push({ assessmentId: tpAssessment.id, score: tpScore });
    }
    if (examScore !== undefined && examScore !== null && examAssessment) {
      updatesToApply.push({ assessmentId: examAssessment.id, score: examScore });
    }

    if (updatesToApply.length === 0) {
      return { success: false, error: "Aucune évaluation correspondante trouvée." };
    }

    await db.transaction(async (tx) => {
      for (const item of updatesToApply) {
        const existingGrade = await tx.query.grades.findFirst({
          where: and(
            eq(grades.studentEnrollmentId, studentEnrollmentId),
            eq(grades.assessmentId, item.assessmentId)
          ),
        });

        if (existingGrade) {
          await tx
            .update(grades)
            .set({
              score: item.score.toString(),
              gradedAt: new Date(),
            })
            .where(eq(grades.id, existingGrade.id));
        } else {
          await tx.insert(grades).values({
            studentEnrollmentId,
            assessmentId: item.assessmentId,
            score: item.score.toString(),
          });
        }
      }
    });

    revalidatePath(`/teacher/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur updateStudentCourseGrades:", error);
    return { success: false, error: "Échec de l'enregistrement des notes." };
  }
}

export async function getTeacherDashboardOverview() {
  try {
    const allCourses = await db.query.courses.findMany({
      with: {
        filiere: true,
        degreeLevel: true,
        modules: true,
      },
      orderBy: (courses: any, { desc }: any) => [desc(courses.createdAt)],
    });

    const allAssessments = await db.query.assessments.findMany({
      with: {
        promotionCourse: {
          with: {
            course: true,
          },
        },
        questions: true,
      },
      orderBy: (assessments: any, { desc }: any) => [desc(assessments.createdAt)],
    });

    const totalStudents = await db.query.studentEnrollments.findMany();

    return {
      success: true,
      courses: allCourses,
      assessments: allAssessments.map((a) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        maxScore: Number(a.maxScore),
        weight: Number(a.weight),
        dueDate: a.dueDate,
        courseTitle: a.promotionCourse?.course
          ? `${a.promotionCourse.course.code} : ${a.promotionCourse.course.title}`
          : undefined,
        courseId: a.promotionCourse?.courseId,
        questionCount: a.questions?.length || 0,
        createdAt: a.createdAt,
      })),
      stats: {
        totalCourses: allCourses.length,
        totalStudents: totalStudents.length,
        totalAssessments: allAssessments.length,
        publishedCourses: allCourses.filter((c) => c.status === "PUBLISHED").length,
        draftCourses: allCourses.filter((c) => c.status === "DRAFT").length,
      },
    };
  } catch (error) {
    console.error("Erreur getTeacherDashboardOverview:", error);
    return {
      success: false,
      courses: [],
      assessments: [],
      stats: { totalCourses: 0, totalStudents: 0, totalAssessments: 0, publishedCourses: 0, draftCourses: 0 },
      error: "Échec de chargement des statistiques du tableau de bord.",
    };
  }
}

/**
 * MODULES & LESSONS CRUD ACTIONS
 */

export async function createModule(data: { courseId: string; title: string; order?: number }) {
  try {
    let orderVal = data.order;
    if (orderVal === undefined || orderVal === null) {
      const existingModules = await db.query.modules.findMany({
        where: eq(modules.courseId, data.courseId),
      });
      orderVal = existingModules.length + 1;
    }

    const [newModule] = await db
      .insert(modules)
      .values({
        courseId: data.courseId,
        title: data.title,
        order: orderVal,
      })
      .returning();

    revalidatePath(`/teacher/courses/${data.courseId}`);
    return { success: true, data: newModule };
  } catch (error) {
    console.error("Erreur createModule:", error);
    return { success: false, error: "Impossible de créer le module." };
  }
}

export async function updateModule(id: string, data: { title?: string; order?: number }) {
  try {
    const [updated] = await db
      .update(modules)
      .set(data)
      .where(eq(modules.id, id))
      .returning();

    if (updated?.courseId) {
      revalidatePath(`/teacher/courses/${updated.courseId}`);
    }
    return { success: true, data: updated };
  } catch (error) {
    console.error("Erreur updateModule:", error);
    return { success: false, error: "Échec de la mise à jour du module." };
  }
}

export async function deleteModule(id: string) {
  try {
    const [deleted] = await db.delete(modules).where(eq(modules.id, id)).returning();
    if (deleted?.courseId) {
      revalidatePath(`/teacher/courses/${deleted.courseId}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Erreur deleteModule:", error);
    return { success: false, error: "Impossible de supprimer le module." };
  }
}

export async function createLesson(data: {
  moduleId: string;
  title: string;
  content?: string;
  videoUrl?: string;
  order?: number;
}) {
  try {
    const targetModule = await db.query.modules.findFirst({
      where: eq(modules.id, data.moduleId),
    });

    if (!targetModule) {
      return { success: false, error: "Module introuvable." };
    }

    let orderVal = data.order;
    if (orderVal === undefined || orderVal === null) {
      const existingLessons = await db.query.lessons.findMany({
        where: eq(lessons.moduleId, data.moduleId),
      });
      orderVal = existingLessons.length + 1;
    }

    const [newLesson] = await db
      .insert(lessons)
      .values({
        moduleId: data.moduleId,
        title: data.title,
        content: data.content || null,
        videoUrl: data.videoUrl || null,
        order: orderVal,
      })
      .returning();

    revalidatePath(`/teacher/courses/${targetModule.courseId}`);
    return { success: true, data: newLesson };
  } catch (error) {
    console.error("Erreur createLesson:", error);
    return { success: false, error: "Impossible de créer la leçon." };
  }
}

export async function updateLesson(id: string, data: {
  title?: string;
  content?: string;
  videoUrl?: string;
  order?: number;
}) {
  try {
    const [updated] = await db
      .update(lessons)
      .set(data)
      .where(eq(lessons.id, id))
      .returning();

    if (updated?.moduleId) {
      const targetModule = await db.query.modules.findFirst({
        where: eq(modules.id, updated.moduleId),
      });
      if (targetModule) {
        revalidatePath(`/teacher/courses/${targetModule.courseId}`);
      }
    }
    return { success: true, data: updated };
  } catch (error) {
    console.error("Erreur updateLesson:", error);
    return { success: false, error: "Échec de la mise à jour de la leçon." };
  }
}

export async function deleteLesson(id: string) {
  try {
    const [deleted] = await db.delete(lessons).where(eq(lessons.id, id)).returning();
    if (deleted?.moduleId) {
      const targetModule = await db.query.modules.findFirst({
        where: eq(modules.id, deleted.moduleId),
      });
      if (targetModule) {
        revalidatePath(`/teacher/courses/${targetModule.courseId}`);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Erreur deleteLesson:", error);
    return { success: false, error: "Impossible de supprimer la leçon." };
  }
}