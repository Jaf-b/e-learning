import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema";
import dotenv from "dotenv";
import { hashPassword } from "better-auth/crypto";
// Alternative sans better-auth : import bcrypt from "bcrypt";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/votre_db",
});

const db = drizzle(pool, { schema });

const RAW_PASSWORD = "Password123!";

async function main() {
    console.log("🌱 Début du seeding étendu de la base de données...");

    console.log("🔒 Génération du hash valide pour Better-Auth...");
    const DEFAULT_PASSWORD_HASH = await hashPassword(RAW_PASSWORD);

    // ------------------------------------------------------------------------
    // 0. NETTOYAGE COMPLET
    // ------------------------------------------------------------------------
    console.log("🧹 Nettoyage de l'ancienne base de données...");
    await db.delete(schema.ticketMessages);
    await db.delete(schema.supportTickets);
    await db.delete(schema.grades);
    await db.delete(schema.studentEnrollments);
    await db.delete(schema.creditTransfers);
    await db.delete(schema.promotionCourses);
    await db.delete(schema.lessons);
    await db.delete(schema.modules);
    await db.delete(schema.courseReviews);
    await db.delete(schema.courses);
    await db.delete(schema.promotions);
    await db.delete(schema.academicYears);
    await db.delete(schema.degreeLevels);
    await db.delete(schema.degrees);
    await db.delete(schema.filieres);
    await db.delete(schema.departments);
    await db.delete(schema.faculties);
    await db.delete(schema.auditLogs);
    await db.delete(schema.session);
    await db.delete(schema.account);
    await db.delete(schema.verification);
    await db.delete(schema.user);

    // ------------------------------------------------------------------------
    // 1. UTILISATEURS MULTIPLES (Admins, Profs, Étudiants)
    // ------------------------------------------------------------------------
    console.log("👤 Création des utilisateurs multiples...");

    const usersData = [
        // Admins
        { id: "usr_admin_01", name: "Admin Général", email: "admin@univ.edu", role: "ADMIN" as const },
        { id: "usr_admin_02", name: "Admin Académique", email: "acad.admin@univ.edu", role: "ADMIN" as const },

        // Enseignants
        { id: "usr_teacher_01", name: "Prof. Jean Dupont", email: "jean.dupont@univ.edu", role: "TEACHER" as const },
        { id: "usr_teacher_02", name: "Dr. Marie Curie", email: "marie.curie@univ.edu", role: "TEACHER" as const },
        { id: "usr_teacher_03", name: "Prof. Alan Turing", email: "alan.turing@univ.edu", role: "TEACHER" as const },
        { id: "usr_teacher_04", name: "Dr. Grace Hopper", email: "grace.hopper@univ.edu", role: "TEACHER" as const },

        // Étudiants (Génie Logiciel & Eco-Gestion)
        { id: "usr_student_01", name: "Alice Martin", email: "alice.martin@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_02", name: "Bob Bernard", email: "bob.bernard@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_03", name: "Charlie Thomas", email: "charlie.thomas@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_04", name: "David Kabangu", email: "david.kabangu@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_05", name: "Emma Watson", email: "emma.watson@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_06", name: "Franck Dubosc", email: "franck.dubosc@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_07", name: "Gisèle Bundchen", email: "gisele.b@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_08", name: "Hugo Boss", email: "hugo.boss@student.univ.edu", role: "STUDENT" as const },
    ];

    const createdUsersMap = new Map();

    for (const u of usersData) {
        const [newUser] = await db.insert(schema.user).values({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            emailVerified: true,
            banned: false,
            banReason: null,
            banExpires: null,
            isActive: true,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name.replace(/\s+/g, '')}`,
        }).returning();

        await db.insert(schema.account).values({
            id: `acc_${u.id}`,
            userId: newUser.id,
            accountId: newUser.email,
            providerId: "credential",
            password: DEFAULT_PASSWORD_HASH,
        });

        createdUsersMap.set(u.id, newUser);
    }

    const admin1 = createdUsersMap.get("usr_admin_01");
    const teacher1 = createdUsersMap.get("usr_teacher_01");
    const teacher2 = createdUsersMap.get("usr_teacher_02");
    const teacher3 = createdUsersMap.get("usr_teacher_03");

    // ------------------------------------------------------------------------
    // 2. FACULTÉS, DÉPARTEMENTS ET FILIÈRES
    // ------------------------------------------------------------------------
    console.log("🏛️ Création de la structure académique (Sciences & Économie)...");

    // Faculté 1 : Sciences
    const [sciencesFac] = await db.insert(schema.faculties).values({
        code: "FS",
        name: "Faculté des Sciences",
        description: "Sciences exactes et appliquées",
    }).returning();

    const [infoDept] = await db.insert(schema.departments).values({
        facultyId: sciencesFac.id,
        code: "INFO",
        name: "Département d'Informatique",
        description: "Sciences informatiques et technologies",
    }).returning();

    const [glFiliere] = await db.insert(schema.filieres).values({
        departmentId: infoDept.id,
        code: "GL",
        name: "Génie Logiciel",
        description: "Conception et développement de logiciels",
    }).returning();

    const [iaFiliere] = await db.insert(schema.filieres).values({
        departmentId: infoDept.id,
        code: "IA",
        name: "Intelligence Artificielle & Data",
        description: "Machine Learning, Big Data et Analytics",
    }).returning();

    // Faculté 2 : Économie
    const [ecoFac] = await db.insert(schema.faculties).values({
        code: "FSEG",
        name: "Faculté des Sciences Économiques et de Gestion",
        description: "Économie, Management et Finance",
    }).returning();

    const [gestionDept] = await db.insert(schema.departments).values({
        facultyId: ecoFac.id,
        code: "GEST",
        name: "Département de Gestion",
        description: "Management d'entreprise et finance",
    }).returning();

    const [financeFiliere] = await db.insert(schema.filieres).values({
        departmentId: gestionDept.id,
        code: "FIN",
        name: "Finance d'Entreprise",
        description: "Gestion financière et marchés",
    }).returning();

    // ------------------------------------------------------------------------
    // 3. DIPLÔMES ET NIVEAUX
    // ------------------------------------------------------------------------
    console.log("🎓 Création des niveaux de diplôme...");

    const [licenceDegree] = await db.insert(schema.degrees).values({
        code: "LICENCE",
        name: "Licence",
        hierarchyRank: 1,
        totalCreditsRequired: 180,
    }).returning();

    const [masterDegree] = await db.insert(schema.degrees).values({
        code: "MASTER",
        name: "Master",
        hierarchyRank: 2,
        totalCreditsRequired: 120,
    }).returning();

    const [l3Level] = await db.insert(schema.degreeLevels).values({
        degreeId: licenceDegree.id,
        code: "L3",
        name: "Licence 3ème année",
        levelOrder: 3,
    }).returning();

    const [m1Level] = await db.insert(schema.degreeLevels).values({
        degreeId: masterDegree.id,
        code: "M1",
        name: "Master 1ère année",
        levelOrder: 4,
    }).returning();

    // Année Académique
    const [academicYear] = await db.insert(schema.academicYears).values({
        year: "2025-2026",
        isCurrent: true,
    }).returning();

    // Promotions (Classes)
    const [promoL3Gl] = await db.insert(schema.promotions).values({
        filiereId: glFiliere.id,
        degreeLevelId: l3Level.id,
        academicYearId: academicYear.id,
        code: "L3-GL-2025-2026",
    }).returning();

    const [promoM1Ia] = await db.insert(schema.promotions).values({
        filiereId: iaFiliere.id,
        degreeLevelId: m1Level.id,
        academicYearId: academicYear.id,
        code: "M1-IA-2025-2026",
    }).returning();

    // ------------------------------------------------------------------------
    // 4. INSCRIPTION DES ÉTUDIANTS DANS LES PROMOTIONS
    // ------------------------------------------------------------------------
    console.log("📝 Inscription des étudiants...");

    const studentIdsGL = ["usr_student_01", "usr_student_02", "usr_student_03", "usr_student_04"];
    const studentIdsIA = ["usr_student_05", "usr_student_06", "usr_student_07", "usr_student_08"];

    const enrollmentsMap = new Map();

    for (const sId of studentIdsGL) {
        const [enr] = await db.insert(schema.studentEnrollments).values({
            studentId: sId,
            promotionId: promoL3Gl.id,
            status: "ACTIVE",
        }).returning();
        enrollmentsMap.set(sId, enr.id);
    }

    for (const sId of studentIdsIA) {
        const [enr] = await db.insert(schema.studentEnrollments).values({
            studentId: sId,
            promotionId: promoM1Ia.id,
            status: "ACTIVE",
        }).returning();
        enrollmentsMap.set(sId, enr.id);
    }

    // ------------------------------------------------------------------------
    // 5. COURS, MODULES ET LEÇONS
    // ------------------------------------------------------------------------
    console.log("📚 Création des cours et de leur contenu...");

    // Cours 1 : Bases de Données
    const [courseBdd] = await db.insert(schema.courses).values({
        filiereId: glFiliere.id,
        degreeLevelId: l3Level.id,
        code: "INF-301",
        title: "Bases de Données Avancées",
        description: "Optimisation SQL et ORM",
        credits: 6,
        status: "PUBLISHED",
        authorId: teacher1.id,
    }).returning();

    // Cours 2 : Web Development
    const [courseWeb] = await db.insert(schema.courses).values({
        filiereId: glFiliere.id,
        degreeLevelId: l3Level.id,
        code: "INF-302",
        title: "Développement Web Modern (Next.js)",
        description: "Architecture Fullstack avec Server Actions & React",
        credits: 5,
        status: "PUBLISHED",
        authorId: teacher2.id,
    }).returning();

    // Cours 3 : Machine Learning
    const [courseMl] = await db.insert(schema.courses).values({
        filiereId: iaFiliere.id,
        degreeLevelId: m1Level.id,
        code: "IA-401",
        title: "Introduction au Machine Learning",
        description: "Algorithmes de régression, classification et réseaux de neurones",
        credits: 6,
        status: "PUBLISHED",
        authorId: teacher3.id,
    }).returning();

    // Leçons pour Course BDD
    const [modBdd1] = await db.insert(schema.modules).values({ courseId: courseBdd.id, title: "Prise en main ORM", order: 1 }).returning();
    await db.insert(schema.lessons).values([
        { moduleId: modBdd1.id, title: "Drizzle Schema Setup", content: "Définition des schémas...", order: 1 },
        { moduleId: modBdd1.id, title: "Relations et Joitures", content: "Requêtes avancées avec drizzle-orm...", order: 2 },
    ]);

    // Affectation des cours aux promotions (Promotion Courses)
    const [promoCourse1] = await db.insert(schema.promotionCourses).values({
        promotionId: promoL3Gl.id,
        courseId: courseBdd.id,
        teacherId: teacher1.id,
        semester: "S1",
    }).returning();

    const [promoCourse2] = await db.insert(schema.promotionCourses).values({
        promotionId: promoL3Gl.id,
        courseId: courseWeb.id,
        teacherId: teacher2.id,
        semester: "S1",
    }).returning();

    const [promoCourse3] = await db.insert(schema.promotionCourses).values({
        promotionId: promoM1Ia.id,
        courseId: courseMl.id,
        teacherId: teacher3.id,
        semester: "S1",
    }).returning();

    // ------------------------------------------------------------------------
    // 6. NOTES ET ÉVALUATIONS
    // ------------------------------------------------------------------------
    console.log("📊 Attribution des notes...");

    const [assess1] = await db.insert(schema.assessments).values({
        promotionCourseId: promoCourse1.id,
        title: "Examen BDD",
        type: "EXAM",
        maxScore: "20.00",
        weight: "1.00",
    }).returning();

    const [assess2] = await db.insert(schema.assessments).values({
        promotionCourseId: promoCourse2.id,
        title: "TP Web",
        type: "TP",
        maxScore: "20.00",
        weight: "1.00",
    }).returning();

    // Notes pour L3-GL
    for (const sId of studentIdsGL) {
        const enrId = enrollmentsMap.get(sId);
        if (enrId) {
            await db.insert(schema.grades).values([
                {
                    assessmentId: assess1.id,
                    studentEnrollmentId: enrId,
                    score: (Math.random() * 5 + 14).toFixed(2),
                },
                {
                    assessmentId: assess2.id,
                    studentEnrollmentId: enrId,
                    score: (Math.random() * 6 + 10).toFixed(2),
                }
            ]);
        }
    }

    // ------------------------------------------------------------------------
    // 7. TICKETS DE SUPPORT MULTIPLES
    // ------------------------------------------------------------------------
    console.log("🎫 Création de tickets de support de test...");

    const [t1] = await db.insert(schema.supportTickets).values({
        userId: "usr_student_01",
        assignedAdminId: admin1.id,
        subject: "Problème d'accès au cours INF-301",
        status: "RESOLVED",
    }).returning();

    await db.insert(schema.ticketMessages).values([
        { ticketId: t1.id, senderId: "usr_student_01", message: "Impossible d'accéder aux vidéos." },
        { ticketId: t1.id, senderId: admin1.id, message: "Accès rétabli, désolé pour la gêne !" },
    ]);

    const [t2] = await db.insert(schema.supportTickets).values({
        userId: "usr_student_05",
        assignedAdminId: admin1.id,
        subject: "Erreur de saisie de note en Machine Learning",
        status: "IN_PROGRESS",
    }).returning();

    await db.insert(schema.ticketMessages).values({
        ticketId: t2.id,
        senderId: "usr_student_05",
        message: "Ma note enregistrée est de 12 au lieu de 16.",
    });

    console.log("\n==================================================");
    console.log("🚀 SEED ÉTENDU TERMINÉ AVEC SUCCÈS !");
    console.log("==================================================");
    console.log(`🔑 Mot de passe global pour TOUS les comptes : ${RAW_PASSWORD}\n`);
    console.log("Comptes de test disponibles :");
    console.log("  • Admins    : admin@univ.edu | acad.admin@univ.edu");
    console.log("  • Profs     : jean.dupont@univ.edu | marie.curie@univ.edu | alan.turing@univ.edu");
    console.log("  • Etudiants : alice.martin@student.univ.edu | emma.watson@student.univ.edu (et 6 autres)");
    console.log("==================================================\n");
}

main()
    .catch((e) => {
        console.error("❌ Erreur pendant le seeding :", e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
    });