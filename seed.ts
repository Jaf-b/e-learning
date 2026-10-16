import { db } from "./db";
import * as schema from "./db/schema";
import { hashPassword } from "better-auth/crypto";

const RAW_PASSWORD = "Password123!";

async function main() {
    console.log("🌱 Début du seeding étendu de la base de données locale SQLite (local.db)...");

    console.log("🔒 Génération du hash sécurisé pour Better-Auth...");
    const DEFAULT_PASSWORD_HASH = await hashPassword(RAW_PASSWORD);

    // ------------------------------------------------------------------------
    // 0. NETTOYAGE COMPLET
    // ------------------------------------------------------------------------
    console.log("🧹 Nettoyage des anciennes données...");
    await db.delete(schema.ticketMessages);
    await db.delete(schema.supportTickets);
    await db.delete(schema.studentResponses);
    await db.delete(schema.questionOptions);
    await db.delete(schema.questions);
    await db.delete(schema.grades);
    await db.delete(schema.assessments);
    await db.delete(schema.creditTransfers);
    await db.delete(schema.studentEnrollments);
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
    console.log("👤 Création des utilisateurs...");

    const usersData = [
        // Admins
        { id: "usr_admin_01", name: "Admin Général", email: "admin@univ.edu", role: "ADMIN" as const },
        { id: "usr_admin_02", name: "Admin Académique", email: "acad.admin@univ.edu", role: "ADMIN" as const },

        // Enseignants
        { id: "usr_teacher_01", name: "Prof. Jean Dupont", email: "jean.dupont@univ.edu", role: "TEACHER" as const },
        { id: "usr_teacher_02", name: "Dr. Marie Curie", email: "marie.curie@univ.edu", role: "TEACHER" as const },
        { id: "usr_teacher_03", name: "Prof. Alan Turing", email: "alan.turing@univ.edu", role: "TEACHER" as const },
        { id: "usr_teacher_04", name: "Dr. Grace Hopper", email: "grace.hopper@univ.edu", role: "TEACHER" as const },

        // Étudiants (Génie Logiciel & IA)
        { id: "usr_student_01", name: "Alice Martin", email: "alice.martin@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_02", name: "Bob Bernard", email: "bob.bernard@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_03", name: "Charlie Thomas", email: "charlie.thomas@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_04", name: "David Kabangu", email: "david.kabangu@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_05", name: "Emma Watson", email: "emma.watson@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_06", name: "Franck Dubosc", email: "franck.dubosc@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_07", name: "Gisèle Bundchen", email: "gisele.b@student.univ.edu", role: "STUDENT" as const },
        { id: "usr_student_08", name: "Hugo Boss", email: "hugo.boss@student.univ.edu", role: "STUDENT" as const },
    ];

    const createdUsersMap = new Map<string, any>();

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

    const [sciencesFac] = await db.insert(schema.faculties).values({
        code: "FS",
        name: "Faculté des Sciences",
        description: "Sciences exactes et appliquées",
    }).returning();

    const [infoDept] = await db.insert(schema.departments).values({
        facultyId: sciencesFac.id,
        code: "INFO",
        name: "Département d'Informatique",
        description: "Sciences informatiques et technologies logicielles",
    }).returning();

    const [glFiliere] = await db.insert(schema.filieres).values({
        departmentId: infoDept.id,
        code: "GL",
        name: "Génie Logiciel",
        description: "Conception, développement et architecture de logiciels",
    }).returning();

    const [iaFiliere] = await db.insert(schema.filieres).values({
        departmentId: infoDept.id,
        code: "IA",
        name: "Intelligence Artificielle & Data",
        description: "Machine Learning, Big Data et Analytics",
    }).returning();

    const [ecoFac] = await db.insert(schema.faculties).values({
        code: "FSEG",
        name: "Faculté des Sciences Économiques et de Gestion",
        description: "Économie, Management et Finance d'Entreprise",
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
        description: "Gestion financière et marchés de capitaux",
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

    const enrollmentsMap = new Map<string, string>();

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
    console.log("📚 Création des cours et modules...");

    // Cours 1 : Bases de Données
    const [courseBdd] = await db.insert(schema.courses).values({
        filiereId: glFiliere.id,
        degreeLevelId: l3Level.id,
        code: "INF-301",
        title: "Bases de Données Avancées & Drizzle ORM",
        description: "Modélisation relationnelle, optimisation SQL et typage strict avec Drizzle.",
        credits: 6,
        status: "PUBLISHED",
        authorId: teacher1.id,
        syllabus: "1. Modélisation relationnelle et contraintes\n2. Indexation et requêtes analytiques\n3. ORM Drizzle et migrations automatiques\n4. Transactions et concurrence",
    }).returning();

    // Cours 2 : Web Development Next.js
    const [courseWeb] = await db.insert(schema.courses).values({
        filiereId: glFiliere.id,
        degreeLevelId: l3Level.id,
        code: "INF-302",
        title: "Développement Web Moderne avec Next.js",
        description: "Architecture Fullstack avec Server Actions, App Router et React 19.",
        credits: 5,
        status: "PUBLISHED",
        authorId: teacher2.id,
        syllabus: "1. Introduction au Server Side Rendering\n2. App Router, Layouts et Nested Routes\n3. Server Actions et validation Zod\n4. Authentification sécurisée Better-Auth",
    }).returning();

    // Cours 3 : Machine Learning
    const [courseMl] = await db.insert(schema.courses).values({
        filiereId: iaFiliere.id,
        degreeLevelId: m1Level.id,
        code: "IA-401",
        title: "Introduction au Machine Learning & Data Science",
        description: "Algorithmes de régression, classification et réseaux de neurones.",
        credits: 6,
        status: "PUBLISHED",
        authorId: teacher3.id,
        syllabus: "1. Analyse exploratoire de données\n2. Algorithmes de régression et classification\n3. Évaluation des modèles et métriques\n4. Introduction aux réseaux de neurones",
    }).returning();

    // Modules et leçons pour BDD
    const [modBdd1] = await db.insert(schema.modules).values({
        courseId: courseBdd.id,
        title: "Module 1 : Prise en main ORM & Schéma",
        order: 1,
    }).returning();

    await db.insert(schema.lessons).values([
        {
            moduleId: modBdd1.id,
            title: "1.1 Définition des tables Drizzle",
            content: "Dans cette leçon, nous découvrons la syntaxe de définition des tables en TypeScript avec Drizzle ORM, permettant de garantir l'absence d'erreurs de typage lors des requêtes.",
            order: 1,
        },
        {
            moduleId: modBdd1.id,
            title: "1.2 Relations et jointures performantes",
            content: "Étude des relations 'one' et 'many' dans Drizzle pour alimenter les composants React sans multiplier les allers-retours vers la base de données.",
            order: 2,
        },
    ]);

    const [modBdd2] = await db.insert(schema.modules).values({
        courseId: courseBdd.id,
        title: "Module 2 : Migrations et Indexation",
        order: 2,
    }).returning();

    await db.insert(schema.lessons).values([
        {
            moduleId: modBdd2.id,
            title: "2.1 Gestion des migrations Drizzle Kit",
            content: "Utilisation des commandes drizzle-kit push et generate pour faire évoluer le schéma de base de données de manière reproductible.",
            order: 1,
        },
    ]);

    // Modules et leçons pour Web Next.js
    const [modWeb1] = await db.insert(schema.modules).values({
        courseId: courseWeb.id,
        title: "Module 1 : Architecture Next.js App Router",
        order: 1,
    }).returning();

    await db.insert(schema.lessons).values([
        {
            moduleId: modWeb1.id,
            title: "1.1 Server Components vs Client Components",
            content: "Comprendre les frontières de composants client et serveur, l'optimisation des paquets JS et la sécurité des clés secrètes.",
            order: 1,
        },
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
    // 6. EXAMENS, QUIZ ET TRAVAUX PRATIQUES (AVEC QUESTIONS QCM & SOUMISSIONS)
    // ------------------------------------------------------------------------
    console.log("📝 Création des évaluations (QCM avec minuteur et TP catégorisés)...");

    // 6.1 Examen Session BDD (QCM Choix unique avec minuteur par question)
    const [examBdd] = await db.insert(schema.assessments).values({
        promotionCourseId: promoCourse1.id,
        title: "Examen Final : Bases de Données & SQL Avancé",
        description: "Épreuve sécurisée à choix unique. Chaque question est chronométrée (60 secondes). Tout changement d'onglet déclenche un avertissement de 15 secondes.",
        type: "EXAM",
        maxScore: "20.00",
        weight: "2.00",
        dueDate: "2026-11-15",
    }).returning();

    // Questions de l'examen BDD
    const [q1] = await db.insert(schema.questions).values({
        assessmentId: examBdd.id,
        prompt: "Quelle clause SQL permet de filtrer les résultats agrégés après un GROUP BY ?",
        type: "SINGLE_CHOICE",
        points: "5.00",
        orderIndex: 0,
        explanation: "La clause HAVING s'applique aux résultats des fonctions d'agrégation, tandis que WHERE filtre les lignes individuelles avant l'agrégation.",
    }).returning();

    await db.insert(schema.questionOptions).values([
        { questionId: q1.id, optionText: "WHERE", isCorrect: false, orderIndex: 0 },
        { questionId: q1.id, optionText: "HAVING", isCorrect: true, orderIndex: 1 },
        { questionId: q1.id, optionText: "ORDER BY", isCorrect: false, orderIndex: 2 },
        { questionId: q1.id, optionText: "FILTER", isCorrect: false, orderIndex: 3 },
    ]);

    const [q2] = await db.insert(schema.questions).values({
        assessmentId: examBdd.id,
        prompt: "Dans une relation 1:N entre 'Clients' et 'Commandes', où se place la clé étrangère ?",
        type: "SINGLE_CHOICE",
        points: "5.00",
        orderIndex: 1,
        explanation: "La clé étrangère se place toujours du côté 'Plusieurs' (la table Commandes) et fait référence à l'identifiant du Client.",
    }).returning();

    await db.insert(schema.questionOptions).values([
        { questionId: q2.id, optionText: "Dans la table Clients", isCorrect: false, orderIndex: 0 },
        { questionId: q2.id, optionText: "Dans la table Commandes", isCorrect: true, orderIndex: 1 },
        { questionId: q2.id, optionText: "Dans une table de liaison séparée", isCorrect: false, orderIndex: 2 },
        { questionId: q2.id, optionText: "Dans les deux tables à la fois", isCorrect: false, orderIndex: 3 },
    ]);

    const [q3] = await db.insert(schema.questions).values({
        assessmentId: examBdd.id,
        prompt: "Quel index est particulièrement adapté pour accélérer les recherches d'égalité et de plages sur des colonnes ordonnées ?",
        type: "SINGLE_CHOICE",
        points: "5.00",
        orderIndex: 2,
        explanation: "L'index B-Tree (Arbre B) est l'index standard par défaut dans la plupart des SGBD relationnels pour les requêtes avec =, <, >, BETWEEN.",
    }).returning();

    await db.insert(schema.questionOptions).values([
        { questionId: q3.id, optionText: "Index Hash", isCorrect: false, orderIndex: 0 },
        { questionId: q3.id, optionText: "Index B-Tree", isCorrect: true, orderIndex: 1 },
        { questionId: q3.id, optionText: "Index GiST", isCorrect: false, orderIndex: 2 },
        { questionId: q3.id, optionText: "Index GIN", isCorrect: false, orderIndex: 3 },
    ]);

    const [q4] = await db.insert(schema.questions).values({
        assessmentId: examBdd.id,
        prompt: "Une transaction garantissant l'intégrité respecte les propriétés ACID. Que signifie le 'I' ?",
        type: "SINGLE_CHOICE",
        points: "5.00",
        orderIndex: 3,
        explanation: "Le I signifie Isolation (les transactions concurrentes ne se parasitent pas les unes les autres).",
    }).returning();

    await db.insert(schema.questionOptions).values([
        { questionId: q4.id, optionText: "Intégrité", isCorrect: false, orderIndex: 0 },
        { questionId: q4.id, optionText: "Isolation", isCorrect: true, orderIndex: 1 },
        { questionId: q4.id, optionText: "Indépendance", isCorrect: false, orderIndex: 2 },
        { questionId: q4.id, optionText: "Immutabilité", isCorrect: false, orderIndex: 3 },
    ]);

    // 6.2 Quiz / Interrogation Web Next.js
    const [quizWeb] = await db.insert(schema.assessments).values({
        promotionCourseId: promoCourse2.id,
        title: "Interrogation 1 : React Server Components & Server Actions",
        description: "Test de connaissances rapide chronométré à 60s par question.",
        type: "QUIZ",
        maxScore: "20.00",
        weight: "1.00",
        dueDate: "2026-10-30",
    }).returning();

    const [qw1] = await db.insert(schema.questions).values({
        assessmentId: quizWeb.id,
        prompt: "Quelle directive doit figurer en début de fichier pour définir un composant interactif côté client dans Next.js ?",
        type: "SINGLE_CHOICE",
        points: "10.00",
        orderIndex: 0,
        explanation: "'use client' indique à Next.js et React que ce composant s'exécute côté client et peut utiliser des hooks comme useState et useEffect.",
    }).returning();

    await db.insert(schema.questionOptions).values([
        { questionId: qw1.id, optionText: "\"use client\"", isCorrect: true, orderIndex: 0 },
        { questionId: qw1.id, optionText: "\"use server\"", isCorrect: false, orderIndex: 1 },
        { questionId: qw1.id, optionText: "\"use state\"", isCorrect: false, orderIndex: 2 },
        { questionId: qw1.id, optionText: "\"client side\"", isCorrect: false, orderIndex: 3 },
    ]);

    const [qw2] = await db.insert(schema.questions).values({
        assessmentId: quizWeb.id,
        prompt: "Vrai ou Faux : Les Server Actions de Next.js peuvent s'exécuter directement sans créer d'API REST manuelle.",
        type: "TRUE_FALSE",
        points: "10.00",
        orderIndex: 1,
        explanation: "Vrai. Les Server Actions sont des fonctions asynchrones serveur directement appelables depuis un formulaire ou un composant React.",
    }).returning();

    await db.insert(schema.questionOptions).values([
        { questionId: qw2.id, optionText: "Vrai", isCorrect: true, orderIndex: 0 },
        { questionId: qw2.id, optionText: "Faux", isCorrect: false, orderIndex: 1 },
    ]);

    // 6.3 Travaux Pratiques (TP) avec soumissions pour tester la catégorisation
    console.log("📁 Création des TP et des soumissions étudiantes...");

    // TP 1
    const [tp1] = await db.insert(schema.assessments).values({
        promotionCourseId: promoCourse1.id,
        title: "TP 1 : Modélisation et Mise en place de l'ORM",
        description: "Consignes :\n1. Modélisez le schéma avec Drizzle ORM\n2. Configurez les relations\n3. Livrable : Rapport technique + code source ou lien GitHub.",
        type: "TP",
        maxScore: "20.00",
        weight: "1.00",
        dueDate: "2026-11-20",
    }).returning();

    // TP 2
    const [tp2] = await db.insert(schema.assessments).values({
        promotionCourseId: promoCourse1.id,
        title: "TP 2 : Requêtes Complexes, Agrégations & Pagination",
        description: "Consignes :\n1. Implémentez des filtres dynamiques\n2. Mettez en place la pagination avec LIMIT et OFFSET\n3. Livrable : Code source commenté.",
        type: "TP",
        maxScore: "20.00",
        weight: "1.00",
        dueDate: "2026-12-05",
    }).returning();

    // Soumissions pour le TP 1 (Alice & Bob)
    const enrAlice = enrollmentsMap.get("usr_student_01");
    const enrBob = enrollmentsMap.get("usr_student_02");
    const enrCharlie = enrollmentsMap.get("usr_student_03");
    const enrDavid = enrollmentsMap.get("usr_student_04");

    if (enrAlice) {
        const [gAlice] = await db.insert(schema.grades).values({
            assessmentId: tp1.id,
            studentEnrollmentId: enrAlice,
            score: "18.50",
            feedback: "Excellent travail d'architecture ! Schéma très propre et bien typé.",
        }).returning();

        // Réponse avec fichier joint
        await db.insert(schema.studentResponses).values({
            studentEnrollmentId: enrAlice,
            questionId: q1.id, // Rattaché pour l'association
            textAnswer: "Voici le lien vers notre dépôt GitHub contenant le projet :\nhttps://github.com/alice-martin/db-drizzle-tp1\n\nTous les tests unitaires passent avec succès.",
            fileUrl: "https://example.com/uploads/tp1-alice-martin-rapport.pdf",
            scoreObtained: "18.50",
        });
    }

    if (enrBob) {
        // En attente de correction (score null)
        await db.insert(schema.grades).values({
            assessmentId: tp1.id,
            studentEnrollmentId: enrBob,
            score: null,
            feedback: null,
        });

        await db.insert(schema.studentResponses).values({
            studentEnrollmentId: enrBob,
            questionId: q1.id,
            textAnswer: "Monsieur, voici mon compte-rendu pour le TP 1. J'ai eu quelques difficultés avec la pagination que j'ai détaillée dans le document joint.",
            fileUrl: "https://example.com/uploads/tp1-bob-bernard-code.zip",
            scoreObtained: null,
        });
    }

    // Soumissions pour le TP 2 (Charlie & David)
    if (enrCharlie) {
        await db.insert(schema.grades).values({
            assessmentId: tp2.id,
            studentEnrollmentId: enrCharlie,
            score: "16.00",
            feedback: "Bonne implémentation de la pagination et gestion d'erreurs robuste.",
        });

        await db.insert(schema.studentResponses).values({
            studentEnrollmentId: enrCharlie,
            questionId: q2.id,
            textAnswer: "TP 2 terminé. J'ai ajouté des index composites pour accélérer les requêtes de recherche.",
            fileUrl: "https://example.com/uploads/tp2-charlie-thomas.pdf",
            scoreObtained: "16.00",
        });
    }

    if (enrDavid) {
        // En attente de correction pour TP 2
        await db.insert(schema.grades).values({
            assessmentId: tp2.id,
            studentEnrollmentId: enrDavid,
            score: null,
            feedback: null,
        });

        await db.insert(schema.studentResponses).values({
            studentEnrollmentId: enrDavid,
            questionId: q2.id,
            textAnswer: "Travail soumis le 16 octobre. Dépôt accessible avec la documentation de l'API.",
            fileUrl: "https://example.com/uploads/tp2-david-rendu.zip",
            scoreObtained: null,
        });
    }

    // ------------------------------------------------------------------------
    // 7. TICKETS DE SUPPORT MULTIPLES
    // ------------------------------------------------------------------------
    console.log("🎫 Création de tickets de support...");

    const [t1] = await db.insert(schema.supportTickets).values({
        userId: "usr_student_01",
        assignedAdminId: admin1.id,
        subject: "Question sur le minutage des examens",
        status: "RESOLVED",
    }).returning();

    await db.insert(schema.ticketMessages).values([
        { ticketId: t1.id, senderId: "usr_student_01", message: "Bonjour, est-ce que le minuteur passe automatiquement à la question suivante à 0s ?" },
        { ticketId: t1.id, senderId: admin1.id, message: "Oui tout à fait, le système valide votre réponse et enchaîne automatiquement avec la suivante." },
    ]);

    const [t2] = await db.insert(schema.supportTickets).values({
        userId: "usr_student_05",
        assignedAdminId: admin1.id,
        subject: "Demande de précision sur la date du TP 1",
        status: "IN_PROGRESS",
    }).returning();

    await db.insert(schema.ticketMessages).values([
        { ticketId: t2.id, senderId: "usr_student_05", message: "La date limite pour le TP est-elle fixée à minuit ou avant le cours ?" },
    ]);

    console.log("\n==================================================");
    console.log("🚀 MIGRATION ET SEEDING SQLITE TERMINÉS AVEC SUCCÈS !");
    console.log("==================================================");
    console.log(`📁 Fichier local généré : local.db`);
    console.log(`🔑 Mot de passe global pour TOUS les comptes : ${RAW_PASSWORD}\n`);
    console.log("Comptes de test pré-configurés :");
    console.log("  • Admins    : admin@univ.edu | acad.admin@univ.edu");
    console.log("  • Profs     : jean.dupont@univ.edu | marie.curie@univ.edu | alan.turing@univ.edu");
    console.log("  • Étudiants : alice.martin@student.univ.edu | bob.bernard@student.univ.edu (et 6 autres)");
    console.log("==================================================\n");
}

main()
    .catch((e) => {
        console.error("❌ Erreur pendant le seeding :", e);
        process.exit(1);
    });