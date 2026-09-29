"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentAssessmentsByType } from "@/lib/action/student.actions";
import { Newspaper, CheckCircle2, Clock, ArrowRight, HelpCircle, Lock, Calendar } from "lucide-react";
import Link from "next/link";
import { isAssessmentAvailable } from "@/lib/utils";

export default function StudentQuizPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getStudentAssessmentsByType(["QUIZ"]);
      if (res.success && res.assessments) {
        setQuizzes(res.assessments);
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
        <h1 className="text-3xl font-bold tracking-tight">Quiz & Interrogations</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Répondez aux questions à choix unique et obtenez directement votre note enregistrée en base de données.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg">Aucun quiz disponible</h3>
          <p className="text-sm text-muted-foreground mt-1">Vous n'avez aucune interrogation programmée pour le moment.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const avail = isAssessmentAvailable(quiz.dueDate);

            return (
              <Card key={quiz.id} className="flex flex-col justify-between hover:shadow-md transition-shadow border-amber-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="default" className="bg-amber-600">
                      Interrogation
                    </Badge>
                    <Badge variant="outline">{quiz.maxScore} pts</Badge>
                  </div>
                  <CardTitle className="text-lg font-bold line-clamp-1">{quiz.title}</CardTitle>
                  <CardDescription className="text-xs font-medium text-amber-600">
                    {quiz.courseTitle}
                  </CardDescription>
                  {quiz.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{quiz.description}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs border-t pt-3">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {avail.formattedDate ? avail.formattedDate : `${quiz.questions?.length || 0} question(s)`}
                    </span>
                    {quiz.isSubmitted ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {quiz.gradeScore !== null ? `${quiz.gradeScore}/${quiz.maxScore}` : "Terminé"}
                      </Badge>
                    ) : avail.isFuture ? (
                      <Badge variant="outline" className="text-amber-600 bg-amber-50 dark:bg-amber-950/40">
                        <Lock className="w-3 h-3 mr-1" /> Programmé
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600">
                        <Clock className="w-3 h-3 mr-1" /> Ouvert
                      </Badge>
                    )}
                  </div>

                  {quiz.isSubmitted ? (
                    <Link href={`/student/assessment/${quiz.id}`}>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Voir le résultat <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  ) : avail.isFuture ? (
                    <Button disabled className="w-full opacity-65 cursor-not-allowed">
                      <Lock className="w-4 h-4 mr-1.5" /> Disponible le {avail.formattedDate}
                    </Button>
                  ) : (
                    <Link href={`/student/assessment/${quiz.id}`}>
                      <Button className="w-full bg-amber-600 hover:bg-amber-700">
                        Passer l'interro <ArrowRight className="w-4 h-4 ml-1" />
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
