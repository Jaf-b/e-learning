"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentCourses } from "@/lib/action/student.actions";
import { BookOpen, Search, ArrowRight, Layers, FileCheck } from "lucide-react";
import Link from "next/link";

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadCourses() {
      const res = await getStudentCourses();
      if (res.success && res.courses) {
        setCourses(res.courses);
      }
      setLoading(false);
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
          <Skeleton className="h-10 w-72 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Cours</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Accédez à la liste complète de vos modules de cours, leçons et évaluations rattachées.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg">Aucun cours trouvé</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Aucun cours ne correspond à votre recherche ou vous n'avez pas de cours attribué dans cette promotion.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="flex flex-col justify-between hover:shadow-lg transition-all border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="font-semibold">
                    {course.code}
                  </Badge>
                  <Badge variant="secondary">{course.credits} Crédits</Badge>
                </div>
                <CardTitle className="text-xl font-bold line-clamp-1">{course.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {course.description || "Aucune description fournie pour ce cours."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-primary" />
                    <span>{course.totalModules} modules</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{course.totalLessons} leçons</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <FileCheck className="w-4 h-4 text-primary" />
                    <span>{course.assessmentsCount} évaluations (TPs/Quizz/Examens)</span>
                  </div>
                </div>

                <Link href={`/student/courses/${course.id}`} className="block">
                  <Button className="w-full">
                    Consulter le cours <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
