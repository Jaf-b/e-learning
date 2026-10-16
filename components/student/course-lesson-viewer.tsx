"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileDown,
  Video,
  Download,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  order: number;
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface CourseLessonViewerProps {
  courseTitle: string;
  modules: Module[];
  /** URL du fichier syllabus téléchargeable (PDF, DOCX, etc.) */
  syllabusUrl?: string | null;
  /** Texte du syllabus (contenu brut) */
  syllabus?: string | null;
  /** URL de la vidéo de présentation du cours */
  courseVideoUrl?: string | null;
}

/** Convertit une URL YouTube / Vimeo en URL embed. Sinon retourne l'URL brute. */
function getEmbedVideoUrl(url: string | null): string | null {
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
}

function isEmbeddable(url: string): boolean {
  return url.includes("youtube") || url.includes("youtu.be") || url.includes("vimeo");
}

/** Rend le lecteur vidéo adapté au type d'URL */
function VideoPlayer({ url, title }: { url: string; title: string }) {
  const embedUrl = getEmbedVideoUrl(url);
  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
      {isEmbeddable(url) && embedUrl ? (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          src={url}
          controls
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
}

/** Panneau syllabus — affiché à droite */
function SyllabusPanel({
  syllabusUrl,
  syllabus,
  courseVideoUrl,
  courseTitle,
}: {
  syllabusUrl?: string | null;
  syllabus?: string | null;
  courseVideoUrl?: string | null;
  courseTitle: string;
}) {
  const hasSyllabus = !!syllabusUrl || !!syllabus;
  const hasCourseVideo = !!courseVideoUrl;

  return (
    <div className="space-y-4">
      {/* Vidéo de présentation du cours */}
      {hasCourseVideo && (
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="pb-2 bg-muted/20 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600" />
              Vidéo de présentation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <VideoPlayer url={courseVideoUrl!} title={courseTitle} />
          </CardContent>
        </Card>
      )}

      {/* Syllabus */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 bg-muted/20 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Syllabus du cours
          </CardTitle>
          <CardDescription className="text-xs">
            Programme, objectifs et modalités de notation.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {/* Bouton téléchargement */}
          {syllabusUrl && (
            <div className="p-3 rounded-xl border bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-700 dark:text-blue-300 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-foreground">Syllabus officiel</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">
                    {syllabusUrl.split("/").pop()}
                  </div>
                </div>
              </div>
              <a
                href={syllabusUrl}
                download
                className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Télécharger le syllabus
              </a>
            </div>
          )}

          {/* Contenu texte du syllabus */}
          {syllabus ? (
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
              {syllabus}
            </div>
          ) : !syllabusUrl ? (
            <div className="text-center py-8 border border-dashed rounded-xl bg-muted/20 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium text-foreground">Syllabus non disponible</p>
              <p className="text-[11px] mt-1">
                L&apos;enseignant publiera le syllabus prochainement.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function CourseLessonViewer({
  courseTitle,
  modules,
  syllabusUrl,
  syllabus,
  courseVideoUrl,
}: CourseLessonViewerProps) {
  // Flatten all lessons for linear navigation
  const allLessons: { lesson: Lesson; moduleTitle: string }[] = [];
  modules.forEach((mod) => {
    mod.lessons?.forEach((les) => {
      allLessons.push({ lesson: les, moduleTitle: mod.title });
    });
  });

  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    allLessons[0]?.lesson.id || null
  );

  // All modules open by default in sidebar
  const [openModules, setOpenModules] = useState<string[]>(modules.map((m) => m.id));

  useEffect(() => {
    setOpenModules(modules.map((m) => m.id));
    if (!activeLessonId && allLessons.length > 0) {
      setActiveLessonId(allLessons[0].lesson.id);
    }
  }, [modules]);

  const activeIndex = allLessons.findIndex((item) => item.lesson.id === activeLessonId);
  const activeItem = activeIndex !== -1 ? allLessons[activeIndex] : null;

  const handlePrev = () => {
    if (activeIndex > 0) setActiveLessonId(allLessons[activeIndex - 1].lesson.id);
  };

  const handleNext = () => {
    if (activeIndex < allLessons.length - 1) setActiveLessonId(allLessons[activeIndex + 1].lesson.id);
  };

  if (!modules || modules.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-lg">Aucun module disponible</h3>
        <p className="text-sm text-muted-foreground mt-1">
          L&apos;enseignant n&apos;a pas encore publié de leçons pour ce cours.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* ── COLONNE GAUCHE / PRINCIPALE (8/12) ── */}
      <div className="lg:col-span-8 space-y-4">

        {/* ── 1. VIDÉO DE LA LEÇON (en haut) ── */}
        {activeItem?.lesson.videoUrl ? (
          <Card className="overflow-hidden shadow-sm border-primary/20">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-primary flex items-center gap-1">
                  <PlayCircle className="w-3.5 h-3.5" />
                  {activeItem.moduleTitle}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  Leçon {activeIndex + 1} / {allLessons.length}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold mt-1">{activeItem.lesson.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <VideoPlayer url={activeItem.lesson.videoUrl} title={activeItem.lesson.title} />
            </CardContent>
          </Card>
        ) : activeItem ? (
          /* Pas de vidéo — juste le titre de la leçon */
          <Card className="shadow-sm border-primary/20">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-primary">{activeItem.moduleTitle}</span>
                <Badge variant="outline" className="text-[10px]">
                  Leçon {activeIndex + 1} / {allLessons.length}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold mt-1">{activeItem.lesson.title}</CardTitle>
            </CardHeader>
          </Card>
        ) : null}

        {/* ── 2. CONTENU TEXTE (en bas, sous la vidéo) ── */}
        {activeItem && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Contenu de la leçon
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap min-h-[120px]">
                {activeItem.lesson.content ? (
                  activeItem.lesson.content
                ) : (
                  <p className="text-muted-foreground italic">
                    Aucun contenu textuel rédigé pour cette leçon.{" "}
                    {activeItem.lesson.videoUrl
                      ? "Regardez la vidéo ci-dessus."
                      : "L'enseignant n'a pas encore ajouté de contenu."}
                  </p>
                )}
              </div>

              {/* ── Navigation Prev / Next ── */}
              <div className="flex items-center justify-between border-t pt-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={activeIndex <= 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {activeIndex + 1} / {allLessons.length}
                </span>
                <Button
                  size="sm"
                  onClick={handleNext}
                  disabled={activeIndex >= allLessons.length - 1}
                >
                  Suivant <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!activeItem && (
          <Card className="p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Veuillez sélectionner une leçon dans le menu.</p>
          </Card>
        )}
      </div>

      {/* ── COLONNE DROITE (4/12) ── */}
      <div className="lg:col-span-4 space-y-4">

        {/* Navigation modules & leçons */}
        <Card className="shadow-sm overflow-hidden sticky top-4">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Programme du cours</span>
              <Badge variant="secondary">
                {allLessons.length} leçon{allLessons.length > 1 ? "s" : ""}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Sélectionnez un chapitre pour commencer la lecture.
            </CardDescription>
          </CardHeader>

          <div className="max-h-[55vh] overflow-y-auto">
            <CardContent className="p-2">
              <Accordion
                type="multiple"
                value={openModules}
                onValueChange={setOpenModules}
                className="w-full"
              >
                {modules.map((mod, modIdx) => (
                  <AccordionItem key={mod.id} value={mod.id} className="border-b-0 mb-1">
                    <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline rounded-lg hover:bg-accent/50">
                      <div className="flex items-center gap-2 text-left w-full">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold shrink-0">
                          {modIdx + 1}
                        </span>
                        <span className="line-clamp-1 flex-1">{mod.title}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 shrink-0">
                          {mod.lessons?.length ?? 0}
                        </Badge>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-1 pb-1 pl-4 space-y-1">
                      {mod.lessons && mod.lessons.length > 0 ? (
                        mod.lessons.map((les) => {
                          const isActive = les.id === activeLessonId;
                          return (
                            <button
                              key={les.id}
                              onClick={() => setActiveLessonId(les.id)}
                              className={`w-full flex items-center gap-2 text-left px-3 py-2 text-xs rounded-md transition-colors ${
                                isActive
                                  ? "bg-primary text-primary-foreground font-medium"
                                  : "hover:bg-accent text-foreground"
                              }`}
                            >
                              {les.videoUrl ? (
                                <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                              )}
                              <span className="line-clamp-2">{les.title}</span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground px-3 py-2 italic">
                          Aucune leçon dans ce module.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </div>
        </Card>

        {/* Syllabus & vidéo de présentation du cours */}
        <SyllabusPanel
          syllabusUrl={syllabusUrl}
          syllabus={syllabus}
          courseVideoUrl={courseVideoUrl}
          courseTitle={courseTitle}
        />
      </div>

    </div>
  );
}
