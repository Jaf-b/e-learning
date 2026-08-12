"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentAssessmentsByType } from "@/lib/action/student.actions";
import { FileCheckCorner, Calendar, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StudentAssignementPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getStudentAssessmentsByType(["TP", "ASSIGNMENT"]);
      if (res.success && res.assessments) {
        setAssessments(res.assessments);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="border-b pb-6 space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mes TPs & Devoirs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Retrouvez la liste de tous vos travaux pratiques et devoirs à soumettre pour vos cours.
        </p>
      </div>

      {assessments.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <FileCheckCorner className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg">Aucun TP programmé</h3>
          <p className="text-sm text-muted-foreground mt-1">Vous n'avez aucun travail pratique en attente.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((tp) => (
            <Card key={tp.id} className="flex flex-col justify-between hover:shadow-md transition-shadow border-blue-500/20">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="default" className="bg-blue-600">
                    {tp.type === "TP" ? "Travail Pratique" : "Devoir"}
                  </Badge>
                  <Badge variant="outline">{tp.maxScore} pts</Badge>
                </div>
                <CardTitle className="text-lg font-bold line-clamp-1">{tp.title}</CardTitle>
                <CardDescription className="text-xs font-medium text-blue-600">
                  {tp.courseTitle}
                </CardDescription>
                {tp.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{tp.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-xs border-t pt-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{tp.dueDate ? new Date(tp.dueDate).toLocaleDateString("fr-FR") : "Pas de date limite"}</span>
                  </div>
                  {tp.isSubmitted ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {tp.gradeScore !== null ? `${tp.gradeScore}/${tp.maxScore}` : "Soumis"}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600">
                      <Clock className="w-3 h-3 mr-1" /> En attente
                    </Badge>
                  )}
                </div>

                <Link href={`/student/assessment/${tp.id}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    {tp.isSubmitted ? "Voir la soumission" : "Envoyer le TP"} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
