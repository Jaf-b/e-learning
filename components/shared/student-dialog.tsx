"use client"

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GraduationCap, UserCheck, Layers, Loader2 } from "lucide-react";

type Student = {
  id: string;
  name: string;
};

type Promotion = {
  id: string;
  code: string;
};

interface StudentDialogProps {
  student?: Student;
  promotions: Promotion[];
  onSave: (enrollment: { studentId: string; promotionId: string }) => Promise<void> | void;
}

export default function StudentDialog({ student, promotions, onSave }: StudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = React.useState(student?.id || "");
  const [promotionId, setPromotionId] = React.useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!studentId || !promotionId) return;
    setSubmitting(true);
    try {
      await onSave({ studentId, promotionId });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = !!student;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-xs font-semibold">
          <UserCheck className="w-4 h-4" />
          {isEditing ? "Modifier l'inscription" : "Inscrire un Étudiant"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEditing ? "Modifier l'inscription" : "Inscription Étudiant"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Modifiez la promotion de cet étudiant."
                  : "Associez un étudiant existant à une promotion."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Student name (read-only when editing) */}
          <Field>
            <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
              Étudiant
            </FieldLabel>
            {isEditing ? (
              <Input value={student?.name || ""} readOnly className="text-xs bg-muted/40" />
            ) : (
              <Input
                placeholder="ID de l'étudiant"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="text-xs"
              />
            )}
          </Field>

          {/* Promotion Select */}
          <Field>
            <FieldLabel className="text-xs font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              Promotion
            </FieldLabel>
            <Select onValueChange={(v) => v && setPromotionId(v)} value={promotionId}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Sélectionner une promotion" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {promotions.map((promotion) => (
                    <SelectItem key={promotion.id} value={promotion.id}>
                      {promotion.code}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/30">
          <DialogClose
            render={
              <Button variant="outline" size="sm" className="text-xs" />
            }
          >
            Annuler
          </DialogClose>
          <Button
            size="sm"
            className="text-xs gap-1.5"
            onClick={handleSave}
            disabled={!studentId || !promotionId || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {isEditing ? "Enregistrement..." : "Inscription en cours..."}
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5" />
                {isEditing ? "Enregistrer" : "Inscrire l'étudiant"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}