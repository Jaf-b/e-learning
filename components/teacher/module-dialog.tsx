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
import { createModule, updateModule } from "@/lib/action/courses.actions";

interface ModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  moduleToEdit?: {
    id: string;
    title: string;
    order: number;
  } | null;
  onSuccess: () => void;
}

export function ModuleDialog({
  isOpen,
  onClose,
  courseId,
  moduleToEdit,
  onSuccess,
}: ModuleDialogProps) {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (moduleToEdit) {
      setTitle(moduleToEdit.title);
      setOrder(moduleToEdit.order);
    } else {
      setTitle("");
      setOrder("");
    }
  }, [moduleToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Veuillez remplir le titre du module.");
      return;
    }

    setIsSubmitting(true);

    if (moduleToEdit) {
      const res = await updateModule(moduleToEdit.id, {
        title,
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
      const res = await createModule({
        courseId,
        title,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{moduleToEdit ? "Modifier le Module" : "Créer un Module"}</DialogTitle>
          <DialogDescription>
            {moduleToEdit
              ? "Modifiez le titre et l'ordre d'affichage du module."
              : "Ajoutez un nouveau module de chapitre pour ce cours."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="module-title">Titre du module *</Label>
            <Input
              id="module-title"
              placeholder="ex: Module 1 : Introduction aux bases de données"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="module-order">Ordre d'affichage (Optionnel)</Label>
            <Input
              id="module-order"
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
                : moduleToEdit
                ? "Mettre à jour"
                : "Créer le module"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
