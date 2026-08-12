"use server"

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { enrollStudent } from "@/lib/action/student-enrollement.actions";
import { user, courses, faculties, departments, filieres, studentEnrollments } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";

export async function getAllUsers() {
    try {
        const result = await db.query.user.findMany();
        return { success: true, data: result ?? [] };
    } catch (error) {
        console.error("Erreur getAllUsers:", error);
        return { success: false, data: [], error: "Erreur de chargement." };
    }
}

export async function createUser(data: string) {
    try {
        const parsedData = JSON.parse(data);
        const { enrollment, ...userData } = parsedData;
        const newUser = await auth.api.signUpEmail
        ({
            body: userData
        });

        if (newUser && enrollment) {
            await enrollStudent({
                studentId: newUser.user.id,
                promotionId: enrollment.promotionId,
            });
        }

        return { success: true, data: newUser };
    } catch (error) {
        console.error("Erreur createUser:", error);
        return { success: false, error: "Impossible de créer l'utilisateur." };
    }
}

export async function updateUser(id: string, data: any) {
    try {
        const [updatedUser] = await db.update(user).set(data).where(eq(user.id, id)).returning();
        return { success: true, data: updatedUser };
    } catch (error) {
        console.error("Erreur updateUser:", error);
        return { success: false, error: "Impossible de mettre à jour l'utilisateur." };
    }
}

export async function deleteUser(id: string) {
    try {
        const [deletedUser] = await db.delete(user).where(eq(user.id, id)).returning();
        return { success: true, data: deletedUser };
    } catch (error) {
        console.error("Erreur deleteUser:", error);
        return { success: false, error: "Impossible de supprimer l'utilisateur." };
    }
}

export async function getAdminDashboardOverview() {
    try {
        // User counts by role
        const allUsers = await db.select().from(user);
        const totalUsers = allUsers.length;
        const totalStudents = allUsers.filter((u) => u.role === "STUDENT").length;
        const totalTeachers = allUsers.filter((u) => u.role === "TEACHER").length;
        const totalAdmins = allUsers.filter((u) => u.role === "ADMIN").length;

        // Courses
        const allCourses = await db.select().from(courses);
        const totalCourses = allCourses.length;
        const publishedCourses = allCourses.filter((c) => c.status === "PUBLISHED").length;
        const draftCourses = allCourses.filter((c) => c.status === "DRAFT").length;
        const pendingCourses = allCourses.filter((c) => c.status === "PENDING_REVIEW").length;

        // Academic structure
        const allFaculties = await db.select().from(faculties);
        const allDepartments = await db.select().from(departments);
        const allFilieres = await db.select().from(filieres);

        // Enrollments
        const allEnrollments = await db.select().from(studentEnrollments);

        // Recent users (last 5)
        const recentUsers = allUsers
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

        // Recent courses (last 5)
        const recentCourses = allCourses
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

        return {
            success: true,
            stats: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalAdmins,
                totalCourses,
                publishedCourses,
                draftCourses,
                pendingCourses,
                totalFaculties: allFaculties.length,
                totalDepartments: allDepartments.length,
                totalFilieres: allFilieres.length,
                totalEnrollments: allEnrollments.length,
            },
            recentUsers,
            recentCourses,
        };
    } catch (error) {
        console.error("Erreur getAdminDashboardOverview:", error);
        return { success: false, error: "Erreur de chargement du tableau de bord." };
    }
}