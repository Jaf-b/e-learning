import {
    sqliteTable,
    text,
    integer,
    real,
    index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================================================
// 1. TYPES & ENUMS DU SYSTÈME (TYPESCRIPT STRINGS POUR SQLITE)
// ============================================================================

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";
export type CourseStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
export type EnrollmentStatus = "ACTIVE" | "PASSED" | "FAILED" | "REORIENTED" | "GRADUATED";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type AssessmentType = "EXAM" | "RETAKE_EXAM" | "TP" | "QUIZ" | "ASSIGNMENT";
export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "TEXT" | "ESSAY";

// ============================================================================
// 2. SÉCURITÉ & UTILISATEURS (BETTER-AUTH SQLITE TABLE SCHEMA)
// ============================================================================

export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    role: text("role").$type<UserRole>().notNull().default("STUDENT"),
    banned: integer("banned", { mode: "boolean" }).default(false),
    banReason: text("ban_reason"),
    banExpires: integer("ban_expires", { mode: "timestamp" }),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
});

export const session = sqliteTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
        token: text("token").notNull().unique(),
        createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
        updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        impersonatedBy: text("impersonated_by"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = sqliteTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
        refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
        scope: text("scope"),
        password: text("password"),
        createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
        updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    },
    (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = sqliteTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
        createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
        updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const auditLogs = sqliteTable("audit_logs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    actorId: text("actor_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    targetEntity: text("target_entity").notNull(),
    targetId: text("target_id").notNull(),
    metadata: text("metadata", { mode: "json" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// 3. STRUCTURE ACADÉMIQUE DYNAMIQUE
// ============================================================================

export const faculties = sqliteTable("faculties", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
});

export const departments = sqliteTable("departments", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    facultyId: text("faculty_id").notNull().references(() => faculties.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
});

export const filieres = sqliteTable("filieres", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    departmentId: text("department_id").notNull().references(() => departments.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
});

export const degrees = sqliteTable("degrees", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    hierarchyRank: integer("hierarchy_rank").notNull(),
    totalCreditsRequired: integer("total_credits_required"),
});

export const degreeLevels = sqliteTable("degree_levels", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    degreeId: text("degree_id").notNull().references(() => degrees.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    levelOrder: integer("level_order").notNull(),
});

export const academicYears = sqliteTable("academic_years", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    year: text("year").notNull().unique(),
    isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
});

export const promotions = sqliteTable("promotions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    filiereId: text("filiere_id").notNull().references(() => filieres.id, { onDelete: "cascade" }),
    degreeLevelId: text("degree_level_id").notNull().references(() => degreeLevels.id),
    academicYearId: text("academic_year_id").notNull().references(() => academicYears.id),
    code: text("code").notNull(),
});

// ============================================================================
// 4. COURS, CONTENU & WORKFLOW DE VALIDATION
// ============================================================================

