import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    boolean,
    timestamp,
    pgEnum,
    decimal,
    jsonb,
    index,
    numeric,
    date,

} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// 1. ENUMS SYSTEME
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "TEACHER", "STUDENT"]);

export const courseStatusEnum = pgEnum("course_status", [
    "DRAFT",
    "PENDING_REVIEW",
    "PUBLISHED",
    "REJECTED",
    "ARCHIVED",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
    "ACTIVE",
    "PASSED",
    "FAILED",
    "REORIENTED",
    "GRADUATED",
]);

export const ticketStatusEnum = pgEnum("ticket_status", ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]);

// ============================================================================
// 2. SÉCURITÉ & UTILISATEURS
// ============================================================================

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    role: userRoleEnum("role").notNull().default("STUDENT"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    isActive: boolean("is_active").default(true),
    lastLoginAt: timestamp("last_login_at"),
});

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        impersonatedBy: text("impersonated_by"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
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
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

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


export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 100 }).notNull(), // ex: "USER_ROLE_UPDATED", "COURSE_APPROVED"
    targetEntity: varchar("target_entity", { length: 50 }).notNull(), // ex: "courses", "user"
    targetId: uuid("target_id").notNull(),
    metadata: jsonb("metadata"), // Données contextuelles (anciennes/nouvelles valeurs)
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// 3. STRUCTURE ACADÉMIQUE DYNAMIQUE
// ============================================================================

export const faculties = pgTable("faculties", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 20 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
});

export const departments = pgTable("departments", {
    id: uuid("id").primaryKey().defaultRandom(),
    facultyId: uuid("faculty_id").notNull().references(() => faculties.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 20 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
});

export const filieres = pgTable("filieres", {
    id: uuid("id").primaryKey().defaultRandom(),
    departmentId: uuid("department_id").notNull().references(() => departments.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 20 }).notNull(), // "GL", "SI"
    name: varchar("name", { length: 255 }).notNull(), // "Génie Logiciel"
    description: text("description"),
});

export const degrees = pgTable("degrees", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 20 }).notNull().unique(), // "LICENCE", "MASTER", "INGENIEUR"
    name: varchar("name", { length: 255 }).notNull(),
    hierarchyRank: integer("hierarchy_rank").notNull(), // 1 (Bac+3), 2 (Bac+5), 3 (Bac+8)
    totalCreditsRequired: integer("total_credits_required"),
});

export const degreeLevels = pgTable("degree_levels", {
    id: uuid("id").primaryKey().defaultRandom(),
    degreeId: uuid("degree_id").notNull().references(() => degrees.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 20 }).notNull(), // "L1", "L2", "L3", "M1"
    name: varchar("name", { length: 100 }).notNull(),
    levelOrder: integer("level_order").notNull(), // 1, 2, 3...
});

export const academicYears = pgTable("academic_years", {
    id: uuid("id").primaryKey().defaultRandom(),
    year: varchar("year", { length: 20 }).notNull().unique(), // "2025-2026"
    isCurrent: boolean("is_current").notNull().default(false),
});

export const promotions = pgTable("promotions", {
    id: uuid("id").primaryKey().defaultRandom(),
    filiereId: uuid("filiere_id").notNull().references(() => filieres.id, { onDelete: "cascade" }),
    degreeLevelId: uuid("degree_level_id").notNull().references(() => degreeLevels.id),
    academicYearId: uuid("academic_year_id").notNull().references(() => academicYears.id),
    code: varchar("code", { length: 50 }).notNull(), // "L3-GL-2025"
});

// ============================================================================
// 4. COURS, CONTENU & WORKFLOW DE VALIDATION
// ============================================================================

