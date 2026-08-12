// Enums exactement issus du schéma Drizzle
export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";
export type EnrollmentStatus = "ACTIVE" | "PASSED" | "FAILED" | "REORIENTED" | "GRADUATED";
export type AssessmentType = "EXAM" | "RETAKE_EXAM" | "TP" | "QUIZ" | "ASSIGNMENT";

// Vue Drizzle Étudiant + Enrollment + Promotion + Filière
export interface StudentRecord {
    id: string; // user.id (text)
    enrollmentId: string; // studentEnrollments.id (uuid)
    name: string; // user.name
    email: string; // user.email
    image?: string | null; // user.image
    enrollmentStatus: EnrollmentStatus; // studentEnrollments.status
    filiere: {
        code: string; // filieres.code (ex: "GL")
        name: string; // filieres.name (ex: "Génie Logiciel")
    };
    promotion: {
        code: string; // promotions.code (ex: "L3-GL-2025")
        degreeLevel: string; // degreeLevels.code (ex: "L3", "M1")
        academicYear: string; // academicYears.year (ex: "2025-2026")
    };
}

// Vue Drizzle Évaluation (assessments)
export interface AssessmentRecord {
    id: string; // assessments.id (uuid)
    title: string; // assessments.title
    description?: string | null; // assessments.description
    type: AssessmentType; // assessments.type
    promotionCourseId: string; // assessments.promotionCourseId (uuid)
    courseTitle?: string; // Jointure promotionCourses -> courses.title
    maxScore: number; // assessments.maxScore (numeric -> number)
    weight: number; // assessments.weight (numeric -> number)
    dueDate?: string | null; // assessments.dueDate
}

// Vue Relevé de Notes par Étudiant
export interface StudentGradeOverview {
    studentEnrollmentId: string; // studentEnrollments.id
    studentName: string; // user.name
    filiereCode: string; // filieres.code
    promotionCode: string; // promotions.code
    quizScore: number | null; // Note QUIZ (Interro)
    tpScore: number | null; // Note TP
    examScore: number | null; // Note EXAM
}