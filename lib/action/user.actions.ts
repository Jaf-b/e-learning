"use server"

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { enrollStudent } from "@/lib/action/student-enrollement.actions";
import { user, courses, faculties, departments, filieres, studentEnrollments } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { unstable_cache, updateTag, revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Cached reads
// ---------------------------------------------------------------------------

export const getAllUsers = unstable_cache(
    async () => {
        try {
            const result = await db.query.user.findMany({
                orderBy: (users, { desc }) => [desc(users.createdAt)],
            });
            return { success: true, data: result ?? [] };
        } catch (error) {
            console.error("Erreur getAllUsers:", error);
            return { success: false, data: [], error: "Erreur de chargement des utilisateurs." };
        }
    },
    ["users-list"],
    { tags: ["users"], revalidate: 3600 }
);

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createUser(data: string) {
    try {
        const parsedData = JSON.parse(data);
        const { enrollment, password, ...userData } = parsedData;

        // ✅ Utiliser createUser via l'API Admin au lieu de signUpEmail
        // Cet appel crée le compte SANS modifier les cookies de session de l'admin
        const createdUserResponse = await auth.api.createUser({
            body: {
                ...userData,
                password: password, // Mot de passe du nouvel utilisateur
                role: userData.role || "STUDENT",
            },
        });

        const newUser = "user" in createdUserResponse ? createdUserResponse.user : createdUserResponse;

        if (newUser && enrollment && enrollment.promotionId) {
            await enrollStudent({
                studentId: newUser.id,
                promotionId: enrollment.promotionId,
            });
        }

        updateTag("users");
        updateTag("admin-dashboard");
        revalidatePath("/admin/user-management");
        revalidatePath("/admin");

        return { success: true, data: newUser };
    } catch (error: any) {
        console.error("Erreur createUser:", error);
        return {
            success: false,
            error: error?.message || "Impossible de créer l'utilisateur."
        };
    }
}
export async function updateUser(id: string, data: Partial<{
    name: string;
    email: string;
    role: string;
    image: string | null;
}>) {
    try {
        const payload: Record<string, unknown> = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.email !== undefined) payload.email = data.email;
        if (data.role !== undefined) payload.role = data.role;
        if (data.image !== undefined) payload.image = data.image || null;

        const [updatedUser] = await db
            .update(user)
            .set(payload)
            .where(eq(user.id, id))
            .returning();

        updateTag("users");
        updateTag("admin-dashboard");
        revalidatePath("/admin/user-management");
        revalidatePath("/admin");
        return { success: true, data: updatedUser };
    } catch (error: any) {
        console.error("Erreur updateUser:", error);
        return { success: false, error: error?.message || "Impossible de mettre à jour l'utilisateur." };
    }
}

export async function deleteUser(id: string) {
    try {
        const [deletedUser] = await db
            .delete(user)
            .where(eq(user.id, id))
            .returning();

        updateTag("users");
        updateTag("admin-dashboard");
        revalidatePath("/admin/user-management");
        revalidatePath("/admin");
        return { success: true, data: deletedUser };
    } catch (error: any) {
        console.error("Erreur deleteUser:", error);
        return { success: false, error: error?.message || "Impossible de supprimer l'utilisateur." };
    }
}

// ---------------------------------------------------------------------------
// Dashboard overview (optimized SQL aggregate queries + cached)
// ---------------------------------------------------------------------------

export const getAdminDashboardOverview = unstable_cache(
    async () => {
        try {
            // Concurrently execute optimized SQL COUNT, GROUP BY and LIMIT queries
            const [
                totalUsersRes,
                roleCountsRes,
                totalCoursesRes,
                courseStatusCountsRes,
                totalFacultiesRes,
                totalDepartmentsRes,
                totalFilieresRes,
                totalEnrollmentsRes,
                recentUsers,
                recentCourses,
            ] = await Promise.all([
                db.select({ count: count() }).from(user),
                db.select({ role: user.role, count: count() }).from(user).groupBy(user.role),
                db.select({ count: count() }).from(courses),
                db.select({ status: courses.status, count: count() }).from(courses).groupBy(courses.status),
                db.select({ count: count() }).from(faculties),
                db.select({ count: count() }).from(departments),
                db.select({ count: count() }).from(filieres),
                db.select({ count: count() }).from(studentEnrollments),
                db.select({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                    createdAt: user.createdAt,
                })
                    .from(user)
                    .orderBy(desc(user.createdAt))
                    .limit(5),
                db.select({
                    id: courses.id,
                    title: courses.title,
                    code: courses.code,
                    status: courses.status,
                    createdAt: courses.createdAt,
                })
                    .from(courses)
                    .orderBy(desc(courses.createdAt))
                    .limit(5),
            ]);

            // Map role counts
            let totalStudents = 0;
            let totalTeachers = 0;
            let totalAdmins = 0;
            roleCountsRes.forEach((r) => {
                if (r.role === "STUDENT") totalStudents = Number(r.count);
                else if (r.role === "TEACHER") totalTeachers = Number(r.count);
                else if (r.role === "ADMIN") totalAdmins = Number(r.count);
            });

            // Map course status counts
            let publishedCourses = 0;
            let draftCourses = 0;
            let pendingCourses = 0;
            courseStatusCountsRes.forEach((c) => {
                if (c.status === "PUBLISHED") publishedCourses = Number(c.count);
                else if (c.status === "DRAFT") draftCourses = Number(c.count);
                else if (c.status === "PENDING_REVIEW") pendingCourses = Number(c.count);
            });

            return {
                success: true,
                stats: {
                    totalUsers: Number(totalUsersRes[0]?.count ?? 0),
                    totalStudents,
                    totalTeachers,
                    totalAdmins,
                    totalCourses: Number(totalCoursesRes[0]?.count ?? 0),
                    publishedCourses,
                    draftCourses,
                    pendingCourses,
                    totalFaculties: Number(totalFacultiesRes[0]?.count ?? 0),
                    totalDepartments: Number(totalDepartmentsRes[0]?.count ?? 0),
                    totalFilieres: Number(totalFilieresRes[0]?.count ?? 0),
                    totalEnrollments: Number(totalEnrollmentsRes[0]?.count ?? 0),
                },
                recentUsers,
                recentCourses,
            };
        } catch (error) {
            console.error("Erreur getAdminDashboardOverview:", error);
            return { success: false, error: "Erreur de chargement du tableau de bord." };
        }
    },
    ["admin-dashboard-overview"],
    { tags: ["admin-dashboard", "users", "courses", "academic-structure"], revalidate: 300 }
);