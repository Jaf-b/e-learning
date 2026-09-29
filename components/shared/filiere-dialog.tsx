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
  GraduationCap,
  Pencil,
  Plus,
  GitFork,
  Barcode,
  FileText,
  AlignLeft,
} from "lucide-react";

type Filiere = {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  description: string | null;
};

type Department = {
  id: string;
  name: string;
  code?: string;
};

interface FiliereDialogProps {
  filiere?: Filiere;
  defaultDepartmentId?: string;
  departments: Department[];
  onSave: (filiere: any) => any;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function FiliereDialog({
  filiere,
  defaultDepartmentId,
  departments,
  onSave,
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: FiliereDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    if (!isControlled) setInternalOpen(newOpen);
  };

  const [departmentId, setDepartmentId] = useState(
    filiere?.departmentId || defaultDepartmentId || ""
  );
  const [code, setCode] = useState(filiere?.code || "");
  const [name, setName] = useState(filiere?.name || "");
  const [description, setDescription] = useState(filiere?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDepartmentId(filiere?.departmentId || defaultDepartmentId || "");
      setCode(filiere?.code || "");
      setName(filiere?.name || "");
      setDescription(filiere?.description || "");
    }
  }, [open, filiere, defaultDepartmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !departmentId) return;

    setIsSubmitting(true);
    try {
      const generatedCode =
        code.trim() !== ""
          ? code.trim().toUpperCase()
          : (filiere?.code || name.substring(0, 4).toUpperCase());

      const payload: any = {
        departmentId,
        code: generatedCode,
        name: name.trim(),
        description: description.trim() || null,
      };

      if (filiere?.id) {
        payload.id = filiere.id;
      }

      await onSave(payload);
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!filiere;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || children || (
          <Button variant="outline" className="gap-2 text-xs font-semibold">
            <Plus className="w-4 h-4" />
            {isEditing ? "Modifier la Filière" : "Ajouter une Filière"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              {isEditing ? <Pencil className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEditing ? "Modifier la Filière" : "Nouvelle Filière"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Modifier les informations de la filière "${filiere?.name}".`
                  : "Créez une filière de formation rattachée à un département."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Department selection */}
            <Field>
              <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-muted-foreground" />
                Département de rattachement <span className="text-rose-500">*</span>
              </FieldLabel>
              <Select onValueChange={(v) => v && setDepartmentId(v)} value={departmentId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Sélectionner un département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} {dept.code ? `(${dept.code})` : ""}
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
                Code de la filière
              </FieldLabel>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: GL, SI, RES, DA"
                className="text-xs uppercase font-mono"
              />
            </Field>

            {/* Name */}
            <Field>
              <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                Nom de la filière <span className="text-rose-500">*</span>
              </FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Génie Logiciel & Systèmes d'Information"
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
                placeholder="Objectifs pédagogiques, débouchés professionnels..."
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
              disabled={!name.trim() || !departmentId || isSubmitting}
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
                  Créer la filière
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}