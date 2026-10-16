"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Users,
  FileCheck,
  GraduationCapIcon,
  Plus,
  Edit,
  Trash2,
  PlayCircle,
  FileText,
  Video,
  FolderCode,
  Sparkles,
  FileDown,
} from "lucide-react";
import { StudentTable } from "@/components/teacher/student-table";
import { GradeTable } from "@/components/teacher/grade-table";
import { EvaluationList } from "@/components/teacher/evaluation-list";
import { TpSubmissionsList } from "@/components/teacher/tp-submissions-list";
import { ModuleDialog } from "@/components/teacher/module-dialog";
import { LessonDialog } from "@/components/teacher/lesson-dialog";
import { CourseContentDialog } from "@/components/teacher/course-content-dialog";
import {
  getAssessmentsByCourseId,
  getCourseWithModules,
  getEnrolledStudentsByCourseId,
  getStudentGradesOverview,
  getTpSubmissionsByCourseId,
  deleteModule,
  deleteLesson,
} from "@/lib/action/courses.actions";
import { deleteAssessment } from "@/lib/action/question.actions";
import { AssessmentRecord, StudentGradeOverview, StudentRecord } from "@/types/academic";
import { TpSubmissionRecord } from "@/lib/types";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [gradesOverview, setGradesOverview] = useState<StudentGradeOverview[]>([]);
  const [tpSubmissions, setTpSubmissions] = useState<TpSubmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog State for Course Content (Video & Syllabus)
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);

  // Dialog States for Modules & Lessons
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<any>(null);

  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<any>(null);
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<{ id: string; title: string } | null>(null);

  const getEmbedVideoUrl = (url: string | null) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.includes("youtube.com/watch?v=")) {
      const videoId = trimmed.split("watch?v=")[1]?.split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (trimmed.includes("youtu.be/")) {
      const videoId = trimmed.split("youtu.be/")[1]?.split("?")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (trimmed.includes("vimeo.com/")) {
      const videoId = trimmed.split("vimeo.com/")[1]?.split("?")[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    return trimmed;
  };

  const isEmbeddable = (url: string) => {
    return (
      url.includes("youtube") ||
      url.includes("youtu.be") ||
      url.includes("vimeo")
    );
  };

  const fetchAllData = async () => {
    if (!courseId) return;
    const courseRes = await getCourseWithModules(courseId);
    const studentsRes = await getEnrolledStudentsByCourseId(courseId);
    const gradesRes = await getStudentGradesOverview(courseId);
    const assessmentsRes = await getAssessmentsByCourseId(courseId);
    const tpRes = await getTpSubmissionsByCourseId(courseId);

    if (courseRes) setCourse(courseRes);
    if (studentsRes) setStudents(studentsRes as StudentRecord[]);
    if (gradesRes) setGradesOverview(gradesRes as StudentGradeOverview[]);
    if (assessmentsRes) setAssessments(assessmentsRes as AssessmentRecord[]);
    setTpSubmissions(tpRes);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [courseId]);

  const handleEditAssessment = (assessment: AssessmentRecord) => {
    router.push(`/teacher/create-quiz/${assessment.id}`);
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette évaluation ? Toutes les questions associées seront également supprimées.")) {
      return;
    }

    const res = await deleteAssessment(assessmentId);
    if (res.success) {
      fetchAllData();
    } else {
      alert(res.error || "Échec de la suppression.");
    }
  };

  // Module Actions
  const handleOpenAddModule = () => {
    setModuleToEdit(null);
    setIsModuleDialogOpen(true);
  };

  const handleOpenEditModule = (mod: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setModuleToEdit(mod);
    setIsModuleDialogOpen(true);
  };

  const handleDeleteModuleClick = async (modId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer ce module et toutes ses leçons ?")) {
      return;
    }
    const res = await deleteModule(modId);
    if (res.success) {
      fetchAllData();
    } else {
      alert(res.error || "Échec de la suppression du module.");
    }
  };

  // Lesson Actions
  const handleOpenAddLesson = (mod: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedModuleForLesson({ id: mod.id, title: mod.title });
    setLessonToEdit(null);
    setIsLessonDialogOpen(true);
  };

  const handleOpenEditLesson = (mod: any, les: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedModuleForLesson({ id: mod.id, title: mod.title });
    setLessonToEdit(les);
    setIsLessonDialogOpen(true);
  };

  const handleDeleteLessonClick = async (lesId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Voulez-vous vraiment supprimer cette leçon ?")) {
      return;
    }
    const res = await deleteLesson(lesId);
    if (res.success) {
      fetchAllData();
    } else {
      alert(res.error || "Échec de la suppression de la leçon.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-4 w-96 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-10 w-96 rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="p-8 text-center text-rose-500">Cours introuvable.</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      {/* Entête du Cours */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{course.code}</Badge>
            <Badge>{course.credits} Crédits</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2">{course.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{course.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setIsContentDialogOpen(true)}
            className="gap-2 text-xs font-semibold"
          >
            <Video className="w-4 h-4 text-blue-500" />
            <span>Vidéo & Syllabus</span>
          </Button>
          <Button onClick={handleOpenAddModule} className="gap-1.5 text-xs font-semibold">
            <Plus className="w-4 h-4" /> Nouveau Module
          </Button>
        </div>
      </div>

      {/* Onglets Principaux */}
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Modules & Leçons</span>
          </TabsTrigger>
          <TabsTrigger value="syllabus" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Vidéo & Syllabus</span>
            {(course.videoUrl || course.syllabus) && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Étudiants ({students.length})</span>
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span>Évaluations & TP ({assessments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2 relative">
            <FolderCode className="w-4 h-4" />
            <span>Soumissions TP</span>
            {tpSubmissions.filter((s) => !s.isGraded).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold">
                {tpSubmissions.filter((s) => !s.isGraded).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="grades" className="flex items-center gap-2">
            <GraduationCapIcon className="w-4 h-4" />
            <span>Notes & Résultats</span>
          </TabsTrigger>
        </TabsList>

        {/* --- TAB 1 : MODULES & CHAPITRES --- */}
        <TabsContent value="modules">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Programme du cours</CardTitle>
                <CardDescription>
                  Gérez la structure du cours, créez les modules et ajoutez du contenu texte ou vidéo.
                </CardDescription>
              </div>
              <Button size="sm" onClick={handleOpenAddModule}>
                <Plus className="w-4 h-4 mr-2" /> Ajouter un Module
              </Button>
            </CardHeader>
            <CardContent>
              {!course.modules || course.modules.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold text-lg">Aucun module créé pour le moment</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Commencez par ajouter le premier module de ce cours pour y insérer vos leçons.
                  </p>
                  <Button onClick={handleOpenAddModule}>
                    <Plus className="w-4 h-4 mr-2" /> Créer le premier module
                  </Button>
                </div>
              ) : (
                <Accordion className="w-full">
                  {course.modules.map((module: any, modIdx: number) => (
                    <AccordionItem key={module.id} value={module.id}>
                      <AccordionTrigger
                        className="font-semibold text-base px-4 py-3 hover:no-underline"
                        actions={
                          <div className="flex items-center gap-2 pr-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs"
                              onClick={(e) => handleOpenAddLesson(module, e)}
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" /> Leçon
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={(e) => handleOpenEditModule(module, e)}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-rose-500 hover:text-rose-600"
                              onClick={(e) => handleDeleteModuleClick(module.id, e)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        }
                      >
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                              {modIdx + 1}
                            </span>
                            <span>{module.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {module.lessons?.length || 0} leçon(s)
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-2 pt-2 pb-4 px-4 border-t">
                        {!module.lessons || module.lessons.length === 0 ? (
                          <div className="py-4 text-center text-xs text-muted-foreground border border-dashed rounded-md my-1">
                            Aucune leçon dans ce module.{" "}
                            <button
                              className="text-primary underline font-medium"
                              onClick={(e) => handleOpenAddLesson(module, e as any)}
                            >
                              Ajouter la première leçon
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 mt-2">
                            {module.lessons.map((lesson: any, lesIdx: number) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/40 hover:bg-muted/70 transition-colors"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {lesson.videoUrl ? (
                                      <Badge variant="default" className="bg-blue-600 text-[10px]">
                                        <Video className="w-3 h-3 mr-1" /> Vidéo
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px]">
                                        <FileText className="w-3 h-3 mr-1" /> Texte
                                      </Badge>
                                    )}
                                    <span className="font-semibold text-sm">
                                      {lesIdx + 1}. {lesson.title}
                                    </span>
                                  </div>
                                  {lesson.content && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {lesson.content}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={(e) => handleOpenEditLesson(module, lesson, e)}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-rose-500 hover:text-rose-600"
                                    onClick={(e) => handleDeleteLessonClick(lesson.id, e)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2 : VIDÉO & SYLLABUS --- */}
        <TabsContent value="syllabus" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Vidéo de Présentation */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="overflow-hidden shadow-xs border">
                <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-600" />
                      Vidéo de Présentation du Cours
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Introduction au cours visible par tous les étudiants inscrits.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 gap-1.5"
                    onClick={() => setIsContentDialogOpen(true)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {course.videoUrl ? "Modifier la vidéo" : "Ajouter une vidéo"}
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  {course.videoUrl ? (
                    <div className="space-y-3">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                        {isEmbeddable(course.videoUrl) ? (
                          <iframe
                            src={getEmbedVideoUrl(course.videoUrl) || ""}
                            title={course.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={course.videoUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {course.description || "Aucune description complémentaire."}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed rounded-xl bg-muted/20">
                      <Video className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
                      <h4 className="font-semibold text-sm">Aucune vidéo d&apos;introduction</h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                        Ajoutez une courte vidéo de bienvenue (YouTube, Vimeo ou MP4) pour présenter les objectifs de votre enseignement.
                      </p>
                      <Button size="sm" onClick={() => setIsContentDialogOpen(true)} className="gap-1.5 text-xs">
                        <Video className="w-3.5 h-3.5" />
                        Ajouter la vidéo du cours
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Syllabus Officiel */}
            <div className="lg:col-span-6 space-y-4">
              <Card className="shadow-xs border">
                <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Syllabus Officiel
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Objectifs, prérequis, plan thématique et modalités d&apos;évaluation.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 gap-1.5"
                    onClick={() => setIsContentDialogOpen(true)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {course.syllabus ? "Modifier le syllabus" : "Rédiger le syllabus"}
                  </Button>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {course.syllabusUrl && (
                    <div className="p-3.5 rounded-xl border bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-700 dark:text-blue-300">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-foreground">Document Syllabus officiel</div>
                          <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">
                            {course.syllabusUrl.split("/").pop()}
                          </div>
                        </div>
                      </div>
                      <a
                        href={course.syllabusUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shrink-0"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Consulter / Télécharger
                      </a>
                    </div>
                  )}

                  {course.syllabus ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap rounded-lg bg-card max-h-[440px] overflow-y-auto pr-2">
                      {course.syllabus}
                    </div>
                  ) : !course.syllabusUrl ? (
                    <div className="text-center py-10 border border-dashed rounded-xl bg-muted/20">
                      <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
                      <h4 className="font-semibold text-sm">Syllabus non renseigné</h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                        Fournissez à vos étudiants le programme détaillé, les critères de notation et les références de lecture.
                      </p>
                      <Button size="sm" onClick={() => setIsContentDialogOpen(true)} className="gap-1.5 text-xs">
                        <FileText className="w-3.5 h-3.5" />
                        Uploader / Rédiger le syllabus
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* --- TAB 3 : ÉTUDIANTS --- */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Étudiants inscrits</CardTitle>
              <CardDescription>Répertoire des étudiants inscrits à cette promotion.</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentTable students={students} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 4 : ÉVALUATIONS & TP --- */}
        <TabsContent value="evaluations">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Quiz, Examens & Travaux Pratiques (TP)</CardTitle>
                <CardDescription>Concevez et gérez les TP, devoirs, interrogations et examens de ce cours.</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/teacher/create-quiz/${courseId}?type=TP`}>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300">
                    <FolderCode className="w-4 h-4" /> Nouveau TP / Devoir
                  </Button>
                </Link>
                <Link href={`/teacher/create-quiz/${courseId}?type=QUIZ`}>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <Plus className="w-4 h-4" /> Nouveau Quiz / Examen
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <EvaluationList
                assessments={assessments}
                onEdit={handleEditAssessment}
                onDelete={handleDeleteAssessment}
                onSelect={handleEditAssessment}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 5 : SOUMISSIONS TP --- */}
        <TabsContent value="submissions">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FolderCode className="w-5 h-5 text-blue-600" />
                  Soumissions des Travaux Pratiques
                </CardTitle>
                <CardDescription>
                  Consultez, téléchargez et notez les travaux soumis par vos étudiants.
                  {tpSubmissions.filter((s) => !s.isGraded).length > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-700">
                      {tpSubmissions.filter((s) => !s.isGraded).length} en attente de correction
                    </span>
                  )}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <TpSubmissionsList
                submissions={tpSubmissions}
                courseId={courseId}
                onRefresh={fetchAllData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 6 : NOTES & RÉSULTATS --- */}
        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Relevé des Notes</CardTitle>
              <CardDescription>Notes attribuées aux étudiants pour ce cours.</CardDescription>
            </CardHeader>
            <CardContent>
              <GradeTable records={gradesOverview} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for Course Content (Video & Syllabus) */}
      {course && (
        <CourseContentDialog
          isOpen={isContentDialogOpen}
          onClose={() => setIsContentDialogOpen(false)}
          course={course}
          onSuccess={fetchAllData}
        />
      )}

      {/* Dialog for Module creation/editing */}
      <ModuleDialog
        isOpen={isModuleDialogOpen}
        onClose={() => setIsModuleDialogOpen(false)}
        courseId={courseId}
        moduleToEdit={moduleToEdit}
        onSuccess={fetchAllData}
      />

      {/* Dialog for Lesson creation/editing */}
      <LessonDialog
        isOpen={isLessonDialogOpen}
        onClose={() => setIsLessonDialogOpen(false)}
        moduleId={selectedModuleForLesson?.id || ""}
        moduleTitle={selectedModuleForLesson?.title}
        lessonToEdit={lessonToEdit}
        onSuccess={fetchAllData}
      />
    </div>
  );
}