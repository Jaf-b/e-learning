"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createModule } from "@/lib/action/courses.actions";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export default function CreateModulePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [title, setTitle] = useState("");
  const [order, setOrder] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Veuillez entrer un titre pour le module.");
      return;
    }

    setIsSubmitting(true);
    const res = await createModule({
      courseId,
      title,
      order: order !== "" ? Number(order) : undefined,
    });
    setIsSubmitting(false);

    if (res.success) {
      router.push(`/teacher/courses/${courseId}`);
    } else {
      alert(res.error || "Échec de la création du module.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <Link
        href={`/teacher/courses/${courseId}`}
        className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Retour au cours
      </Link>

      <Card className="shadow-md">
        <CardHeader>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <CardTitle className="text-2xl font-bold">Nouveau Module de Cours</CardTitle>
          <CardDescription>
            Créez un nouveau chapitre ou module pour organiser vos leçons et supports d'apprentissage.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du Module *</Label>
              <Input
                id="title"
                placeholder="ex: Module 1 : Introduction à l'architecture logicielle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Ordre d'affichage (Optionnel)</Label>
              <Input
                id="order"
                type="number"
                placeholder="ex: 1"
                value={order}
                onChange={(e) => setOrder(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/teacher/courses/${courseId}`)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création en cours..." : "Créer le module"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
