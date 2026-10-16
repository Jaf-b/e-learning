"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { updateCourseContent } from "@/lib/action/courses.actions";
import {
  Video,
  FileText,
  Play,
  Eye,
  Edit3,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Upload,
  UploadCloud,
  FileDown,
  Trash2,
  HardDrive,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";

interface CourseContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    videoUrl?: string | null;
    syllabus?: string | null;
    syllabusUrl?: string | null;
  };
  onSuccess: () => void;
}

const DEFAULT_SYLLABUS_TEMPLATE = `## 1. Objectifs Pédagogiques
- Acquérir les fondamentaux théoriques et pratiques du domaine.
- Maîtriser les outils, méthodes et architectures standard de l'industrie.
- Développer l'autonomie à travers la réalisation de projets pratiques (TP).

## 2. Prérequis
- Notions de base en programmation et algorithmique.
- Connaissances élémentaires en modélisation de données.

## 3. Plan du Cours & Thématiques
- **Semaine 1-2** : Introduction générale, concepts fondamentaux et mise en place de l'environnement.
- **Semaine 3-5** : Notions approfondies, études de cas et exercices dirigés.
- **Semaine 6-8** : Architecture avancée, bonnes pratiques de conception et sécurité.
- **Semaine 9-11** : Travaux Pratiques guidés (TP) et projets en binôme.
- **Semaine 12** : Synthèse, révision générale et préparation à l'évaluation finale.

## 4. Modalités d'Évaluation
- **Contrôle continu / TP** : 40% de la note finale.
- **Interrogations rapides (Quiz)** : 20% de la note finale.
- **Examen final de session** : 40% de la note finale.

## 5. Bibliographie & Ressources Recommandées
- Documentation officielle et guides de référence.
- Ouvrages de référence universitaires recommandés pour approfondir.`;

