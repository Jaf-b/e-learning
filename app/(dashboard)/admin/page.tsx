"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminDashboardOverview } from "@/lib/action/user.actions";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Users,
    BookOpen,
    GraduationCap,
    Building,
    TrendingUp,
    UserCheck,
    Clock,
    CheckCircle2,
    ArrowRight,
    BarChart3,
    Layers,
    School,
} from "lucide-react";

interface Stats {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalAdmins: number;
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    pendingCourses: number;
    totalFaculties: number;
    totalDepartments: number;
    totalFilieres: number;
    totalEnrollments: number;
}

const roleColorMap: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    TEACHER: "bg-blue-100 text-blue-700",
    STUDENT: "bg-green-100 text-green-700",
};

function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
            <Skeleton className="h-[90px] w-full rounded-2xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-[110px] rounded-xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-[320px] rounded-xl" />
                <Skeleton className="h-[320px] rounded-xl" />
                <Skeleton className="h-[320px] rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[280px] rounded-xl" />
                <Skeleton className="h-[280px] rounded-xl" />
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);
    const [recentCourses, setRecentCourses] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const res = await getAdminDashboardOverview();
            if (res.success) {
                setStats((res as any).stats ?? null);
                setRecentUsers((res as any).recentUsers ?? []);
                setRecentCourses((res as any).recentCourses ?? []);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <DashboardSkeleton />;

    const s = stats ?? {
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
        totalCourses: 0,
        publishedCourses: 0,
        draftCourses: 0,
        pendingCourses: 0,
        totalFaculties: 0,
        totalDepartments: 0,
        totalFilieres: 0,
        totalEnrollments: 0,
    };

    const publishedPct = s.totalCourses ? Math.round((s.publishedCourses / s.totalCourses) * 100) : 0;

    return (
        <div className="flex flex-col gap-6 p-6 lg:p-8 max-w-[1400px] mx-auto w-full">

            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl">
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvc3ZnPg==')]" />
                <div className="relative z-10">
                    <Badge className="bg-white/20 text-white mb-3 backdrop-blur-sm">Administration</Badge>
                    <h1 className="text-3xl font-extrabold tracking-tight">Tableau de Bord Administrateur</h1>
                    <p className="text-white/70 mt-1 text-sm max-w-xl">
                        Vue d'ensemble complète de la plateforme — utilisateurs, cours, structure académique et activité récente.
                    </p>
                </div>
            </div>

            {/* KPI Cards Row 1 — Users */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Utilisateurs</CardTitle>
                        <span className="bg-slate-100 text-slate-600 p-2 rounded-lg"><Users className="w-4 h-4" /></span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{s.totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">{s.totalEnrollments} inscriptions</p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Étudiants</CardTitle>
                        <span className="bg-green-50 text-green-600 p-2 rounded-lg"><GraduationCap className="w-4 h-4" /></span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{s.totalStudents}</div>
                        <p className="text-xs text-muted-foreground mt-1">{s.totalTeachers} enseignants</p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cours</CardTitle>
                        <span className="bg-blue-50 text-blue-600 p-2 rounded-lg"><BookOpen className="w-4 h-4" /></span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{s.totalCourses}</div>
                        <p className="text-xs text-muted-foreground mt-1">{s.publishedCourses} publiés</p>
                    </CardContent>
                </Card>
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">En attente</CardTitle>
                        <span className="bg-amber-50 text-amber-600 p-2 rounded-lg"><Clock className="w-4 h-4" /></span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{s.pendingCourses}</div>
                        <p className="text-xs text-muted-foreground mt-1">Cours à valider</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Users */}
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <div>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-primary" />
                                Derniers inscrits
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">Utilisateurs récemment enregistrés</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/user-management">
                                Voir tout <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4 divide-y">
                        {recentUsers.length === 0 ? (
                            <p className="py-6 text-center text-xs text-muted-foreground">Aucun utilisateur enregistré.</p>
                        ) : (
                            recentUsers.map((u: any) => (
                                <div key={u.id} className="py-3 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{u.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                    </div>
                                    <Badge className={`text-[10px] shrink-0 ${roleColorMap[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                                        {u.role}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Recent Courses */}
                <Card className="border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <div>
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                Cours récents
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">Derniers cours créés sur la plateforme</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/courses">
                                Voir tout <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4 divide-y">
                        {recentCourses.length === 0 ? (
                            <p className="py-6 text-center text-xs text-muted-foreground">Aucun cours disponible.</p>
                        ) : (
                            recentCourses.map((c: any) => (
                                <div key={c.id} className="py-3 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{c.title}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{c.code}</p>
                                    </div>
                                    <Badge
                                        className={`text-[10px] shrink-0 ${
                                            c.status === "PUBLISHED"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : c.status === "PENDING_REVIEW"
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {c.status === "PUBLISHED" ? "Publié" : c.status === "PENDING_REVIEW" ? "En révision" : "Brouillon"}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Academic Structure & Course Health */}
                <div className="flex flex-col gap-4">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <School className="w-4 h-4 text-primary" />
                                Structure Académique
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            {[
                                { label: "Facultés", value: s.totalFaculties, icon: <Building className="w-3.5 h-3.5" /> },
                                { label: "Départements", value: s.totalDepartments, icon: <Layers className="w-3.5 h-3.5" /> },
                                { label: "Filières", value: s.totalFilieres, icon: <GraduationCap className="w-3.5 h-3.5" /> },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-dashed last:border-0">
                                    <span className="flex items-center gap-2 text-muted-foreground">{item.icon}{item.label}</span>
                                    <span className="font-bold">{item.value}</span>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full mt-2 text-xs" asChild>
                                <Link href="/admin/academic-structure">Gérer <ArrowRight className="w-3 h-3 ml-1" /></Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Santé des cours
                            </CardTitle>
                            <CardDescription className="text-xs">Taux de publication global</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span>Publiés</span>
                                    <span className="text-emerald-600">{s.publishedCourses} / {s.totalCourses}</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${publishedPct}%` }} />
                                </div>
                                <p className="text-[11px] text-right text-muted-foreground">{publishedPct}%</p>
                            </div>
                            <Separator />
                            <div className="space-y-1.5 text-xs">
                                {[
                                    { label: "Publiés", value: s.publishedCourses, color: "text-emerald-600" },
                                    { label: "Brouillons", value: s.draftCourses, color: "text-slate-500" },
                                    { label: "En attente", value: s.pendingCourses, color: "text-amber-600" },
                                ].map((row) => (
                                    <div key={row.label} className="flex justify-between py-1">
                                        <span className="text-muted-foreground">{row.label}</span>
                                        <span className={`font-bold ${row.color}`}>{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Action Links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Gérer les utilisateurs", href: "/admin/user-management", icon: <Users className="w-5 h-5" />, color: "from-slate-700 to-slate-600" },
                    { label: "Gérer les cours", href: "/admin/courses", icon: <BookOpen className="w-5 h-5" />, color: "from-blue-600 to-blue-500" },
                    { label: "Structure académique", href: "/admin/academic-structure", icon: <GraduationCap className="w-5 h-5" />, color: "from-purple-600 to-purple-500" },
                    { label: "Feedback & Support", href: "/admin/feedback", icon: <BarChart3 className="w-5 h-5" />, color: "from-emerald-600 to-emerald-500" },
                ].map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className={`flex flex-col items-center gap-3 bg-gradient-to-br ${action.color} text-white p-5 rounded-xl shadow hover:opacity-90 hover:shadow-md transition-all duration-200 text-center group`}
                    >
                        <span className="bg-white/20 p-2.5 rounded-lg group-hover:scale-110 transition-transform">
                            {action.icon}
                        </span>
                        <span className="text-xs font-semibold leading-tight">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
