"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CourseDialog from "./course-dialog";
import {
  BookOpen,
  Pencil,
  Eye,
  Layers,
  Award,
  GraduationCap,
  User as UserIcon,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  FileText,
  Video,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Filiere, DegreeLevel, User } from "@/types";

interface LessonItem {
  id: string;
  title: string;
  order: number;
  videoUrl?: string | null;
  content?: string | null;
}

interface ModuleItem {
  id: string;
  title: string;
  order: number;
  lessons?: LessonItem[];
}

export interface CourseDetailItem {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  credits: number;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED" | string;
  filiereId: string;
  degreeLevelId: string;
  authorId: string;
  rejectionReason?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  filiereName?: string | null;
  degreeLevelName?: string | null;
  authorName?: string | null;
  moduleCount?: number;
  author?: {
    id?: string;
    name?: string | null;
    image?: string | null;
    email?: string | null;
  } | null;
  filiere?: {
    id?: string;
    name?: string | null;
  } | null;
  degreeLevel?: {
    id?: string;
    name?: string | null;
  } | null;
  modules?: ModuleItem[];
}

interface CourseDetailsDialogProps {
  course: CourseDetailItem;
  filieres: Filiere[];
  degreeLevels: DegreeLevel[];
  authors: User[];
  onSaveCourse: (course: any) => Promise<void> | void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const statusConfig: Record<
  string,
  { label: string; className: string; borderAccent: string; icon: React.ReactNode }
> = {
  PUBLISHED: {
    label: "Publié",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    borderAccent: "bg-emerald-500",
    icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
  },
  DRAFT: {
    label: "Brouillon",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    borderAccent: "bg-slate-400",
    icon: <Clock className="w-3.5 h-3.5 text-slate-500" />,
  },
  PENDING_REVIEW: {
    label: "En révision",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    borderAccent: "bg-amber-500",
    icon: <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
  },
  REJECTED: {
    label: "Rejeté",
    className:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    borderAccent: "bg-rose-500",
    icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />,
  },
  ARCHIVED: {
    label: "Archivé",
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    borderAccent: "bg-gray-400",
    icon: <Archive className="w-3.5 h-3.5 text-gray-500" />,
  },
};

export default function CourseDetailsDialog({
  course,
  filieres,
  degreeLevels,
  authors,
  onSaveCourse,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CourseDetailsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (!isControlled) setInternalOpen(newOpen);
  };
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum">("overview");
  const [editOpen, setEditOpen] = useState(false);

  const statusInfo = statusConfig[course.status] || statusConfig["DRAFT"];
  const filiereName = course.filiereName || course.filiere?.name || "Non définie";
  const degreeLevelName = course.degreeLevelName || course.degreeLevel?.name || "N/A";
  const authorName = course.authorName || course.author?.name || "Non assigné";
  const authorEmail = course.author?.email;

  const moduleList = course.modules || [];
  const totalLessons = moduleList.reduce(
    (sum, mod) => sum + (mod.lessons?.length || 0),
    0
  );

  const getInitials = (name?: string | null) => {
    if (!name) return "E";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "Non précisé";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Voir les détails"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
          {/* Top Decorative Border Accent */}
          <div className={cn("h-1.5 w-full", statusInfo.borderAccent)} />

          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/60 shrink-0">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <BookOpen className="w-3.5 h-3.5" />
                  {course.code}
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shadow-2xs",
                    statusInfo.className
                  )}
                >
                  {statusInfo.icon}
                  {statusInfo.label}
                </span>
              </div>

