"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, PlayCircle, ChevronLeft, ChevronRight, FileText } from "lucide-react";

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
}

export function CourseLessonViewer({ courseTitle, modules }: CourseLessonViewerProps) {
  // Flatten all lessons for navigation
  const allLessons: { lesson: Lesson; moduleTitle: string }[] = [];
  modules.forEach((mod) => {
    mod.lessons?.forEach((les) => {
      allLessons.push({ lesson: les, moduleTitle: mod.title });
    });
  });

  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    allLessons[0]?.lesson.id || null
  );

  // Controlled accordion: all modules open by default
  const [openModules, setOpenModules] = useState<string[]>(modules.map((m) => m.id));

  useEffect(() => {
    setOpenModules(modules.map((m) => m.id));
    // Set first lesson as active when modules load
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

  const getEmbedVideoUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
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
    <div className="flex sm:flex-col gap-6">

      {/* ── LEFT: Module & Lesson Navigation ── */}
      <div className="lg:col-span-4">
        <div className="sticky top-4">
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Programme du cours</span>
                <Badge variant="secondary">{allLessons.length} leçon{allLessons.length > 1 ? "s" : ""}</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Sélectionnez un chapitre pour commencer la lecture.
              </CardDescription>
            </CardHeader>

            {/* Scrollable lesson list */}
            <div className="max-h-[65vh] overflow-y-auto">
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
                            {mod.lessons?.length ?? 0} leçon{(mod.lessons?.length ?? 0) > 1 ? "s" : ""}
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
        </div>
      </div>

      {/* ── RIGHT: Lesson Content ── */}
      <div className="flex-1 space-y-6">
        {activeItem ? (
          <Card className="shadow-md border-primary/20">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{activeItem.moduleTitle}</span>
                <Badge variant="outline">
                  Leçon {activeIndex + 1} / {allLessons.length}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold">{activeItem.lesson.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Video */}
              {activeItem.lesson.videoUrl && (
                <div className="aspect-video w-full rounded-xl overflow-hidden  bg-black shadow-inner">
                  {activeItem.lesson.videoUrl.includes("youtube") ||
                  activeItem.lesson.videoUrl.includes("youtu.be") ? (
                    <iframe
                      src={getEmbedVideoUrl(activeItem.lesson.videoUrl) || ""}
                      title={activeItem.lesson.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeItem.lesson.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              )}

              {/* Text content */}
              <div className="prose mt-5 dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
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

              {/* Prev / Next navigation */}
              <div className="flex items-center justify-between border-t pt-4">
                <Button variant="outline" size="sm" onClick={handlePrev} disabled={activeIndex <= 0}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
                </Button>
                <span className="text-xs text-muted-foreground">
                  {activeIndex + 1} de {allLessons.length}
                </span>
                <Button size="sm" onClick={handleNext} disabled={activeIndex >= allLessons.length - 1}>
                  Suivant <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Veuillez sélectionner une leçon dans le menu.</p>
          </Card>
        )}
      </div>

    </div>
  );
}
