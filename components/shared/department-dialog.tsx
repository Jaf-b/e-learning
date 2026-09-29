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
  GitFork,
  Pencil,
  Plus,
  Landmark,
  Barcode,
  FileText,
  AlignLeft,
} from "lucide-react";

type Department = {
  id: string;
  facultyId: string;
  code: string;
  name: string;
  description: string | null;
};

type Faculty = {
  id: string;
  name: string;
  code?: string;
};

interface DepartmentDialogProps {
  department?: Department;
  defaultFacultyId?: string;
  faculties: Faculty[];
  onSave: (department: any) => any;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DepartmentDialog({
  department,
  defaultFacultyId,
  faculties,
  onSave,
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: DepartmentDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (!isControlled) setInternalOpen(newOpen);
  };

  const [facultyId, setFacultyId] = useState(
    department?.facultyId || defaultFacultyId || ""
  );
  const [code, setCode] = useState(department?.code || "");
  const [name, setName] = useState(department?.name || "");
  const [description, setDescription] = useState(department?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFacultyId(department?.facultyId || defaultFacultyId || "");
      setCode(department?.code || "");
      setName(department?.name || "");
      setDescription(department?.description || "");
    }
  }, [open, department, defaultFacultyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !facultyId) return;

    setIsSubmitting(true);
    try {
      const generatedCode =
        code.trim() !== ""
          ? code.trim().toUpperCase()
          : (department?.code || name.substring(0, 4).toUpperCase());

      const payload: any = {
        facultyId,
        code: generatedCode,
        name: name.trim(),
        description: description.trim() || null,
      };

      if (department?.id) {
        payload.id = department.id;
      }

      await onSave(payload);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!department;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button variant="outline" className="gap-2 text-xs font-semibold">
            <Plus className="w-4 h-4" />
            {isEditing ? "Modifier le Département" : "Ajouter un Département"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              {isEditing ? <Pencil className="w-5 h-5" /> : <GitFork className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEditing ? "Modifier le Département" : "Nouveau Département"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Modifier les informations du département "${department?.name}".`
                  : "Rattachez un nouveau département à une faculté existante."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Faculty selection */}
            <Field>
              <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-muted-foreground" />
                Faculté de rattachement <span className="text-rose-500">*</span>
              </FieldLabel>
              <Select onValueChange={(v) => v && setFacultyId(v)} value={facultyId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Sélectionner une faculté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {faculties.map((fac) => (
                      <SelectItem key={fac.id} value={fac.id}>
                        {fac.name} {fac.code ? `(${fac.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            {/* Code */}
            <Field>
              <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-muted-foreground" />
                Code du département
              </FieldLabel>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: INFO, MATH, BIO"
                className="text-xs uppercase font-mono"
              />
            </Field>

            {/* Name */}
            <Field>
              <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Nom du département <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Département de Mathématiques & Informatique"
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
                placeholder="Description sommaire du département..."
                className="text-xs min-h-[75px] resize-none"
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
              disabled={!name.trim() || !facultyId || isSubmitting}
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
                  Créer le département
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}