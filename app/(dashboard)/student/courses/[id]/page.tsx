"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStudentCourseDetails } from "@/lib/action/student.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseLessonViewer } from "@/components/student/course-lesson-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  FileCheck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  GraduationCap,
  Layers,
  BookMarked,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function StudentCourseDetailsPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      if (!courseId) return;
      const res = await getStudentCourseDetails(courseId);
      if (res.success) setData(res);
      setLoading(false);
    }
    loadCourse();
  }, [courseId]);

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <Skeleton className="h-4 w-32 rounded mb-3" />
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-6 w-20 rounded" />
          <Skeleton className="h-6 w-24 rounded" />
        </div>
        <Skeleton className="h-9 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-3xl rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
          <Skeleton className="lg:col-span-8 h-[500px] rounded-xl" />
          <Skeleton className="lg:col-span-4 h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  /* ── NOT FOUND ── */
  if (!data || !data.course) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-rose-500 mb-2">Cours introuvable</h2>
        <p className="text-muted-foreground mb-4">Le cours demandé n&apos;existe pas ou n&apos;est plus disponible.</p>
        <Link href="/student/courses">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à mes cours
          </Button>
        </Link>
      </div>
    );
  }

  const { course, assessments = [] } = data;

  const totalLessons = (course.modules || []).reduce(
    (acc: number, m: any) => acc + (m.lessons?.length ?? 0),
    0
  );
  const moduleCount = course.modules?.length ?? 0;

  /* ── PAGE ── */
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Back link */}
      <Link
        href="/student/courses"
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Retour à mes cours
      </Link>

      {/* Course header */}
      <div className="border-b pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="outline" className="font-semibold">{course.code}</Badge>
          <Badge>{course.credits} Crédits</Badge>
          {course.filiere && <Badge variant="secondary">{course.filiere.name}</Badge>}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        {course.description && (
          <p className="text-muted-foreground text-sm mt-1 max-w-3xl">{course.description}</p>
        )}
      </div>

      {/* ── MAIN GRID: Tabs (left) | Course Info Card (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT: Tabs — Modules & Évaluations */}
        <div className="lg:col-span-8 space-y-0">
          <Tabs defaultValue="lessons" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6">
              <TabsTrigger value="lessons" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Modules & Leçons</span>
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                <span>Évaluations ({assessments.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Modules & Lessons */}
            <TabsContent value="lessons">
              <CourseLessonViewer courseTitle={course.title} modules={course.modules || []} />
            </TabsContent>

            {/* TAB 2: Assessments */}
            <TabsContent value="evaluations">
              <Card>
                <CardHeader>
                  <CardTitle>Évaluations du cours</CardTitle>
                  <CardDescription>
                    Consultez vos TP, devoirs, interrogations et examens rattachés à ce cours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {assessments.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground text-sm">
                      Aucune évaluation programmée pour ce cours.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {assessments.map((ass: any) => {
                        const isTp = ass.type === "TP" || ass.type === "ASSIGNMENT";
                        const isSubmitted = ass.isSubmitted;
                        return (
                          <div
                            key={ass.id}
                            className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card hover:shadow-sm transition-shadow"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant={isTp ? "secondary" : "default"}>{ass.type}</Badge>
                                <span className="text-xs text-muted-foreground font-semibold">
                                  Barème : {ass.maxScore} pts
                                </span>
                              </div>
                              <h4 className="font-bold text-base">{ass.title}</h4>
                              {ass.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{ass.description}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {isSubmitted ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  {ass.gradeScore !== null
                                    ? `${ass.gradeScore} / ${ass.maxScore}`
                                    : "Soumis (En attente)"}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-300">
                                  <Clock className="w-3.5 h-3.5 mr-1" /> Non soumis
                                </Badge>
                              )}
                              <Link href={`/student/assessment/${ass.id}`}>
                                <Button size="sm" variant={isSubmitted ? "outline" : "default"}>
                                  {isSubmitted ? "Voir le résultat" : isTp ? "Rendre le TP" : "Passer l'épreuve"}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
