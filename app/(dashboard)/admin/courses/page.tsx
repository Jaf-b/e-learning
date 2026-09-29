"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/shared/header";
import CourseTable from "@/components/shared/course-table";
import CourseList from "@/components/shared/course-list";
import CourseDialog from "@/components/shared/course-dialog";
import StatisticCard from "@/components/shared/statistic-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
} from "@/lib/action/courses.actions";
import { getAllFilieres } from "@/lib/action/filieres.actions";
import { getAllDegreeLevels } from "@/lib/action/degree.actions";
import { getAllUsers } from "@/lib/action/user.actions";
import { Filiere, DegreeLevel, User } from "@/types";
import { toast } from "@/components/ui/toast";
import CourseDetailsDialog from "@/components/shared/course-details-dialog";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Layers,
  Search,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [degreeLevels, setDegreeLevels] = useState<DegreeLevel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<any | null>(null);

  const loadData = async () => {
    try {
      const [coursesRes, filieresRes, degreeLevelsRes, usersRes] = await Promise.all([
        getAllCourses(),
        getAllFilieres(),
        getAllDegreeLevels(),
        getAllUsers(),
      ]);

      if (coursesRes.success) setCourses(coursesRes.data || []);
      if (filieresRes.success) setFilieres(filieresRes.data || []);
      if (degreeLevelsRes.success) setDegreeLevels(degreeLevelsRes.data || []);
      if (usersRes.success) setUsers(usersRes.data || []);
    } catch (error) {
      console.error("Erreur chargement données cours:", error);
      toast.add({
        type: "error",
        description: "Impossible de charger les données.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCourse = async (courseData: any) => {
    try {
      if (courseData.id) {
        const res = await updateCourse(courseData.id, courseData);
        if (res.success) {
          toast.add({
            type: "success",
            description: `Le cours "${courseData.title}" a été modifié avec succès.`,
          });
        } else {
          toast.add({
            type: "error",
            description: res.error || "Échec de la modification du cours.",
          });
        }
      } else {
        const res = await createCourse(courseData);
        if (res.success) {
          toast.add({
            type: "success",
            description: `Le cours "${courseData.title}" a été créé avec succès.`,
          });
        } else {
          toast.add({
            type: "error",
            description: res.error || "Échec de la création du cours.",
          });
        }
      }

      // Refresh list
      const updated = await getAllCourses();
      if (updated.success) setCourses(updated.data || []);
    } catch (error) {
      console.error("Erreur sauvegarde cours:", error);
      toast.add({
        type: "error",
        description: "Une erreur est survenue lors de l'enregistrement.",
      });
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le cours "${title}" ?`)) return;

    try {
      const res = await deleteCourse(id);
      if (res.success) {
        toast.add({
          type: "success",
          description: `Le cours "${title}" a été supprimé.`,
        });
        const updated = await getAllCourses();
        if (updated.success) setCourses(updated.data || []);
      } else {
        toast.add({
          type: "error",
          description: res.error || "Impossible de supprimer ce cours.",
        });
      }
    } catch (error) {
      console.error("Erreur suppression cours:", error);
      toast.add({
        type: "error",
        description: "Erreur lors de la suppression.",
      });
    }
  };

  // Map courses with their relational names
  const mappedCourses = courses.map((course: any) => ({
    ...course,
    filiereName: course.filiere?.name ?? null,
    degreeLevelName: course.degreeLevel?.name ?? null,
    authorName: course.author?.name ?? null,
    moduleCount: course.modules?.length ?? 0,
  }));

  // Filter by search + status
  const filteredCourses = mappedCourses.filter((course) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      course.title.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query) ||
      (course.authorName && course.authorName.toLowerCase().includes(query)) ||
      (course.filiereName && course.filiereName.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "ALL" ? true : course.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCourses = mappedCourses.length;
  const publishedCourses = mappedCourses.filter((c) => c.status === "PUBLISHED").length;
  const draftCourses = mappedCourses.filter((c) => c.status === "DRAFT").length;
  const totalModules = mappedCourses.reduce(
    (sum: number, c: any) => sum + (c.moduleCount || 0),
    0
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Top Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Gestion des Cours"
          description="Consultez, modifiez et gérez l'ensemble des cours de l'établissement."
        />
        <CourseDialog
          onSave={handleSaveCourse}
          filieres={filieres}
          degreeLevels={degreeLevels}
          authors={users}
        />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticCard
          title="Total Cours"
          value={totalCourses}
          subtitle="Cours enregistrés"
          icon={<BookOpen className="w-5 h-5" />}
          iconClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
        />
        <StatisticCard
          title="Publiés"
          value={publishedCourses}
          subtitle="Visibles aux étudiants"
          icon={<CheckCircle className="w-5 h-5" />}
          iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <StatisticCard
          title="Brouillons"
          value={draftCourses}
          subtitle="En cours de rédaction"
          icon={<Clock className="w-5 h-5" />}
          iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
        />
        <StatisticCard
          title="Total Modules"
          value={totalModules}
          subtitle="Répartis dans les cours"
          icon={<Layers className="w-5 h-5" />}
          iconClassName="bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
        />
      </div>

      {/* Filters & View Switcher Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/50 border border-border/60 rounded-xl overflow-x-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === "ALL"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tous ({totalCourses})
          </button>
          <button
            onClick={() => setStatusFilter("PUBLISHED")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === "PUBLISHED"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Publiés ({publishedCourses})
          </button>
          <button
            onClick={() => setStatusFilter("DRAFT")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === "DRAFT"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Brouillons ({draftCourses})
          </button>
        </div>

        {/* Right side: Search + View Mode buttons */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, code, enseignant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card text-xs rounded-xl"
            />
          </div>

          {/* Table / Grid Mode Toggle */}
          <div className="flex items-center p-1 bg-muted/50 border border-border/60 rounded-xl shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-lg ${
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("table")}
              title="Vue en tableau"
            >
              <TableIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-lg ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setViewMode("grid")}
              title="Vue en cartes"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loading ? (
        <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-4">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted/60 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ) : viewMode === "table" ? (
        <CourseTable
          courses={filteredCourses}
          filieres={filieres}
          degreeLevels={degreeLevels}
          authors={users}
          onSaveCourse={handleSaveCourse}
          onDeleteCourse={handleDeleteCourse}
        />
      ) : (
        <CourseList
          courses={filteredCourses}
          baseUrl="/admin/courses"
          actionLabel="Voir les détails"
          onCourseClick={(c) => setSelectedCourseForDetails(c)}
          emptyMessage="Aucun cours ne correspond à vos critères de recherche."
        />
      )}

      {/* Course Details Dialog when triggered from Grid card view */}
      {selectedCourseForDetails && (
        <CourseDetailsDialog
          course={selectedCourseForDetails}
          filieres={filieres}
          degreeLevels={degreeLevels}
          authors={users}
          onSaveCourse={handleSaveCourse}
          open={!!selectedCourseForDetails}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedCourseForDetails(null);
          }}
        />
      )}
    </div>
  );
}