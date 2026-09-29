"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentAssessmentsByType } from "@/lib/action/student.actions";
import { GraduationCap, CheckCircle2, Clock, ArrowRight, Calendar, Lock } from "lucide-react";
import Link from "next/link";
import { isAssessmentAvailable } from "@/lib/utils";

export default function StudentExamPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getStudentAssessmentsByType(["EXAM", "RETAKE_EXAM"]);
      if (res.success && res.assessments) {
        setExams(res.assessments);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="border-b pb-6 space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
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
        <h1 className="text-3xl font-bold tracking-tight">Examens</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Passez vos examens de session et de rattrapage le jour de l'épreuve. Vos notes sont enregistrées directement en base de données.
        </p>
      </div>

      {exams.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg">Aucun examen programmé</h3>
          <p className="text-sm text-muted-foreground mt-1">Vous n'avez aucun examen à passer pour le moment.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const avail = isAssessmentAvailable(exam.dueDate);

            return (
              <Card key={exam.id} className="flex flex-col justify-between hover:shadow-md transition-shadow border-rose-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="destructive">
                      {exam.type === "EXAM" ? "Examen Final" : "Rattrapage"}
                    </Badge>
                    <Badge variant="outline">{exam.maxScore} pts</Badge>
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1">{exam.title}</CardTitle>
                  <CardDescription className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {exam.courseTitle}
                  </CardDescription>
                  {exam.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{exam.description}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs border-t pt-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {avail.formattedDate ? avail.formattedDate : "Disponible immédiatement"}
                    </span>
                    {exam.isSubmitted ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {exam.gradeScore !== null ? `${exam.gradeScore}/${exam.maxScore}` : "Terminé"}
                      </Badge>
                    ) : avail.isFuture ? (
                      <Badge variant="outline" className="text-amber-600 bg-amber-50 dark:bg-amber-950/40">
                        <Lock className="w-3 h-3 mr-1" /> Programmé
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-rose-600 bg-rose-50 dark:bg-rose-950/40">
                        <Clock className="w-3 h-3 mr-1" /> Ouvert aujourd'hui
                      </Badge>
                    )}
                  </div>

                  {exam.isSubmitted ? (
                    <Link href={`/student/assessment/${exam.id}`}>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Consulter le résultat <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  ) : avail.isFuture ? (
                    <Button disabled className="w-full opacity-65 cursor-not-allowed">
                      <Lock className="w-4 h-4 mr-1.5" /> Ouvert le {avail.formattedDate}
                    </Button>
                  ) : (
                    <Link href={`/student/assessment/${exam.id}`}>
                      <Button className="w-full bg-rose-600 hover:bg-rose-700">
                        Composer l'examen <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
