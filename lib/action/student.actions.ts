"use server";

import { db } from "@/db";
import {
  studentEnrollments,
  promotionCourses,
  courses,
  modules,
  lessons,
  assessments,
  questions,
  questionOptions,
  studentResponses,
  grades,
  user,
  promotions,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, inArray, asc, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Utility to get current authenticated user
 */
async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user ?? null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * 1. Get current logged-in student enrollment and basic overview
 */
export async function getStudentSession() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Non authentifié" };
  }

  const enrollment = await db.query.studentEnrollments.findFirst({
    where: eq(studentEnrollments.studentId, currentUser.id),
    with: {
      promotion: {
        with: {
          filiere: true,
          degreeLevel: true,
          academicYear: true,
        },
      },
    },
  });

  return {
    success: true,
    user: currentUser,
    enrollment,
  };
}

/**
 * 2. Get all courses available/enrolled for the student
 */
export async function getStudentCourses() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Non authentifié", courses: [] };
    }

    // Get all enrollments of the student
    const enrollments = await db.query.studentEnrollments.findMany({
      where: eq(studentEnrollments.studentId, currentUser.id),
    });

    const promotionIds = enrollments.map((e) => e.promotionId);

    // If student has no enrollments yet, fallback to all published courses
    let courseIds: string[] = [];

    if (promotionIds.length > 0) {
      const pCourses = await db.query.promotionCourses.findMany({
        where: inArray(promotionCourses.promotionId, promotionIds),
        columns: { courseId: true },
      });
      courseIds = Array.from(new Set(pCourses.map((pc) => pc.courseId)));
    }

    let enrolledCoursesList: any[] = [];

    if (courseIds.length > 0) {
      enrolledCoursesList = await db.query.courses.findMany({
        where: inArray(courses.id, courseIds),
        with: {
          filiere: true,
          degreeLevel: true,
          author: true,
          modules: {
            with: {
              lessons: true,
            },
          },
        },
      });
    } else {
      // Fallback: load all published courses if no promotion course assignment found yet
      enrolledCoursesList = await db.query.courses.findMany({
        where: eq(courses.status, "PUBLISHED"),
        with: {
          filiere: true,
          degreeLevel: true,
          author: true,
          modules: {
            with: {
              lessons: true,
            },
          },
        },
      });
    }

    // For each course, fetch associated assessments and student grades
    const formattedCourses = await Promise.all(
      enrolledCoursesList.map(async (courseItem) => {
        const pCourses = await db.query.promotionCourses.findMany({
          where: eq(promotionCourses.courseId, courseItem.id),
          columns: { id: true },
        });

        const pCourseIds = pCourses.map((pc) => pc.id);

        let courseAssessments: any[] = [];
        if (pCourseIds.length > 0) {
          courseAssessments = await db.query.assessments.findMany({
            where: inArray(assessments.promotionCourseId, pCourseIds),
          });
        }

        let totalLessonsCount = 0;
        courseItem.modules?.forEach((m: any) => {
          totalLessonsCount += m.lessons?.length || 0;
        });

        return {
          ...courseItem,
          totalModules: courseItem.modules?.length || 0,
          totalLessons: totalLessonsCount,
          assessmentsCount: courseAssessments.length,
          assessments: courseAssessments,
        };
      })
    );

    return { success: true, courses: formattedCourses };
  } catch (error) {
    console.error("Erreur getStudentCourses:", error);
    return { success: false, error: "Échec du chargement des cours.", courses: [] };
  }
}

/**
 * 3. Get details of a single course with modules, lessons, and assessments for the student
 */
export async function getStudentCourseDetails(courseId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Non authentifié" };
    }

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

    if (!courseData) {
      return { success: false, error: "Cours introuvable." };
    }

    // Fetch student's promotion & enrollment
    const enrollment = await db.query.studentEnrollments.findFirst({
      where: eq(studentEnrollments.studentId, currentUser.id),
    });

    // Get assessments for this course
    const pCourses = await db.query.promotionCourses.findMany({
      where: eq(promotionCourses.courseId, courseId),
      columns: { id: true },
    });
    const pCourseIds = pCourses.map((pc) => pc.id);

    let courseAssessments: any[] = [];
    let studentGrades: any[] = [];

    if (pCourseIds.length > 0) {
      courseAssessments = await db.query.assessments.findMany({
        where: inArray(assessments.promotionCourseId, pCourseIds),
        with: {
          questions: true,
        },
        orderBy: (assessments: any, { desc }: any) => [desc(assessments.createdAt)],
      });

      if (enrollment) {
        const assessmentIds = courseAssessments.map((a) => a.id);
        if (assessmentIds.length > 0) {
          studentGrades = await db.query.grades.findMany({
            where: and(
              eq(grades.studentEnrollmentId, enrollment.id),
              inArray(grades.assessmentId, assessmentIds)
            ),
          });
        }
      }
    }

    // Map assessment status and grades
    const assessmentsWithGrades = courseAssessments.map((ass) => {
      const grade = studentGrades.find((g) => g.assessmentId === ass.id);
      return {
        ...ass,
        gradeScore: grade?.score !== undefined && grade.score !== null ? Number(grade.score) : null,
        gradedAt: grade?.gradedAt ?? null,
        feedback: grade?.feedback ?? null,
        isSubmitted: !!grade,
      };
    });

    return {
      success: true,
      course: courseData,
      assessments: assessmentsWithGrades,
      enrollment,
    };
  } catch (error) {
    console.error("Erreur getStudentCourseDetails:", error);
    return { success: false, error: "Échec du chargement du cours." };
  }
}

