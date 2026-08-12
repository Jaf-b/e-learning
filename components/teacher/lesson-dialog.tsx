"use client";

import React, { useState, useEffect } from "react";
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
import { createLesson, updateLesson } from "@/lib/action/courses.actions";

interface LessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  moduleTitle?: string;
  lessonToEdit?: {
    id: string;
    title: string;
    content: string | null;
    videoUrl: string | null;
    order: number;
  } | null;
  onSuccess: () => void;
}

export function LessonDialog({
  isOpen,
  onClose,
  moduleId,
  moduleTitle,
  lessonToEdit,
  onSuccess,
}: LessonDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lessonToEdit) {
      setTitle(lessonToEdit.title);
      setContent(lessonToEdit.content || "");
      setVideoUrl(lessonToEdit.videoUrl || "");
      setOrder(lessonToEdit.order);
    } else {
      setTitle("");
      setContent("");
      setVideoUrl("");
      setOrder("");
    }
  }, [lessonToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Veuillez remplir le titre de la leçon.");
      return;
    }

    setIsSubmitting(true);

    if (lessonToEdit) {
      const res = await updateLesson(lessonToEdit.id, {
        title,
        content: content.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        order: order !== "" ? Number(order) : undefined,
      });
      setIsSubmitting(false);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.error || "Échec de la modification.");
      }
    } else {
      const res = await createLesson({
        moduleId,
        title,
        content: content.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        order: order !== "" ? Number(order) : undefined,
      });
      setIsSubmitting(false);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.error || "Échec de la création.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{lessonToEdit ? "Modifier la Leçon" : "Créer une Leçon"}</DialogTitle>
          <DialogDescription>
            {moduleTitle ? `Module : ${moduleTitle}` : "Renseignez le contenu et le lien vidéo de la leçon."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Titre de la leçon *</Label>
            <Input
              id="lesson-title"
              placeholder="ex: Chapitre 1.1 : Les requêtes SQL de base"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-video">URL Vidéo (Youtube / MP4 - Optionnel)</Label>
            <Input
              id="lesson-video"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-content">Contenu textuel & explications</Label>
            <Textarea
              id="lesson-content"
              placeholder="Rédigez le texte du cours, les notions clés ou le résumé..."
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-order">Ordre d'affichage dans le module (Optionnel)</Label>
            <Input
              id="lesson-order"
              type="number"
              placeholder="ex: 1"
              value={order}
              onChange={(e) => setOrder(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Enregistrement..."
                : lessonToEdit
                ? "Mettre à jour"
                : "Créer la leçon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
