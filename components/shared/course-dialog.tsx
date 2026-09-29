"use client";

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  BookOpen,
  Pencil,
  Plus,
  GraduationCap,
  Layers,
  User,
  Award,
  FileText,
  AlignLeft,
  Barcode,
} from "lucide-react";

type Course = {
  id: string;
  filiereId: string;
  degreeLevelId: string;
  code: string;
  title: string;
  description: string | null;
  credits: number;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
  authorId: string;
  rejectionReason: string | null;
};

type Filiere = {
  id: string;
  name: string;
};

type DegreeLevel = {
  id: string;
  name: string;
};

type UserType = {
  id: string;
  name: string;
};

interface CourseDialogProps {
  course?: Course;
  filieres: Filiere[];
  degreeLevels: DegreeLevel[];
  authors: UserType[];
  onSave: (course: any) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CourseDialog({
  course,
  filieres,
  degreeLevels,
  authors,
  onSave,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CourseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (!isControlled) setInternalOpen(newOpen);
  };

  const [code, setCode] = useState(course?.code || "");
  const [filiereId, setFiliereId] = useState(course?.filiereId || "");
  const [degreeLevelId, setDegreeLevelId] = useState(course?.degreeLevelId || "");
  const [title, setTitle] = useState(course?.title || "");
  const [description, setDescription] = useState(course?.description || "");
  const [credits, setCredits] = useState(course?.credits || 0);
  const [authorId, setAuthorId] = useState(course?.authorId || "");
  const [status, setStatus] = useState(course?.status || "DRAFT");
  const [rejectionReason, setRejectionReason] = useState(course?.rejectionReason || "");

  // Reset form when course prop changes or dialog opens
  useEffect(() => {
    if (open) {
      setCode(course?.code || "");
      setFiliereId(course?.filiereId || "");
      setDegreeLevelId(course?.degreeLevelId || "");
      setTitle(course?.title || "");
      setDescription(course?.description || "");
      setCredits(course?.credits || 0);
      setAuthorId(course?.authorId || "");
      setStatus(course?.status || "DRAFT");
      setRejectionReason(course?.rejectionReason || "");
    }
  }, [open, course]);

  const handleSave = () => {
    const finalCode =
      code.trim() !== ""
        ? code.trim().toUpperCase()
        : (course?.code || title.substring(0, 4).toUpperCase() || "CRS");

    const payload: any = {
      filiereId,
      degreeLevelId,
      code: finalCode,
      title: title.trim(),
      description: description.trim() || null,
      credits: Number(credits) || 0,
      authorId,
      rejectionReason: rejectionReason.trim() || null,
      status,
    };
    if (course?.id) {
      payload.id = course.id;
    }
    onSave(payload);
    setOpen(false);
  };

  const isEditing = !!course;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 text-xs font-semibold">
            <Plus className="w-4 h-4" />
            {isEditing ? "Modifier le cours" : "Ajouter un Cours"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              {isEditing ? <Pencil className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEditing ? "Modifier le cours" : "Nouveau Cours"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Modifier les informations du cours "${course?.title}".`
                  : "Remplissez les informations pour créer un nouveau cours."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* ── Informations du Cours ── */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="w-4 h-px bg-border" />
              Informations du Cours
              <span className="flex-1 h-px bg-border" />
            </h4>

            {/* Code + Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field className="sm:col-span-1">
                <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-muted-foreground" />
                  Code
                </FieldLabel>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: INF-301"
                  className="text-xs uppercase font-mono"
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Titre du cours
                </FieldLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Introduction à l'algorithmique"
                  className="text-xs"
                />
              </Field>
            </div>

            {/* Description */}
            <Field>
              <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
                Description
              </FieldLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez brièvement le contenu du cours..."
                className="text-xs min-h-[72px] resize-none"
              />
            </Field>

            {/* Credits + Status — 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-muted-foreground" />
                  Crédits
                </FieldLabel>
                <Input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="text-xs"
                  min={0}
                />
              </Field>

              <Field>
                <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                  Statut
                </FieldLabel>
                <Select onValueChange={(v) => v && setStatus(v as any)} value={status}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="DRAFT">Brouillon</SelectItem>
                      <SelectItem value="PUBLISHED">Publié</SelectItem>
                      <SelectItem value="PENDING_REVIEW">En révision</SelectItem>
                      <SelectItem value="REJECTED">Rejeté</SelectItem>
                      <SelectItem value="ARCHIVED">Archivé</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* ── Rattachement Académique ── */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="w-4 h-px bg-border" />
              Rattachement Académique
              <span className="flex-1 h-px bg-border" />
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filiere */}
              <Field>
                <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                  Filière
                </FieldLabel>
                <Select onValueChange={(v) => v && setFiliereId(v)} value={filiereId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Choisir une filière" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {filieres.map((filiere) => (
                        <SelectItem key={filiere.id} value={filiere.id}>
                          {filiere.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {/* Degree Level */}
              <Field>
                <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                  Niveau
                </FieldLabel>
                <Select onValueChange={(v) => v && setDegreeLevelId(v)} value={degreeLevelId}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Choisir un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {degreeLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Author */}
            <Field>
              <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Auteur / Enseignant
              </FieldLabel>
              <Select onValueChange={(v) => v && setAuthorId(v)} value={authorId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Choisir un auteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Rejection reason (only when REJECTED) */}
          {status === "REJECTED" && (
            <div className="space-y-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 flex items-center gap-2">
                <span className="w-4 h-px bg-rose-300" />
                Motif de Rejet
                <span className="flex-1 h-px bg-rose-300" />
              </h4>
              <Field>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Indiquer la raison du rejet..."
                  className="text-xs min-h-[60px] resize-none"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/30 shrink-0">
          <DialogClose
            render={<Button variant="outline" size="sm" className="text-xs" />}
          >
            Annuler
          </DialogClose>
          <Button
            size="sm"
            className="text-xs gap-1.5"
            onClick={handleSave}
            disabled={!title.trim() || !filiereId || !degreeLevelId || !authorId}
          >
            {isEditing ? (
              <>
                <Pencil className="w-3.5 h-3.5" />
                Enregistrer les modifications
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Créer le cours
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}