/**
 * 4. Get assessment details for taking a Quiz / Exam / TP
 */
export async function getStudentAssessmentDetails(assessmentId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Non authentifié" };
    }

    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId),
      with: {
        promotionCourse: {
          with: {
            course: true,
          },
        },
        questions: {
          orderBy: (questions: any, { asc }: any) => [asc(questions.orderIndex)],
          with: {
            options: {
              orderBy: (options: any, { asc }: any) => [asc(options.orderIndex)],
            },
          },
        },
      },
    });

    if (!assessment) {
      return { success: false, error: "Évaluation introuvable." };
    }

    const enrollment = await db.query.studentEnrollments.findFirst({
      where: eq(studentEnrollments.studentId, currentUser.id),
    });

    let existingGrade = null;
    let existingResponses: any[] = [];

    if (enrollment) {
      existingGrade = await db.query.grades.findFirst({
        where: and(
          eq(grades.assessmentId, assessmentId),
          eq(grades.studentEnrollmentId, enrollment.id)
        ),
      });

      const questionIds = assessment.questions.map((q) => q.id);
      if (questionIds.length > 0) {
        existingResponses = await db.query.studentResponses.findMany({
          where: and(
            eq(studentResponses.studentEnrollmentId, enrollment.id),
            inArray(studentResponses.questionId, questionIds)
          ),
        });
      }
    }

    return {
      success: true,
      assessment,
      enrollment,
      existingGrade: existingGrade
        ? {
            ...existingGrade,
            score: existingGrade.score !== null ? Number(existingGrade.score) : null,
          }
        : null,
      existingResponses,
    };
  } catch (error) {
    console.error("Erreur getStudentAssessmentDetails:", error);
    return { success: false, error: "Impossible de charger l'évaluation." };
  }
}

/**
 * 5. Submit responses for Quiz / Exam / Interrogation (Auto-graded QCM + recorded text responses)
 */