export const courses = sqliteTable("courses", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    filiereId: text("filiere_id").notNull().references(() => filieres.id),
    degreeLevelId: text("degree_level_id").notNull().references(() => degreeLevels.id),
    code: text("code").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    credits: integer("credits").notNull(),
    status: text("status").$type<CourseStatus>().notNull().default("DRAFT"),
    authorId: text("author_id").notNull().references(() => user.id),
    rejectionReason: text("rejection_reason"),
    videoUrl: text("video_url"),
    syllabus: text("syllabus"),
    syllabusUrl: text("syllabus_url"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const courseReviews = sqliteTable("course_reviews", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    adminId: text("admin_id").notNull().references(() => user.id),
    decision: text("decision").$type<"PUBLISHED" | "REJECTED">().notNull(),
    feedback: text("feedback"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const modules = sqliteTable("modules", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    order: integer("order").notNull(),
});

export const lessons = sqliteTable("lessons", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    moduleId: text("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content"),
    videoUrl: text("video_url"),
    order: integer("order").notNull(),
});

export const promotionCourses = sqliteTable("promotion_courses", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    promotionId: text("promotion_id").notNull().references(() => promotions.id, { onDelete: "cascade" }),
    courseId: text("course_id").notNull().references(() => courses.id),
    teacherId: text("teacher_id").references(() => user.id),
    semester: text("semester").notNull(),
});

// ============================================================================
// 5. ÉTUDIANTS, INSCRIPTIONS & NOTES
// ============================================================================

export const studentEnrollments = sqliteTable("student_enrollments", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text("student_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    promotionId: text("promotion_id").notNull().references(() => promotions.id),
    status: text("status").$type<EnrollmentStatus>().notNull().default("ACTIVE"),
    enrolledAt: integer("enrolled_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const creditTransfers = sqliteTable("credit_transfers", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text("student_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    fromPromotionId: text("from_promotion_id").references(() => promotions.id),
    toPromotionId: text("to_promotion_id").references(() => promotions.id),
    transferredCredits: integer("transferred_credits").notNull(),
    reason: text("reason"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// 6. SUPPORT UTILISATEUR & TICKETING
// ============================================================================

export const supportTickets = sqliteTable("support_tickets", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    assignedAdminId: text("assigned_admin_id").references(() => user.id),
    subject: text("subject").notNull(),
    status: text("status").$type<TicketStatus>().notNull().default("OPEN"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const ticketMessages = sqliteTable("ticket_messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    ticketId: text("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
    senderId: text("sender_id").notNull().references(() => user.id),
    message: text("message").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// 7. ÉVALUATIONS, QUESTIONS & NOTES
// ============================================================================

export const assessments = sqliteTable("assessments", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    type: text("type").$type<AssessmentType>().notNull().default("QUIZ"),
    promotionCourseId: text("promotion_course_id")
        .notNull()
        .references(() => promotionCourses.id, { onDelete: "cascade" }),
    maxScore: text("max_score").notNull().default("20.00"),
    weight: text("weight").notNull().default("1.00"),
    dueDate: text("due_date"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const grades = sqliteTable("grades", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    assessmentId: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    studentEnrollmentId: text("student_enrollment_id")
        .notNull()
        .references(() => studentEnrollments.id, { onDelete: "cascade" }),
    score: text("score"),
    feedback: text("feedback"),
    gradedAt: integer("graded_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const questions = sqliteTable("questions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    assessmentId: text("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    type: text("type").$type<QuestionType>().notNull().default("SINGLE_CHOICE"),
    points: text("points").notNull().default("1.00"),
    orderIndex: integer("order_index").notNull().default(0),
    explanation: text("explanation"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const questionOptions = sqliteTable("question_options", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    questionId: text("question_id")
        .notNull()
        .references(() => questions.id, { onDelete: "cascade" }),
    optionText: text("option_text").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull().default(false),
    orderIndex: integer("order_index").notNull().default(0),
});

export const studentResponses = sqliteTable("student_responses", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentEnrollmentId: text("student_enrollment_id")
        .notNull()
        .references(() => studentEnrollments.id, { onDelete: "cascade" }),
    questionId: text("question_id")
        .notNull()
        .references(() => questions.id, { onDelete: "cascade" }),
    selectedOptionId: text("selected_option_id").references(() => questionOptions.id, { onDelete: "set null" }),
    textAnswer: text("text_answer"),
    fileUrl: text("file_url"),
    scoreObtained: text("score_obtained"),
    submittedAt: integer("submitted_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// 8. RELATIONS DRIZZLE
// ============================================================================

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    coursesAuthored: many(courses),
    enrollments: many(studentEnrollments),
    auditLogs: many(auditLogs),
    tickets: many(supportTickets),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const promotionsRelations = relations(promotions, ({ one, many }) => ({
    filiere: one(filieres, { fields: [promotions.filiereId], references: [filieres.id] }),
    degreeLevel: one(degreeLevels, { fields: [promotions.degreeLevelId], references: [degreeLevels.id] }),
    academicYear: one(academicYears, { fields: [promotions.academicYearId], references: [academicYears.id] }),
    courses: many(promotionCourses),
    students: many(studentEnrollments),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
    author: one(user, { fields: [courses.authorId], references: [user.id] }),
    filiere: one(filieres, { fields: [courses.filiereId], references: [filieres.id] }),
    degreeLevel: one(degreeLevels, { fields: [courses.degreeLevelId], references: [degreeLevels.id] }),
    modules: many(modules),
    reviews: many(courseReviews),
    promotionCourses: many(promotionCourses),
}));

export const studentEnrollmentsRelations = relations(studentEnrollments, ({ one, many }) => ({
    student: one(user, { fields: [studentEnrollments.studentId], references: [user.id] }),
    promotion: one(promotions, { fields: [studentEnrollments.promotionId], references: [promotions.id] }),
    grades: many(grades),
}));

export const facultiesRelations = relations(faculties, ({ many }) => ({
    departments: many(departments),
}));

export const departmentsRelations = relations(departments, ({ one, many }) => ({
    faculty: one(faculties, {
        fields: [departments.facultyId],
        references: [faculties.id],
    }),
    filieres: many(filieres),
}));

export const filieresRelations = relations(filieres, ({ one, many }) => ({
    department: one(departments, {
        fields: [filieres.departmentId],
        references: [departments.id],
    }),
    promotions: many(promotions),
    courses: many(courses),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
    promotionCourse: one(promotionCourses, {
        fields: [assessments.promotionCourseId],
        references: [promotionCourses.id],
    }),
    grades: many(grades),
    questions: many(questions),
}));

export const promotionCoursesRelations = relations(promotionCourses, ({ one, many }) => ({
    course: one(courses, {
        fields: [promotionCourses.courseId],
        references: [courses.id],
    }),
    assessments: many(assessments),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
    assessment: one(assessments, {
        fields: [grades.assessmentId],
        references: [assessments.id],
    }),
    studentEnrollment: one(studentEnrollments, {
        fields: [grades.studentEnrollmentId],
        references: [studentEnrollments.id],
    }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
    assessment: one(assessments, {
        fields: [questions.assessmentId],
        references: [assessments.id],
    }),
    options: many(questionOptions),
    responses: many(studentResponses),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
    question: one(questions, {
        fields: [questionOptions.questionId],
        references: [questions.id],
    }),
}));

export const studentResponsesRelations = relations(studentResponses, ({ one }) => ({
    question: one(questions, {
        fields: [studentResponses.questionId],
        references: [questions.id],
    }),
    selectedOption: one(questionOptions, {
        fields: [studentResponses.selectedOptionId],
        references: [questionOptions.id],
    }),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
    course: one(courses, {
        fields: [modules.courseId],
        references: [courses.id],
    }),
    lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
    module: one(modules, {
        fields: [lessons.moduleId],
        references: [modules.id],
    }),
}));

export const courseReviewsRelations = relations(courseReviews, ({ one }) => ({
    course: one(courses, {
        fields: [courseReviews.courseId],
        references: [courses.id],
    }),
    admin: one(user, {
        fields: [courseReviews.adminId],
        references: [user.id],
    }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
    user: one(user, {
        fields: [supportTickets.userId],
        references: [user.id],
    }),
    assignedAdmin: one(user, {
        fields: [supportTickets.assignedAdminId],
        references: [user.id],
    }),
    messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
    ticket: one(supportTickets, {
        fields: [ticketMessages.ticketId],
        references: [supportTickets.id],
    }),
    sender: one(user, {
        fields: [ticketMessages.senderId],
        references: [user.id],
    }),
}));
