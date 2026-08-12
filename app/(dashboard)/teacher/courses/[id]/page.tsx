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
} from "lucide-react";
import { StudentTable } from "@/components/teacher/student-table";
import { GradeTable } from "@/components/teacher/grade-table";
import { EvaluationList } from "@/components/teacher/evaluation-list";
import { ModuleDialog } from "@/components/teacher/module-dialog";
import { LessonDialog } from "@/components/teacher/lesson-dialog";
import {
  getAssessmentsByCourseId,
  getCourseWithModules,
  getEnrolledStudentsByCourseId,
  getStudentGradesOverview,
  deleteModule,
  deleteLesson,
} from "@/lib/action/courses.actions";
import { deleteAssessment } from "@/lib/action/question.actions";
import { AssessmentRecord, StudentGradeOverview, StudentRecord } from "@/types/academic";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [gradesOverview, setGradesOverview] = useState<StudentGradeOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States for Modules & Lessons
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<any>(null);

  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<any>(null);
  const [selectedModuleForLesson, setSelectedModuleForLesson] = useState<{ id: string; title: string } | null>(null);

  const fetchAllData = async () => {
    if (!courseId) return;
    const courseRes = await getCourseWithModules(courseId);
    const studentsRes = await getEnrolledStudentsByCourseId(courseId);
    const gradesRes = await getStudentGradesOverview(courseId);
    const assessmentsRes = await getAssessmentsByCourseId(courseId);

    if (courseRes) setCourse(courseRes);
    if (studentsRes) setStudents(studentsRes as StudentRecord[]);
    if (gradesRes) setGradesOverview(gradesRes as StudentGradeOverview[]);
    if (assessmentsRes) setAssessments(assessmentsRes as AssessmentRecord[]);
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

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Link href={`/teacher/courses/${course.id}/edit`}>Éditer</Link>
          </Button>
          <Button onClick={handleOpenAddModule}>
            <Plus className="w-4 h-4 mr-2" /> Nouveau Module
          </Button>
        </div>
      </div>

      {/* Onglets Principaux */}
      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Modules & Chapitres</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Étudiants ({students.length})</span>
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span>Évaluations ({assessments.length})</span>
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
                      <AccordionTrigger className="font-semibold text-base px-4 py-3 hover:no-underline">
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

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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

        {/* --- TAB 2 : ÉTUDIANTS --- */}
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

        {/* --- TAB 3 : ÉVALUATIONS & QUIZ --- */}
        <TabsContent value="evaluations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quiz & Évaluations</CardTitle>
                <CardDescription>Gérez les quiz, devoirs et examens de ce cours.</CardDescription>
              </div>
              <Link href={`/teacher/create-quiz/${courseId}`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Créer une évaluation
                </Button>
              </Link>
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

        {/* --- TAB 4 : NOTES & RÉSULTATS --- */}
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