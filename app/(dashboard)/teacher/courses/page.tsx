"use client";

import React, { useEffect, useState } from "react";
import { getCoursesByuserID } from "@/lib/action/courses.actions";
import CourseList from "@/components/shared/course-list";
import Header from "@/components/shared/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Course } from "@/types";
import { authClient } from "@/lib/auth-client";
import { Search, BookOpen, CheckCircle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type CourseItem = Omit<Course, "authorId"> & { authorId?: Course["authorId"] };

const TeacherCoursesPage = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        const res = await authClient.getSession();
        if (!res?.data?.user?.id) throw new Error("Aucun utilisateur connecté");

        const resCourse = await getCoursesByuserID(res.data.user.id);

        if (resCourse?.data) {
          setCourses(resCourse.data.map((e) => e.courses));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des cours:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = courses.filter((c) => c.status === "DRAFT").length;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header avec action */}
      <Header
        title="Mes Cours"
        description="Gérez vos enseignements, concevez de nouveaux modules et suivez l'avancement pédagogique."
      />

      {/* Barre de Filtres et Statistiques */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card border border-border/70 p-4 rounded-2xl shadow-xs">
        {/* Recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par titre ou code (ex: GL-301)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Filtres par Statut */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: `Tous (${courses.length})` },
            { id: "PUBLISHED", label: `Publiés (${publishedCount})` },
            { id: "DRAFT", label: `Brouillons (${draftCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de cours ou Squelette de chargement */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col justify-between h-64 p-5 rounded-2xl border border-border/60 bg-card animate-pulse space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-1/3 rounded-lg" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <CourseList
          courses={filteredCourses}
          emptyMessage={
            searchQuery || statusFilter !== "ALL"
              ? "Aucun cours ne correspond à vos critères de recherche."
              : "Vous n'avez pas encore créé de cours. Cliquez sur 'Créer un cours' pour commencer."
          }
        />
      )}
    </div>
  );
};

export default TeacherCoursesPage;