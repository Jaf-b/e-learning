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
  questions,
  studentResponses,
} from "@/db/schema";
import { StudentRecord, AssessmentRecord, StudentGradeOverview } from "@/types/academic";
import { TpSubmissionRecord } from "@/lib/types";
import { and, asc, eq, inArray, desc } from "drizzle-orm";
import { Course } from "@/lib/types";
import { revalidatePath, unstable_cache, updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user ?? null;
  } catch (error) {
    console.error("Error getting session in courses.actions:", error);
    return null;
  }
}


interface UpdateStudentCourseGradesParams {
  studentEnrollmentId: string;
  courseId: string;
  quizScore?: number | null;
  tpScore?: number | null;
  examScore?: number | null;
}

export const getAllCourses = unstable_cache(
  async () => {
    try {
      const result = await db.query.courses.findMany({
        orderBy: (courses, { desc }) => [desc(courses.createdAt)],
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          modules: {
            columns: {
              id: true,
              title: true,
              order: true,
            },
            with: {
              lessons: {
                columns: {
                  id: true,
                  title: true,
                  order: true,
                },
              },
            },
          },
          filiere: true,
          degreeLevel: true,
        },
      });
      return { success: true, data: result ?? [] };
    } catch (error) {
      console.error("Erreur getAllCourses:", error);
      return { success: false, data: [], error: "Erreur de chargement." };
    }
  },
  ["courses-all"],
  { tags: ["courses"], revalidate: 3600 }
);

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
    const payload = {
      filiereId: data.filiereId,
      degreeLevelId: data.degreeLevelId,
      code: data.code,
      title: data.title,
      description: data.description || null,
      credits: Number(data.credits) || 0,
      status: data.status || "DRAFT",
      authorId: data.authorId,
      rejectionReason: data.rejectionReason || null,
      videoUrl: data.videoUrl || null,
      syllabus: data.syllabus || null,
      syllabusUrl: data.syllabusUrl || null,
    };
    const [newCourse] = await db.insert(courses).values(payload).returning();

    updateTag("courses");
    updateTag("admin-dashboard");
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath("/teacher/courses");

    return { success: true, data: newCourse };
  } catch (error: any) {
    console.error("Erreur createCourse:", error);
    return { success: false, error: error?.message || "Impossible de créer le cours." };
  }
}

export async function updateCourse(id: string, data: any) {
  try {
    const payload: any = {
      updatedAt: new Date(),
    };
    if (data.filiereId !== undefined) payload.filiereId = data.filiereId;
    if (data.degreeLevelId !== undefined) payload.degreeLevelId = data.degreeLevelId;
    if (data.code !== undefined) payload.code = data.code;
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.credits !== undefined) payload.credits = Number(data.credits);
    if (data.status !== undefined) payload.status = data.status;
    if (data.authorId !== undefined) payload.authorId = data.authorId;
    if (data.rejectionReason !== undefined) payload.rejectionReason = data.rejectionReason;
    if (data.videoUrl !== undefined) payload.videoUrl = data.videoUrl;
    if (data.syllabus !== undefined) payload.syllabus = data.syllabus;
    if (data.syllabusUrl !== undefined) payload.syllabusUrl = data.syllabusUrl;

    const [updated] = await db
      .update(courses)
      .set(payload)
      .where(eq(courses.id, id))
      .returning();

    updateTag("courses");
    updateTag("admin-dashboard");
    revalidatePath("/admin/courses");
    revalidatePath("/admin");
    revalidatePath(`/teacher/courses/${id}`);
    revalidatePath("/teacher/courses");
    revalidatePath(`/student/courses/${id}`);

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Erreur updateCourse:", error);
    return { success: false, error: error?.message || "Échec de la mise à jour." };
  }
}