// Catalogue général de cours canoniques
export const courses = pgTable("courses", {
    id: uuid("id").primaryKey().defaultRandom(),
    filiereId: uuid("filiere_id").notNull().references(() => filieres.id),
    degreeLevelId: uuid("degree_level_id").notNull().references(() => degreeLevels.id),
    code: varchar("code", { length: 20 }).notNull().unique(), // "INF-301"
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    credits: integer("credits").notNull(),
    status: courseStatusEnum("status").notNull().default("DRAFT"),
    authorId: text("author_id").notNull().references(() => user.id),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courseReviews = pgTable("course_reviews", {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    adminId: text("admin_id").notNull().references(() => user.id),
    decision: courseStatusEnum("decision").notNull(), // PUBLISHED ou REJECTED
    feedback: text("feedback"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const modules = pgTable("modules", {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    order: integer("order").notNull(),
});

export const lessons = pgTable("lessons", {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content"),
    videoUrl: text("video_url"),
    order: integer("order").notNull(),
});

// Instance du cours dispensé à une promotion spécifique
export const promotionCourses = pgTable("promotion_courses", {
    id: uuid("id").primaryKey().defaultRandom(),
    promotionId: uuid("promotion_id").notNull().references(() => promotions.id, { onDelete: "cascade" }),
    courseId: uuid("course_id").notNull().references(() => courses.id),
    teacherId: text("teacher_id").references(() => user.id),
    semester: varchar("semester", { length: 10 }).notNull(), // "S1", "S2"
});

// ============================================================================
// 5. ETUDIANTS, INSCRIPTIONS & NOTES
// ============================================================================

export const studentEnrollments = pgTable("student_enrollments", {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: text("student_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    promotionId: uuid("promotion_id").notNull().references(() => promotions.id),
    status: enrollmentStatusEnum("status").notNull().default("ACTIVE"),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

export const creditTransfers = pgTable("credit_transfers", {
    id: uuid("id").primaryKey().defaultRandom(),
    studentId: text("student_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    fromPromotionId: uuid("from_promotion_id").references(() => promotions.id),
    toPromotionId: uuid("to_promotion_id").references(() => promotions.id),
    transferredCredits: integer("transferred_credits").notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// 6. SUPPORT UTILISATEUR & TICKETING
// ============================================================================

export const supportTickets = pgTable("support_tickets", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    assignedAdminId: text("assigned_admin_id").references(() => user.id),
    subject: varchar("subject", { length: 255 }).notNull(),
    status: ticketStatusEnum("status").notNull().default("OPEN"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ticketMessages = pgTable("ticket_messages", {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
    senderId: text("sender_id").notNull().references(() => user.id),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// 7. RELATIONS DRIZZLE (POPULATION & JOINTURES TYPE-SAFE)
// ============================================================================



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

// 2. Table des Évaluations (Créée par l'enseignant ou l'administration)

export const assessmentTypeEnum = pgEnum("assessment_type", [
    "EXAM",          // Examen de session
    "RETAKE_EXAM",   // Examen de rattrapage
    "TP",            // Travail Pratique / Projet
    "QUIZ",          // Interrogation / Test rapide
    "ASSIGNMENT",    // Devoir à domicile / TP de recherche
]);

export const assessments = pgTable("assessments", {
    id: uuid("id").defaultRandom().primaryKey(),

    title: text("title").notNull(), // ex: "TP 1 : Normalisation SQL", "Examen Final"
    description: text("description"),

    type: assessmentTypeEnum("type").notNull().default("QUIZ"),

    // Rattaché à un cours donné d'une promotion donnée
    promotionCourseId: uuid("promotion_course_id")
        .notNull()
        .references(() => promotionCourses.id, { onDelete: "cascade" }),

    // Note maximale possible (ex: 20, 100, 50)
    maxScore: numeric("max_score", { precision: 5, scale: 2 }).notNull().default("20.00"),

    // Pondération / Pourcentage dans la note finale du cours (ex: 40 pour 40%)
    weight: numeric("weight", { precision: 5, scale: 2 }).notNull().default("1.00"),

    dueDate: date("due_date"), // Date limite ou date de l'examen
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 3. Table des Notes (Les points attribués aux étudiants)
export const grades = pgTable("grades", {
    id: uuid("id").defaultRandom().primaryKey(),

    assessmentId: uuid("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),

    // L'inscription spécifique de l'étudiant dans cette promotion
    studentEnrollmentId: uuid("student_enrollment_id")
        .notNull()
        .references(() => studentEnrollments.id, { onDelete: "cascade" }),

    // La note obtenue (ex: 15.5)
    score: numeric("score", { precision: 5, scale: 2 }),

    // Remarques ou justifications (ex: "Absence justifiée", "Excellente analyse")
    feedback: text("feedback"),

    // Date de saisie ou de publication de la note
    gradedAt: timestamp("graded_at").defaultNow(),
});
// Relations pour l'épreuve
export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
    promotionCourse: one(promotionCourses, {
        fields: [assessments.promotionCourseId],
        references: [promotionCourses.id],
    }),
    grades: many(grades),
    questions: many(questions),
}));



// 2. Relations sur la table promotionCourses
export const promotionCoursesRelations = relations(promotionCourses, ({ one, many }) => ({
    course: one(courses, {
        fields: [promotionCourses.courseId],
        references: [courses.id],
    }),
    assessments: many(assessments),
}));

// Relations pour les notes
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

// Types de questions pris en charge
export const questionTypeEnum = pgEnum("question_type", [
    "SINGLE_CHOICE",   // QCM choix unique (Radio button)
    "MULTIPLE_CHOICE", // QCM choix multiples (Checkbox)
    "TRUE_FALSE",      // Vrai / Faux
    "TEXT",            // Réponse courte textuelle
    "ESSAY",           // Réponse longue / Rédaction
]);

// --- 1. Table des Questions ---
export const questions = pgTable("questions", {
    id: uuid("id").defaultRandom().primaryKey(),

    assessmentId: uuid("assessment_id")
        .notNull()
        .references(() => assessments.id, { onDelete: "cascade" }),

    prompt: text("prompt").notNull(), // L'énoncé de la question
    type: questionTypeEnum("type").notNull().default("SINGLE_CHOICE"),

    points: numeric("points", { precision: 5, scale: 2 }).notNull().default("1.00"), // Points attribués à cette question
    orderIndex: integer("order_index").notNull().default(0), // Ordre d'affichage de la question

    explanation: text("explanation"), // Explication optionnelle affichée après la correction
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- 2. Table des Options de choix (pour QCM et Vrai/Faux) ---
export const questionOptions = pgTable("question_options", {
    id: uuid("id").defaultRandom().primaryKey(),

    questionId: uuid("question_id")
        .notNull()
        .references(() => questions.id, { onDelete: "cascade" }),

    optionText: text("option_text").notNull(), // Ex: "PostgreSQL", "MongoDB"
    isCorrect: boolean("is_correct").notNull().default(false), // Vrai si c'est la bonne réponse
    orderIndex: integer("order_index").notNull().default(0),
});

// --- 3. Table des Réponses des Étudiants ---
export const studentResponses = pgTable("student_responses", {
    id: uuid("id").defaultRandom().primaryKey(),

    studentEnrollmentId: uuid("student_enrollment_id")
        .notNull()
        .references(() => studentEnrollments.id, { onDelete: "cascade" }),

    questionId: uuid("question_id")
        .notNull()
        .references(() => questions.id, { onDelete: "cascade" }),

    // Si c'est un QCM : référence vers l'option choisie par l'étudiant
    selectedOptionId: uuid("selected_option_id")
        .references(() => questionOptions.id, { onDelete: "set null" }),

    // Si c'est une question ouverte/rédaction : texte saisi par l'étudiant
    textAnswer: text("text_answer"),

    // Points attribués à cette réponse spécifique (rempli automatiquement pour QCM ou par le prof)
    scoreObtained: numeric("score_obtained", { precision: 5, scale: 2 }),

    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

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