              <div>
                <DialogTitle className="text-lg font-bold text-foreground leading-snug">
                  {course.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Consultez la fiche pédagogique, le contenu des modules et les détails administratifs.
                </DialogDescription>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                    activeTab === "overview"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <Info className="w-3.5 h-3.5" />
                  Aperçu Général
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("curriculum")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                    activeTab === "curriculum"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Modules & Leçons ({moduleList.length})
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-border/60 bg-muted/30 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  Crédits ECTS
                </span>
                <span className="text-lg font-bold text-foreground">
                  {course.credits}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-muted/30 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Modules
                </span>
                <span className="text-lg font-bold text-foreground">
                  {moduleList.length}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-muted/30 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  Leçons
                </span>
                <span className="text-lg font-bold text-foreground">
                  {totalLessons}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-muted/30 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                  Niveau
                </span>
                <span className="text-xs font-bold text-foreground truncate mt-1">
                  {degreeLevelName}
                </span>
              </div>
            </div>

            {/* Rejection Alert Banner if applicable */}
            {course.status === "REJECTED" && course.rejectionReason && (
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-semibold block">Motif du rejet du cours :</span>
                  <p className="leading-relaxed">{course.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    Description du cours
                  </h4>
                  <div className="p-4 rounded-xl bg-muted/20 border border-border/60 text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {course.description || (
                      <span className="text-muted-foreground italic">
                        Aucune description détaillée n'a été saisie pour ce cours.
                      </span>
                    )}
                  </div>
                </div>

                {/* Academic Context & Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Filière & Niveau */}
                  <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2.5">
                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      Rattachement Académique
                    </h5>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Filière :</span>
                        <span className="font-semibold text-foreground">{filiereName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Niveau :</span>
                        <Badge variant="outline" className="text-[10px] font-medium">
                          {degreeLevelName}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Volume :</span>
                        <span className="font-medium text-foreground">{course.credits} crédits</span>
                      </div>
                    </div>
                  </div>

                  {/* Enseignant / Auteur */}
                  <div className="p-4 rounded-xl border border-border/60 bg-card space-y-2.5">
                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-primary" />
                      Enseignant Responsable
                    </h5>
                    <div className="flex items-center gap-3 pt-0.5">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={course.author?.image || undefined} alt={authorName} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {getInitials(authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-foreground truncate">
                          {authorName}
                        </span>
                        {authorEmail && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {authorEmail}
                          </span>
                        )}
                        <span className="text-[10px] text-primary font-medium mt-0.5">
                          Auteur du cours
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates & Metadata */}
                <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>Créé le : <strong className="text-foreground font-medium">{formatDate(course.createdAt)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>Dernière mise à jour : <strong className="text-foreground font-medium">{formatDate(course.updatedAt)}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CURRICULUM & MODULES */}
            {activeTab === "curriculum" && (
              <div className="space-y-4">
                {moduleList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-border/80 rounded-2xl bg-card/50">
                    <Layers className="w-10 h-10 text-muted-foreground/50 mb-2.5" />
                    <h4 className="text-sm font-bold text-foreground">Aucun module créé</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
                      L'enseignant n'a pas encore ajouté de modules ou de leçons pour ce cours.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {moduleList
                      .sort((a, b) => a.order - b.order)
                      .map((mod, index) => (
                        <div
                          key={mod.id}
                          className="rounded-xl border border-border/60 bg-card overflow-hidden"
                        >
                          {/* Module Header */}
                          <div className="p-3.5 bg-muted/40 border-b border-border/40 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                                {mod.order || index + 1}
                              </span>
                              <span className="font-semibold text-xs text-foreground truncate">
                                {mod.title}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                              {mod.lessons?.length || 0} leçon{(mod.lessons?.length || 0) > 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Lessons inside module */}
                          {mod.lessons && mod.lessons.length > 0 ? (
                            <div className="divide-y divide-border/30 px-3.5 py-1">
                              {mod.lessons
                                .sort((a, b) => a.order - b.order)
                                .map((lesson, lIndex) => (
                                  <div
                                    key={lesson.id}
                                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                                      <span className="text-foreground font-medium truncate">
                                        {lesson.order || lIndex + 1}. {lesson.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {lesson.videoUrl && (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded font-medium">
                                          <Video className="w-3 h-3" />
                                          Vidéo
                                        </span>
                                      )}
                                      {lesson.content && (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">
                                          <FileText className="w-3 h-3" />
                                          Texte
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="p-3 text-[11px] text-muted-foreground italic">
                              Aucune leçon dans ce module pour le moment.
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Edit Trigger */}
          <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/30 shrink-0 flex flex-row items-center justify-between sm:justify-between">
            <DialogClose
              render={<Button variant="outline" size="sm" className="text-xs" />}
            >
              Fermer
            </DialogClose>

            <Button
              size="sm"
              className="text-xs gap-1.5 font-semibold"
              onClick={() => {
                setOpen(false);
                setEditOpen(true);
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier ce cours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog connected directly */}
      <CourseDialog
        course={course as any}
        filieres={filieres}
        degreeLevels={degreeLevels}
        authors={authors}
        onSave={onSaveCourse}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
