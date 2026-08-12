import React from 'react';
import { Course } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// On permet à 'author' d'être optionnel au niveau du composant d'affichage
type CourseItem = Omit<Course, 'authorId'> & { authorId?: Course['authorId'] };

interface CourseListProps {
    courses: CourseItem[];
}

const CourseList = ({ courses }: CourseListProps) => {
    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground">
                Aucun cours disponible pour le moment.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {courses.map((course) => (
                <Card key={course.id} className="flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {course.description ?? "Aucune description fournie."}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-1">
                        <p className="text-sm">
                            <span className="font-medium">Code :</span> {course.code}
                        </p>
                        <p className="text-sm">
                            <span className="font-medium">Crédits :</span> {course.credits}
                        </p>
                        <p className="text-sm">
                            <span className="font-medium">Statut :</span> {course.status}
                        </p>
                    </CardContent>

                    <CardFooter>
                        <Button className="w-full">
                            <Link href={`/teacher/courses/${course.id}`}>
                                Voir le cours
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default CourseList;