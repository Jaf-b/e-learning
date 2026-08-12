"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Actions
import { getTeacherDashboardOverview } from "@/lib/action/courses.actions";
import { deleteAssessment } from "@/lib/action/question.actions";

// Composants partagés existants
import Header from "@/components/shared/header";
import StatisticCard from "@/components/shared/statistic-card";
import { EvaluationList } from "@/components/teacher/evaluation-list";
import DashboardCourseCard from "@/components/teacher/dashboard-course-card";
import EmptyMessage from "@/components/shared/empty-message";

// UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Separator } from "@/components/ui/separator";

// Icônes
import {
    BookOpen,
    Users,
    FileCheck,
    Clock,
    Plus,
    ArrowRight,
    GraduationCap,
    TrendingUp,
    Zap,
} from "lucide-react";

import { AssessmentRecord } from "@/types/academic";

export default function TeacherDashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        totalAssessments: 0,
        publishedCourses: 0,
        draftCourses: 0,
    });

    const loadData = async () => {
        setIsLoading(true);
        const res = await getTeacherDashboardOverview();
        if (res.success) {
            setCourses(res.courses || []);
            setAssessments((res.assessments || []) as AssessmentRecord[]);
            setStats(
                res.stats || {
                    totalCourses: 0,
                    totalStudents: 0,
                    totalAssessments: 0,
                    publishedCourses: 0,
                    draftCourses: 0,
                }
            );
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- Handlers ---
    const handleEditAssessment = (assessment: AssessmentRecord) => {
        router.push(`/teacher/create-quiz/${assessment.id}`);
    };

    const handleDeleteAssessment = async (assessmentId: string) => {
        const confirmed = window.confirm("Voulez-vous vraiment supprimer cette évaluation ? Toutes les questions associées seront supprimées.");
        if (!confirmed) return;
        const res = await deleteAssessment(assessmentId);
        if (res.success) {
            toast.add({ title: "Évaluation supprimée", description: "L'évaluation a été supprimée avec succès.", type: "success" });
            loadData();
        } else {
            toast.add({ title: "Erreur de suppression", description: res.error || "Impossible de supprimer l'évaluation.", type: "error" });
        }
    };

    const firstCourseId = courses.length > 0 ? courses[0].id : null;
    const progressPercent = stats.totalCourses
        ? Math.round((stats.publishedCourses / stats.totalCourses) * 100)
        : 0;

    // --- Skeleton de chargement ---
    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
                <Skeleton className="h-[80px] w-full rounded-xl" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[110px] rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-[380px] rounded-xl" />
                    <Skeleton className="h-[380px] rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1400px] mx-auto w-full">

            {/* ── En-tête avec composant Header existant ── */}
            <Header
                title="Tableau de Bord Enseignant"
                description="Gérez vos cours, concevez des évaluations et suivez vos étudiants."
                buttonText={firstCourseId ? "Créer un Quiz" : undefined}
                buttonLink={firstCourseId ? `/teacher/create-quiz/${firstCourseId}` : undefined}
            />

            {/* ── Cartes KPI avec composant StatisticCard existant (amélioré) ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatisticCard
                    title="Cours gérés"
                    value={stats.totalCourses}
                    trend={{ label: `${stats.publishedCourses} publiés`, positive: stats.publishedCourses > 0 }}
                    icon={<BookOpen className="w-5 h-5" />}
                    iconClassName="bg-blue-50 text-blue-600"
                />
                <StatisticCard
                    title="Étudiants inscrits"
                    value={stats.totalStudents}
                    subtitle="Répartis en promotions"
                    icon={<GraduationCap className="w-5 h-5" />}
                    iconClassName="bg-purple-50 text-purple-600"
                />
                <StatisticCard
                    title="Évaluations & Quiz"
                    value={stats.totalAssessments}
                    trend={{ label: "Quiz, TP & Examens", positive: stats.totalAssessments > 0 }}
                    icon={<FileCheck className="w-5 h-5" />}
                    iconClassName="bg-amber-50 text-amber-600"
                />
                <StatisticCard
                    title="Cours en brouillon"
                    value={stats.draftCourses}
                    subtitle="En cours de rédaction"
                    icon={<Clock className="w-5 h-5" />}
                    iconClassName="bg-slate-100 text-slate-600"
                />
            </div>

            {/* ── Contenu principal ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Colonne gauche : Cours + Évaluations */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Section Cours récents */}
                    <Card className="border shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    Vos Cours Récents
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Accédez rapidement au contenu de vos cours.
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/teacher/courses">
                                    Voir tout <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                </Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="p-4">
                            {courses.length === 0 ? (
                                /* Composant EmptyMessage existant */
                                <EmptyMessage />
                            ) : (
                                /* Composant DashboardCourseCard créé */
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {courses.slice(0, 4).map((course) => (
                                        <DashboardCourseCard
                                            key={course.id}
                                            id={course.id}
                                            code={course.code}
                                            title={course.title}
                                            description={course.description}
                                            status={course.status}
                                            moduleCount={course.modules?.length ?? 0}
                                            credits={course.credits}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Section Évaluations récentes — composant EvaluationList existant */}
                    <Card className="border shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <FileCheck className="w-4 h-4 text-primary" />
                                    Évaluations & Quiz Récents
                                </CardTitle>
                                <CardDescription className="text-xs mt-0.5">
                                    Gérez la configuration et les questions de vos quiz.
                                </CardDescription>
                            </div>
                            {firstCourseId && (
                                <Button size="sm" asChild>
                                    <Link href={`/teacher/create-quiz/${firstCourseId}`}>
                                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Nouveau Quiz
                                    </Link>
                                </Button>
                            )}
                        </CardHeader>

                        <CardContent className="p-0">
                            {assessments.length === 0 ? (
                                <div className="p-4">
                                    <EmptyMessage />
                                </div>
                            ) : (
                                /* EvaluationList existant — limitée aux 5 premiers */
                                <EvaluationList
                                    assessments={assessments.slice(0, 5)}
                                    onEdit={handleEditAssessment}
                                    onDelete={handleDeleteAssessment}
                                    onSelect={handleEditAssessment}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne droite : Sidebar d'actions & progression */}
                <div className="flex flex-col gap-5">

                    {/* Carte Actions Rapides */}
                    <Card className="border shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                Actions Rapides
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <Button asChild variant="outline" className="justify-start h-10 text-xs font-semibold">
                                <Link href="/teacher/courses">
                                    <BookOpen className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
                                    Consulter mes cours
                                </Link>
                            </Button>
                            {firstCourseId && (
                                <Button asChild variant="outline" className="justify-start h-10 text-xs font-semibold">
                                    <Link href={`/teacher/create-quiz/${firstCourseId}`}>
                                        <FileCheck className="w-4 h-4 mr-2 text-amber-500 shrink-0" />
                                        Concevoir un quiz
                                    </Link>
                                </Button>
                            )}
                            <Button asChild variant="outline" className="justify-start h-10 text-xs font-semibold">
                                <Link href="/teacher/submitted">
                                    <TrendingUp className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                                    Devoirs & TP soumis
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Carte Progression des cours */}
                    <Card className="border shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                Avancement
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Taux de publication de vos cours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Progression publiés */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span>Cours publiés</span>
                                    <span className="text-emerald-600">{stats.publishedCourses} / {stats.totalCourses}</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-right">{progressPercent}%</p>
                            </div>

                            <Separator />

                            {/* Résumé global */}
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span className="text-muted-foreground">Total cours</span>
                                    <span className="font-bold">{stats.totalCourses}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span className="text-muted-foreground">Étudiants</span>
                                    <span className="font-bold">{stats.totalStudents}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-muted-foreground">Évaluations</span>
                                    <span className="font-bold">{stats.totalAssessments}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
