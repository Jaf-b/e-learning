"use client";

import React, { useState, useEffect } from "react";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Landmark, Pencil, Plus, Barcode, FileText, AlignLeft } from "lucide-react";

type Faculty = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

interface FacultyDialogProps {
  faculty?: Faculty;
  onSave: (faculty: any) => any;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FacultyDialog({
  faculty,
  onSave,
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: FacultyDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (!isControlled) setInternalOpen(newOpen);
  };

  const [code, setCode] = useState(faculty?.code || "");
  const [name, setName] = useState(faculty?.name || "");
  const [description, setDescription] = useState(faculty?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCode(faculty?.code || "");
      setName(faculty?.name || "");
      setDescription(faculty?.description || "");
    }
  }, [open, faculty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const generatedCode =
        code.trim() !== ""
          ? code.trim().toUpperCase()
          : (faculty?.code || name.substring(0, 4).toUpperCase());

      const payload: any = {
        code: generatedCode,
        name: name.trim(),
        description: description.trim() || null,
      };

      if (faculty?.id) {
        payload.id = faculty.id;
      }

      await onSave(payload);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!faculty;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button className="gap-2 text-xs font-semibold">
            <Plus className="w-4 h-4" />
            {isEditing ? "Modifier la Faculté" : "Ajouter une Faculté"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              {isEditing ? <Pencil className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEditing ? "Modifier la Faculté" : "Nouvelle Faculté"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Modifier les informations de la faculté "${faculty?.name}".`
                  : "Renseignez les détails pour ajouter une nouvelle faculté."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Code */}
            <Field>
              <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-muted-foreground" />
                Code de la faculté
              </FieldLabel>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: FST, FSEG, FLSH"
                className="text-xs uppercase font-mono"
              />
              <span className="text-[11px] text-muted-foreground">
                Si laissé vide, le code sera généré automatiquement à partir du nom.
              </span>
            </Field>

            {/* Name */}
            <Field>
              <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Nom de la faculté <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Faculté des Sciences et Technologies"
                className="text-xs"
                required
              />
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
                Description
              </FieldLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description des filières, missions et domaines d'enseignement..."
                className="text-xs min-h-[80px] resize-none"
              />
            </Field>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/30 shrink-0">
            <DialogClose
              render={<Button variant="outline" size="sm" type="button" className="text-xs" />}
            >
              Annuler
            </DialogClose>
            <Button
              size="sm"
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="text-xs gap-1.5 font-semibold"
            >
              {isEditing ? (
                <>
                  <Pencil className="w-3.5 h-3.5" />
                  Enregistrer les modifications
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Créer la faculté
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}