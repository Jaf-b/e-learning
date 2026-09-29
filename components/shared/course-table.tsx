"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import CourseDialog from "@/components/shared/course-dialog";
import CourseDetailsDialog, { CourseDetailItem } from "@/components/shared/course-details-dialog";
import {
  BookOpen,
  Pencil,
  Trash2,
  Eye,
  Layers,
  Award,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Filiere, DegreeLevel, User } from "@/types";

interface CourseTableProps {
  courses: CourseDetailItem[];
  filieres: Filiere[];
  degreeLevels: DegreeLevel[];
  authors: User[];
  onSaveCourse: (course: any) => Promise<void> | void;
  onDeleteCourse?: (id: string, title: string) => Promise<void> | void;
}

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  PUBLISHED: {
    label: "Publié",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    icon: <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
  },
  DRAFT: {
    label: "Brouillon",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: <Clock className="w-3 h-3 text-slate-500" />,
  },
  PENDING_REVIEW: {
    label: "En révision",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    icon: <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
  },
  REJECTED: {
    label: "Rejeté",
    className:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    icon: <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />,
  },
  ARCHIVED: {
    label: "Archivé",
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    icon: <Archive className="w-3 h-3 text-gray-500" />,
  },
};

export default function CourseTable({
  courses,
  filieres,
  degreeLevels,
  authors,
  onSaveCourse,
  onDeleteCourse,
}: CourseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(courses.length / coursesPerPage));
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "E";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-border/80 rounded-2xl bg-card">
        <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-base font-bold text-foreground">Aucun cours trouvé</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Aucun cours ne correspond à vos critères de recherche ou aucun cours n'a été créé.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs py-3.5">Cours</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Filière & Niveau</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Enseignant</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Volume</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Statut</TableHead>
              <TableHead className="font-semibold text-xs py-3.5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCourses.map((course) => {
              const statusInfo =
                statusConfig[course.status] || statusConfig["DRAFT"];
              const filiereName =
                course.filiereName || course.filiere?.name || "Général";
              const degreeLevelName =
                course.degreeLevelName || course.degreeLevel?.name || "N/A";
              const authorName =
                course.authorName || course.author?.name || "Non assigné";
              const authorEmail = course.author?.email;

              return (
                <TableRow key={course.id} className="hover:bg-muted/30 transition-colors">
                  {/* Code + Titre + Description */}
                  <TableCell className="py-3 max-w-[280px]">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
                          <BookOpen className="w-3 h-3" />
                          {course.code}
                        </span>
                        <CourseDetailsDialog
                          course={course}
                          filieres={filieres}
                          degreeLevels={degreeLevels}
                          authors={authors}
                          onSaveCourse={onSaveCourse}
                          trigger={
                            <button
                              type="button"
                              className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors text-left"
                              title="Voir les détails"
                            >
                              {course.title}
                            </button>
                          }
                        />
                      </div>
                      {course.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Filière & Niveau */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{filiereName}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="w-fit text-[10px] font-medium py-0 px-1.5 bg-muted text-muted-foreground"
                      >
                        {degreeLevelName}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Enseignant / Auteur */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 border border-border shrink-0">
                        <AvatarImage
                          src={course.author?.image || undefined}
                          alt={authorName}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                          {getInitials(authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-xs text-foreground truncate">
                          {authorName}
                        </span>
                        {authorEmail && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {authorEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Volume (Crédits + Modules) */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        {course.credits} cr.
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Layers className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                        {course.moduleCount ?? 0} mod.
                      </span>
                    </div>
                  </TableCell>

                  {/* Statut */}
                  <TableCell className="py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs",
                        statusInfo.className
                      )}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </TableCell>

                  {/* Actions: Voir Détails, Modifier, Supprimer */}
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Voir les détails du cours modal */}
                      <CourseDetailsDialog
                        course={course}
                        filieres={filieres}
                        degreeLevels={degreeLevels}
                        authors={authors}
                        onSaveCourse={onSaveCourse}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Voir la fiche détaillée"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        }
                      />

                      {/* Modifier Course via CourseDialog */}
                      <CourseDialog
                        course={course as any}
                        filieres={filieres}
                        degreeLevels={degreeLevels}
                        authors={authors}
                        onSave={onSaveCourse}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            title="Modifier ce cours"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        }
                      />

                      {/* Supprimer le cours */}
                      {onDeleteCourse && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          onClick={() => onDeleteCourse(course.id, course.title)}
                          title="Supprimer ce cours"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Affichage de {indexOfFirstCourse + 1} à{" "}
            {Math.min(indexOfLastCourse, courses.length)} sur {courses.length} cours
          </p>
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page);
                    }}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