export async function submitAssessmentAnswers(data: {
  assessmentId: string;
  answers: {
    questionId: string;
    selectedOptionId?: string | null;
    textAnswer?: string | null;
  }[];
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Non authentifié" };
    }

    let enrollment = await db.query.studentEnrollments.findFirst({
      where: eq(studentEnrollments.studentId, currentUser.id),
    });

    if (!enrollment) {
      // Auto-enroll student into first active promotion if needed
      const firstPromotion = await db.query.promotions.findFirst();
      if (!firstPromotion) {
        return { success: false, error: "Aucune promotion trouvée." };
      }
      const [newEnrollment] = await db
        .insert(studentEnrollments)
        .values({
          studentId: currentUser.id,
          promotionId: firstPromotion.id,
          status: "ACTIVE",
        })
        .returning();
      enrollment = newEnrollment;
    }

    // Fetch assessment with questions and options
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, data.assessmentId),
      with: {
        questions: {
          with: {
            options: true,
          },
        },
      },
    });

    if (!assessment) {
      return { success: false, error: "Évaluation non trouvée." };
    }

    let totalObtainedPoints = 0;
    let totalMaxPoints = 0;

    // Delete previous responses if re-taking or updating
    const questionIds = assessment.questions.map((q) => q.id);
    if (questionIds.length > 0) {
      await db
        .delete(studentResponses)
        .where(
          and(
            eq(studentResponses.studentEnrollmentId, enrollment.id),
            inArray(studentResponses.questionId, questionIds)
          )
        );
    }

    // Process each question answer
    for (const q of assessment.questions) {
      const qPoints = Number(q.points) || 1;
      totalMaxPoints += qPoints;

      const userAns = data.answers.find((a) => a.questionId === q.id);

      let scoreObtained = 0;
      let selectedOptId = userAns?.selectedOptionId || null;
      let textAns = userAns?.textAnswer || null;

      if (q.type === "SINGLE_CHOICE" || q.type === "TRUE_FALSE" || q.type === "MULTIPLE_CHOICE") {
        if (selectedOptId) {
          const matchedOpt = q.options.find((opt) => opt.id === selectedOptId);
          if (matchedOpt && matchedOpt.isCorrect) {
            scoreObtained = qPoints;
          }
        }
      } else {
        // Text / Essay: teacher will grade or awarded basic completion score if provided
        scoreObtained = 0;
      }

      totalObtainedPoints += scoreObtained;

      await db.insert(studentResponses).values({
        studentEnrollmentId: enrollment.id,
        questionId: q.id,
        selectedOptionId: selectedOptId,
        textAnswer: textAns,
        scoreObtained: scoreObtained.toString(),
      });
    }

    // Scale final score to assessment maxScore (e.g. 20.00)
    const maxScoreNum = Number(assessment.maxScore) || 20;
    let finalCalculatedScore = 0;
    if (totalMaxPoints > 0) {
      finalCalculatedScore = (totalObtainedPoints / totalMaxPoints) * maxScoreNum;
    }
    finalCalculatedScore = Math.round(finalCalculatedScore * 100) / 100;

    // Check existing grade
    const existingGrade = await db.query.grades.findFirst({
      where: and(
        eq(grades.assessmentId, data.assessmentId),
        eq(grades.studentEnrollmentId, enrollment.id)
      ),
    });

    if (existingGrade) {
      await db
        .update(grades)
        .set({
          score: finalCalculatedScore.toString(),
          gradedAt: new Date(),
        })
        .where(eq(grades.id, existingGrade.id));
    } else {
      await db.insert(grades).values({
        assessmentId: data.assessmentId,
        studentEnrollmentId: enrollment.id,
        score: finalCalculatedScore.toString(),
        gradedAt: new Date(),
      });
    }

    revalidatePath(`/student/assessment/${data.assessmentId}`);
    revalidatePath(`/student/courses/${assessment.promotionCourseId}`);

    return {
      success: true,
      score: finalCalculatedScore,
      maxScore: maxScoreNum,
    };
  } catch (error) {
    console.error("Erreur submitAssessmentAnswers:", error);
    return { success: false, error: "Échec de la soumission de l'évaluation." };
  }
}

/**
 * 6. Submit TP / Assignment (Text response, file URL, or essay response)
 */
export async function submitTpAssignment(data: {
  assessmentId: string;
  submissionContent: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Non authentifié" };
    }

    let enrollment = await db.query.studentEnrollments.findFirst({
      where: eq(studentEnrollments.studentId, currentUser.id),
    });

    if (!enrollment) {
      const firstPromotion = await db.query.promotions.findFirst();
      if (!firstPromotion) {
        return { success: false, error: "Aucune promotion disponible." };
      }
      const [newEnrollment] = await db
        .insert(studentEnrollments)
        .values({
          studentId: currentUser.id,
          promotionId: firstPromotion.id,
          status: "ACTIVE",
        })
        .returning();
      enrollment = newEnrollment;
    }

    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, data.assessmentId),
      with: {
        questions: true,
      },
    });

    if (!assessment) {
      return { success: false, error: "TP introuvable." };
    }

    // Attach response to first question or create a placeholder if no question exists
    let targetQuestionId = assessment.questions[0]?.id;

    if (!targetQuestionId) {
      const [newQ] = await db
        .insert(questions)
        .values({
          assessmentId: assessment.id,
          prompt: "Consigne du TP / Travail Pratique",
          type: "ESSAY",
          points: assessment.maxScore || "20.00",
        })
        .returning();
      targetQuestionId = newQ.id;
    }

    // Check or delete previous response
    await db
      .delete(studentResponses)
      .where(
        and(
          eq(studentResponses.studentEnrollmentId, enrollment.id),
          eq(studentResponses.questionId, targetQuestionId)
        )
      );

    await db.insert(studentResponses).values({
      studentEnrollmentId: enrollment.id,
      questionId: targetQuestionId,
      textAnswer: data.submissionContent,
    });

    // Record or update Grade (initially pending teacher score or recorded)
    const existingGrade = await db.query.grades.findFirst({
      where: and(
        eq(grades.assessmentId, data.assessmentId),
        eq(grades.studentEnrollmentId, enrollment.id)
      ),
    });

    if (!existingGrade) {
      await db.insert(grades).values({
        assessmentId: data.assessmentId,
        studentEnrollmentId: enrollment.id,
        score: null, // Pending grading by teacher
        gradedAt: new Date(),
        feedback: "TP Soumis. En attente de correction par l'enseignant.",
      });
    } else {
      await db
        .update(grades)
        .set({
          gradedAt: new Date(),
          feedback: existingGrade.feedback || "TP Soumis. En attente de correction par l'enseignant.",
        })
        .where(eq(grades.id, existingGrade.id));
    }

    revalidatePath(`/student/assessment/${data.assessmentId}`);
    revalidatePath(`/student/assignement`);

    return { success: true };
  } catch (error) {
    console.error("Erreur submitTpAssignment:", error);
    return { success: false, error: "Échec de l'envoi du TP." };
  }
}