export function CourseContentDialog({
  isOpen,
  onClose,
  course,
  onSuccess,
}: CourseContentDialogProps) {
  const [videoUrl, setVideoUrl] = useState(course.videoUrl || "");
  const [syllabusUrl, setSyllabusUrl] = useState(course.syllabusUrl || "");
  const [description, setDescription] = useState(course.description || "");
  const [syllabus, setSyllabus] = useState(course.syllabus || "");
  const [activeTab, setActiveTab] = useState<"video" | "syllabus">("video");
  const [syllabusViewMode, setSyllabusViewMode] = useState<"edit" | "preview">("edit");

  // Upload States
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingSyllabus, setIsUploadingSyllabus] = useState(false);
  const [videoUploadName, setVideoUploadName] = useState<string>("");
  const [syllabusUploadName, setSyllabusUploadName] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const syllabusFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setVideoUrl(course.videoUrl || "");
      setSyllabusUrl(course.syllabusUrl || "");
      setDescription(course.description || "");
      setSyllabus(course.syllabus || "");
      setVideoUploadName("");
      setSyllabusUploadName("");
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, course]);

  // Upload Video Locally
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "video");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        setVideoUrl(data.url);
        setVideoUploadName(file.name);
        setSuccessMsg(`Vidéo "${file.name}" téléversée en local avec succès.`);
      } else {
        setErrorMsg(data.error || "Échec de l'upload local de la vidéo.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Une erreur est survenue lors de l'upload local de la vidéo.");
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    }
  };

  // Upload Syllabus File Locally
  const handleSyllabusUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSyllabus(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "syllabus");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        setSyllabusUrl(data.url);
        setSyllabusUploadName(file.name);
        setSuccessMsg(`Fichier syllabus "${file.name}" téléversé en local avec succès.`);
      } else {
        setErrorMsg(data.error || "Échec de l'upload local du syllabus.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Une erreur est survenue lors de l'upload local du syllabus.");
    } finally {
      setIsUploadingSyllabus(false);
      if (syllabusFileInputRef.current) syllabusFileInputRef.current.value = "";
    }
  };

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

  const isLocalFile = (url: string | null) => {
    return !!url && url.startsWith("/uploads/");
  };

  const handleApplyTemplate = () => {
    if (syllabus.trim().length > 0) {
      const confirmReplace = window.confirm(
        "Remplacer le texte actuel par le modèle de syllabus standard ?"
      );
      if (!confirmReplace) return;
    }
    setSyllabus(DEFAULT_SYLLABUS_TEMPLATE);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await updateCourseContent(course.id, {
      videoUrl: videoUrl.trim() || null,
      syllabus: syllabus.trim() || null,
      syllabusUrl: syllabusUrl.trim() || null,
      description: description.trim() || null,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg("Contenu pédagogique enregistré avec succès.");
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.error || "Impossible d'enregistrer le contenu.");
    }
  };

  const embedUrl = getEmbedVideoUrl(videoUrl);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/20 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{course.code}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Espace Enseignant
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold">
                Contenu Pédagogique du Cours
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {course.title} — Uploadez en local la vidéo et le syllabus pour vos étudiants.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="video" className="flex items-center gap-2 text-xs">
                  <Video className="w-4 h-4" />
                  <span>Vidéo du Cours</span>
                  {videoUrl && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-1 bg-emerald-100 text-emerald-700">
                      {isLocalFile(videoUrl) ? "Fichier Local" : "Lien"}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="syllabus" className="flex items-center gap-2 text-xs">
                  <FileText className="w-4 h-4" />
                  <span>Syllabus Pédagogique</span>
                  {(syllabus || syllabusUrl) && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-1 bg-blue-100 text-blue-700">
                      {syllabusUrl ? "PDF/Document" : "Texte"}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* ── TAB 1 : VIDÉO DU COURS (UPLOAD LOCAL) ── */}
              <TabsContent value="video" className="space-y-4 m-0">
                {/* Local Upload Box */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.03] space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      <HardDrive className="w-4 h-4 text-primary" />
                      1. Uploader une vidéo en local
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Formats acceptés : MP4, WebM, MOV
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={videoFileInputRef}
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    className="hidden"
                    onChange={handleVideoUpload}
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      disabled={isUploadingVideo}
                      onClick={() => videoFileInputRef.current?.click()}
                      className="gap-2 text-xs w-full sm:w-auto"
                    >
                      {isUploadingVideo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Téléversement en local...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" />
                          Choisir un fichier vidéo sur l&apos;ordinateur
                        </>
                      )}
                    </Button>

                    {isLocalFile(videoUrl) && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[260px] font-mono text-[11px]">
                          {videoUploadName || videoUrl.split("/").pop()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Option URL / Lien externe */}
                <div className="space-y-1.5">
                  <Label htmlFor="course-video-url" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                    <LinkIcon className="w-3.5 h-3.5" />
                    Ou spécifier une URL externe (YouTube, Vimeo, MP4)
                  </Label>
                  <Input
                    id="course-video-url"
                    placeholder="https://www.youtube.com/watch?v=... ou /uploads/videos/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>

                {/* Video Preview */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Play className="w-3.5 h-3.5 text-primary" /> Aperçu du lecteur vidéo
                    </span>
                    {videoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setVideoUrl("");
                          setVideoUploadName("");
                        }}
                        className="text-[11px] text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Retirer la vidéo
                      </button>
                    )}
                  </div>

                  {videoUrl ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border shadow-inner">
                      {isEmbeddable(videoUrl) ? (
                        <iframe
                          src={embedUrl || ""}
                          title="Vidéo du cours"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          key={videoUrl}
                          src={videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-xl border border-dashed flex flex-col items-center justify-center bg-muted/20 text-muted-foreground p-6 text-center">
                      <Video className="w-10 h-10 mb-2 opacity-40 text-primary" />
                      <p className="text-xs font-medium text-foreground">Aucune vidéo sélectionnée</p>
                      <p className="text-[11px] text-muted-foreground max-w-xs mt-1">
                        Uploadez une vidéo locale ou collez une URL ci-dessus pour afficher le lecteur.
                      </p>
                    </div>
                  )}
                </div>

                {/* Description de cours optionnelle */}
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="course-desc" className="text-xs font-semibold">
                    Description synthétique du cours
                  </Label>
                  <Textarea
                    id="course-desc"
                    rows={2}
                    placeholder="Présentation générale du cours..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </TabsContent>

              {/* ── TAB 2 : SYLLABUS DU COURS (UPLOAD LOCAL + RÉDACTION) ── */}
              <TabsContent value="syllabus" className="space-y-4 m-0">
                {/* Local Syllabus Document Upload */}
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                      <HardDrive className="w-4 h-4 text-blue-600" />
                      1. Uploader le document Syllabus officiel (PDF / Word)
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Formats : PDF, DOC, DOCX, TXT
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={syllabusFileInputRef}
                    accept=".pdf,.doc,.docx,.txt,.md"
                    className="hidden"
                    onChange={handleSyllabusUpload}
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingSyllabus}
                      onClick={() => syllabusFileInputRef.current?.click()}
                      className="gap-2 text-xs w-full sm:w-auto border-blue-300 text-blue-800 dark:text-blue-300 hover:bg-blue-100"
                    >
                      {isUploadingSyllabus ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Téléversement du fichier...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          {syllabusUrl ? "Remplacer le document de syllabus" : "Choisir un document PDF / Word"}
                        </>
                      )}
                    </Button>

                    {syllabusUrl && (
                      <div className="flex items-center justify-between gap-3 text-xs bg-card px-3 py-1.5 rounded-lg border w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-foreground font-mono text-[11px] truncate max-w-[220px]">
                          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{syllabusUploadName || syllabusUrl.split("/").pop()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={syllabusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-muted rounded text-primary"
                            title="Télécharger / Voir le fichier"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setSyllabusUrl("");
                              setSyllabusUploadName("");
                            }}
                            className="p-1 hover:bg-rose-50 text-rose-500 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section Rédaction du Syllabus */}
                <div className="pt-2 border-t space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-primary" />
                        2. Contenu textuel & Programme détaillé (Optionnel si PDF fourni)
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Vous pouvez également saisir les objectifs, compétences et calendrier du cours.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={handleApplyTemplate}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Modèle de syllabus
                      </Button>

                      <div className="flex items-center border rounded-lg overflow-hidden bg-muted/40 p-0.5">
                        <button
                          type="button"
                          onClick={() => setSyllabusViewMode("edit")}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                            syllabusViewMode === "edit"
                              ? "bg-background text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Edit3 className="w-3 h-3" /> Éditeur
                        </button>
                        <button
                          type="button"
                          onClick={() => setSyllabusViewMode("preview")}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                            syllabusViewMode === "preview"
                              ? "bg-background text-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Eye className="w-3 h-3" /> Aperçu
                        </button>
                      </div>
                    </div>
                  </div>

                  {syllabusViewMode === "edit" ? (
                    <Textarea
                      rows={11}
                      placeholder="Rédigez le texte du syllabus ici (objectifs, plan par semaine, devoirs et barème)..."
                      value={syllabus}
                      onChange={(e) => setSyllabus(e.target.value)}
                      className="font-mono text-xs leading-relaxed resize-y"
                    />
                  ) : (
                    <div className="min-h-[220px] max-h-[340px] overflow-y-auto p-4 rounded-xl border bg-card prose prose-xs dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                      {syllabus.trim() ? (
                        syllabus
                      ) : (
                        <p className="text-muted-foreground italic text-center py-8">
                          Aucun texte de syllabus rédigé.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-3 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between">
            <span className="text-[11px] text-muted-foreground">
              Les fichiers uploadés en local sont servis directement dans le projet.
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting || isUploadingVideo || isUploadingSyllabus}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || isUploadingVideo || isUploadingSyllabus}
                className="gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {isSubmitting ? "Enregistrement..." : "Enregistrer le contenu"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
