"use client";

import React, { useEffect, useState } from 'react';
import { getCoursesByuserID } from "@/lib/action/courses.actions";
import CourseList from "@/components/shared/course-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Course } from "@/types";
import { authClient } from "@/lib/auth-client";

// Type réutilisable compatible avec le retour de l'action serveur
type CourseItem = Omit<Course, 'authorId'> & { authorId?: Course['authorId'] };

const Page = () => {
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUserCourses = async () => {
            try {
                const res = await authClient.getSession();
                if (!res?.data?.user?.id) throw new Error("Aucun utilisateur connecté");

                const resCourse = await getCoursesByuserID(res.data.user.id);

                if (resCourse?.data) {
                    setCourses(resCourse.data.map( e => e.courses));
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des cours:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserCourses();
    }, []);

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Mes Cours</h1>
                <Button >
                    <Link href="/teacher/courses/create">Créer un cours</Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                </div>
            ) : (
                <CourseList courses={courses} />
            )}
        </div>
    );
};

export default Page;