/**
 * 7. Get centralized list of assessments filtered by type ("TP" / "ASSIGNMENT", "QUIZ", "EXAM")
 */
export async function getStudentAssessmentsByType(types: ("TP" | "ASSIGNMENT" | "QUIZ" | "EXAM" | "RETAKE_EXAM")[]) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Non authentifié", assessments: [] };
    }

    const enrollment = await db.query.studentEnrollments.findFirst({
      where: eq(studentEnrollments.studentId, currentUser.id),
    });

    let pCourseIds: string[] = [];
    if (enrollment) {
      const pCourses = await db.query.promotionCourses.findMany({
        where: eq(promotionCourses.promotionId, enrollment.promotionId),
        columns: { id: true },
      });
      pCourseIds = pCourses.map((pc) => pc.id);
    }

    let allAssessments: any[] = [];
    if (pCourseIds.length > 0) {
      allAssessments = await db.query.assessments.findMany({
        where: and(
          inArray(assessments.promotionCourseId, pCourseIds),
          inArray(assessments.type, types)
        ),
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
    } else {
      // Fallback: load all matching assessments
      allAssessments = await db.query.assessments.findMany({
        where: inArray(assessments.type, types),
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
    }

    let studentGrades: any[] = [];
    if (enrollment && allAssessments.length > 0) {
      const assIds = allAssessments.map((a) => a.id);
      studentGrades = await db.query.grades.findMany({
        where: and(
          eq(grades.studentEnrollmentId, enrollment.id),
          inArray(grades.assessmentId, assIds)
        ),
      });
    }

    const formatted = allAssessments.map((item) => {
      const grade = studentGrades.find((g) => g.assessmentId === item.id);
      return {
        ...item,
        courseTitle: item.promotionCourse?.course
          ? `${item.promotionCourse.course.code} - ${item.promotionCourse.course.title}`
          : "Cours Général",
        gradeScore: grade?.score !== undefined && grade.score !== null ? Number(grade.score) : null,
        feedback: grade?.feedback ?? null,
        isSubmitted: !!grade,
      };
    });

    return { success: true, assessments: formatted };
  } catch (error) {
    console.error("Erreur getStudentAssessmentsByType:", error);
    return { success: false, error: "Échec du chargement des évaluations.", assessments: [] };
  }
}

/**
 * 8. Dashboard overview metrics for student
 */
export async function getStudentDashboardOverview() {
  try {
    const coursesRes = await getStudentCourses();
    const tpRes = await getStudentAssessmentsByType(["TP", "ASSIGNMENT"]);
    const quizRes = await getStudentAssessmentsByType(["QUIZ"]);
    const examRes = await getStudentAssessmentsByType(["EXAM", "RETAKE_EXAM"]);

    const allCourses = coursesRes.courses || [];
    const allTps = tpRes.assessments || [];
    const allQuizzes = quizRes.assessments || [];
    const allExams = examRes.assessments || [];

    const totalCourses = allCourses.length;
    const completedAssessments = [...allTps, ...allQuizzes, ...allExams].filter(
      (a) => a.isSubmitted
    ).length;

    const pendingTps = allTps.filter((a) => !a.isSubmitted).length;
    const pendingQuizzes = allQuizzes.filter((a) => !a.isSubmitted).length;
    const pendingExams = allExams.filter((a) => !a.isSubmitted).length;

    return {
      success: true,
      stats: {
        totalCourses,
        completedAssessments,
        pendingTps,
        pendingQuizzes,
        pendingExams,
      },
      recentCourses: allCourses.slice(0, 4),
      pendingTpsList: allTps.filter((a) => !a.isSubmitted).slice(0, 3),
      upcomingQuizzesList: allQuizzes.filter((a) => !a.isSubmitted).slice(0, 3),
      upcomingExamsList: allExams.filter((a) => !a.isSubmitted).slice(0, 3),
    };
  } catch (error) {
    console.error("Erreur getStudentDashboardOverview:", error);
    return {
      success: false,
      stats: {
        totalCourses: 0,
        completedAssessments: 0,
        pendingTps: 0,
        pendingQuizzes: 0,
        pendingExams: 0,
      },
      recentCourses: [],
      pendingTpsList: [],
      upcomingQuizzesList: [],
      upcomingExamsList: [],
    };
  }
}
