"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentDashboardOverview } from "@/lib/action/student.actions";
import {
  BookOpen,
  CheckCircle2,
  FileCheckCorner,
  GraduationCap,
  Newspaper,
  ArrowRight,
  Clock,
  Award,
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getStudentDashboardOverview();
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <Skeleton className="h-[120px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[100px] rounded-xl" />)}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-48 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[180px] rounded-xl" />)}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[240px] rounded-xl" />
          <Skeleton className="h-[240px] rounded-xl" />
        </div>
      </div>
    );
  }


  const stats = data?.stats || {
    totalCourses: 0,
    completedAssessments: 0,
    pendingTps: 0,
    pendingQuizzes: 0,
    pendingExams: 0,
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 to-blue-600 p-8 text-primary-foreground shadow-lg">
        <div className="relative z-10 space-y-2">
          <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-md">
            Espace Étudiant
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Bienvenue sur votre plateforme d'apprentissage
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl text-sm">
            Consultez vos cours, suivez vos leçons, soumettez vos travaux pratiques et passez vos interrogations et examens en toute simplicité.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mes Cours</CardTitle>
            <BookOpen className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Inscriptions actives</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">TPs à rendre</CardTitle>
            <FileCheckCorner className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTps}</div>
            <p className="text-xs text-muted-foreground mt-1">En attente de soumission</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quizz & Interros</CardTitle>
            <Newspaper className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuizzes}</div>
            <p className="text-xs text-muted-foreground mt-1">À passer</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Évaluations terminées</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssessments}</div>
            <p className="text-xs text-muted-foreground mt-1">Soumises avec succès</p>
          </CardContent>
        </Card>
      </div>

      {/* Mes Cours Récents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Mes Cours Suivis</h2>
          <Link href="/student/courses">
            <Button variant="ghost" size="sm" className="text-xs">
              Voir tous les cours <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {data?.recentCourses?.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun cours trouvé dans votre promotion.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data?.recentCourses?.map((course: any) => (
              <Card key={course.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{course.code}</Badge>
                    <Badge variant="secondary">{course.credits} Crédits</Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {course.description || "Aucune description."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-muted-foreground space-y-1 mb-4">
                    <div>{course.totalModules} module(s) • {course.totalLessons} leçon(s)</div>
                    <div>{course.assessmentsCount} évaluation(s)</div>
                  </div>
                  <Link href={`/student/courses/${course.id}`}>
                    <Button size="sm" className="w-full">
                      Accéder au cours <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section Évaluations en attente (TPs & Quizzes) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TPs à soumettre */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileCheckCorner className="w-5 h-5 text-blue-600" /> TPs & Devoirs récents
              </CardTitle>
              <CardDescription className="text-xs">Travaux pratiques en attente de réponse</CardDescription>
            </div>
            <Link href="/student/assignement">
              <Button variant="outline" size="sm" className="text-xs">
                Tous les TPs
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 divide-y">
            {data?.pendingTpsList?.length === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground">Aucun TP en attente.</p>
            ) : (
              data?.pendingTpsList?.map((tp: any) => (
                <div key={tp.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{tp.title}</h4>
                    <p className="text-xs text-muted-foreground">{tp.courseTitle}</p>
                  </div>
                  <Link href={`/student/assessment/${tp.id}`}>
                    <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 text-xs">
                      Envoyer le TP
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quizzes & Interrogations */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-amber-500" /> Quizz & Interrogations
              </CardTitle>
              <CardDescription className="text-xs">Tests rapides et QCM disponibles</CardDescription>
            </div>
            <Link href="/student/quiz">
              <Button variant="outline" size="sm" className="text-xs">
                Tous les Quizz
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 divide-y">
            {data?.upcomingQuizzesList?.length === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground">Aucun quiz à passer pour l'instant.</p>
            ) : (
              data?.upcomingQuizzesList?.map((quiz: any) => (
                <div key={quiz.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">{quiz.title}</h4>
                    <p className="text-xs text-muted-foreground">{quiz.courseTitle}</p>
                  </div>
                  <Link href={`/student/assessment/${quiz.id}`}>
                    <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-700 text-xs">
                      Passer l'interro
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