export async function updateCourseContent(
  courseId: string,
  data: {
    videoUrl?: string | null;
    syllabus?: string | null;
    syllabusUrl?: string | null;
    description?: string | null;
  }
) {
  try {
    const payload: any = {
      updatedAt: new Date(),
    };
    if (data.videoUrl !== undefined) payload.videoUrl = data.videoUrl || null;
    if (data.syllabus !== undefined) payload.syllabus = data.syllabus || null;
    if (data.syllabusUrl !== undefined) payload.syllabusUrl = data.syllabusUrl || null;
    if (data.description !== undefined) payload.description = data.description || null;

    const [updated] = await db
      .update(courses)
      .set(payload)
      .where(eq(courses.id, courseId))
      .returning();

    updateTag("courses");
    revalidatePath(`/teacher/courses/${courseId}`);
    revalidatePath(`/student/courses/${courseId}`);
    revalidatePath("/teacher/courses");

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Erreur updateCourseContent:", error);
    return { success: false, error: error?.message || "Échec de la mise à jour du contenu du cours." };
  }
}

export async function deleteCourse(id: string) {
  try {
    const [deleted] = await db
      .delete(courses)
      .where(eq(courses.id, id))
      .returning();

    updateTag("courses");
    updateTag("admin-dashboard");
    revalidatePath("/admin/courses");
    revalidatePath("/admin");

    return { success: true, data: deleted };
  } catch (error: any) {
    console.error("Erreur deleteCourse:", error);
    return {
      success: false,
      error: error?.message || "Impossible de supprimer ce cours. Des promotions ou éléments y sont peut-être rattachés.",
    };
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

  const activePromotionCourses = await db.query.promotionCourses.findMany({
    where: eq(promotionCourses.courseId, courseId),
    columns: {
      id: true,
      promotionId: true,
    },
  });

  const promotionIds = activePromotionCourses.map((p) => p.promotionId);
  const promotionCourseIds = new Set(activePromotionCourses.map((p) => p.id));

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
    const quizScores: number[] = [];
    const tpScores: number[] = [];
    const examScores: number[] = [];

    enrollment.grades.forEach((g) => {
      if (!g.assessment || g.score === null) return;
      if (g.assessment.promotionCourseId && !promotionCourseIds.has(g.assessment.promotionCourseId)) return;

      const scoreNum = Number(g.score);

      if (g.assessment.type === "QUIZ") quizScores.push(scoreNum);
      if (g.assessment.type === "TP" || g.assessment.type === "ASSIGNMENT") tpScores.push(scoreNum);
      if (g.assessment.type === "EXAM" || g.assessment.type === "RETAKE_EXAM") examScores.push(scoreNum);
    });

    const quizScore = quizScores.length > 0 ? Math.round((quizScores.reduce((a, b) => a + b, 0) / quizScores.length) * 10) / 10 : null;
    const tpScore = tpScores.length > 0 ? Math.round((tpScores.reduce((a, b) => a + b, 0) / tpScores.length) * 10) / 10 : null;
    const examScore = examScores.length > 0 ? Math.round((examScores.reduce((a, b) => a + b, 0) / examScores.length) * 10) / 10 : null;

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

/**
 * Fetch all TP/ASSIGNMENT submissions for a given course (teacher view).
 * Returns each grade record enriched with the student's textAnswer and fileUrl.
 */
export async function getTpSubmissionsByCourseId(courseId: string): Promise<TpSubmissionRecord[]> {
  if (!courseId) return [];

  // 1. Find all promotionCourse rows for this course
  const pCourses = await db.query.promotionCourses.findMany({
    where: eq(promotionCourses.courseId, courseId),
    columns: { id: true },
  });
  const pCourseIds = pCourses.map((pc) => pc.id);
  if (pCourseIds.length === 0) return [];

  // 2. Find only TP / ASSIGNMENT assessments
  const tpAssessments = await db.query.assessments.findMany({
    where: and(
      inArray(assessments.promotionCourseId, pCourseIds),
      inArray(assessments.type, ["TP", "ASSIGNMENT"] as any)
    ),
    with: { questions: { columns: { id: true } } },
    orderBy: (a, { desc }) => [desc(a.createdAt)],
  });
  if (tpAssessments.length === 0) return [];

  const assessmentIds = tpAssessments.map((a) => a.id);
  const assessmentMap = new Map(tpAssessments.map((a) => [a.id, a]));

  // 3. Fetch all grades for these assessments (each grade = one submitted student)
  const gradeRows = await db.query.grades.findMany({
    where: inArray(grades.assessmentId, assessmentIds),
    with: {
      studentEnrollment: {
        with: {
          student: {
            columns: { id: true, name: true, email: true, image: true },
          },
        },
      },
    },
    orderBy: (g, { desc }) => [desc(g.gradedAt)],
  });

  // 4. For each grade, find the corresponding textAnswer / fileUrl from student_responses
  const results: TpSubmissionRecord[] = [];

  for (const grade of gradeRows) {
    const assessment = assessmentMap.get(grade.assessmentId);
    if (!assessment) continue;

    const questionIds = assessment.questions.map((q) => q.id);
    let textAnswer: string | null = null;
    let fileUrl: string | null = null;
    let responseId: string | null = null;
    let submittedAt: Date = grade.gradedAt ?? new Date();

    if (questionIds.length > 0) {
      const responseRow = await db.query.studentResponses.findFirst({
        where: and(
          eq(studentResponses.studentEnrollmentId, grade.studentEnrollmentId),
          inArray(studentResponses.questionId, questionIds)
        ),
        orderBy: (r, { desc }) => [desc(r.submittedAt)],
      });
      if (responseRow) {
        textAnswer = responseRow.textAnswer ?? null;
        fileUrl = (responseRow as any).fileUrl ?? null;
        responseId = responseRow.id;
        submittedAt = responseRow.submittedAt;
      }
    }

    const enrollment = grade.studentEnrollment as any;
    results.push({
      id: grade.id,
      gradeId: grade.id,
      responseId,
      assessmentId: grade.assessmentId,
      assessmentTitle: assessment.title,
      assessmentType: assessment.type,
      maxScore: Number(assessment.maxScore),
      dueDate: assessment.dueDate ? String(assessment.dueDate) : null,
      studentEnrollmentId: grade.studentEnrollmentId,
      studentId: enrollment?.student?.id ?? "",
      studentName: enrollment?.student?.name ?? "Inconnu",
      studentEmail: enrollment?.student?.email ?? "",
      studentImage: enrollment?.student?.image ?? null,
      textAnswer,
      fileUrl,
      submittedAt,
      score: grade.score !== null ? Number(grade.score) : null,
      feedback: grade.feedback ?? null,
      isGraded: grade.score !== null,
    });
  }

  return results;
}

/**
 * Teacher grades a TP submission — updates the grade row with score + feedback.
 */
export async function gradeSubmission(data: {
  gradeId: string;
  score: number;
  feedback?: string;
  courseId: string;
}) {
  try {
    await db
      .update(grades)
      .set({
        score: String(data.score),
        feedback: data.feedback ?? null,
        gradedAt: new Date(),
      })
      .where(eq(grades.id, data.gradeId));

    revalidatePath(`/teacher/courses/${data.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Erreur gradeSubmission:", error);
    return { success: false, error: "Impossible d'enregistrer la note." };
  }
}

/**
 * Récupère l'ensemble des soumissions de TP pour tous les cours de l'enseignant connecté
 */
export async function getAllTeacherTpSubmissions() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, submissions: [], error: "Non authentifié" };

    const teacherCourses = await db.query.courses.findMany({
      where: user.role === "ADMIN" ? undefined : eq(courses.authorId, user.id),
      columns: { id: true, title: true, code: true },
    });

    if (teacherCourses.length === 0) {
      return { success: true, submissions: [] };
    }

    const allSubmissions: (TpSubmissionRecord & { courseTitle: string; courseCode: string })[] = [];

    for (const c of teacherCourses) {
      const subs = await getTpSubmissionsByCourseId(c.id);
      subs.forEach((s) => {
        allSubmissions.push({
          ...s,
          courseTitle: c.title,
          courseCode: c.code,
        });
      });
    }

    return { success: true, submissions: allSubmissions };
  } catch (error) {
    console.error("Erreur getAllTeacherTpSubmissions:", error);
    return { success: false, submissions: [], error: "Échec de récupération des soumissions" };
  }
}
