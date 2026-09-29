"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStudentAssessmentDetails } from "@/lib/action/student.actions";
import { AssessmentTakingCard } from "@/components/student/assessment-taking-card";
import { TpSubmissionCard } from "@/components/student/tp-submission-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Lock, Calendar } from "lucide-react";
import Link from "next/link";
import { isAssessmentAvailable } from "@/lib/utils";

export default function StudentAssessmentPage() {
  const params = useParams();
  const assessmentId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessment() {
      if (!assessmentId) return;
      const res = await getStudentAssessmentDetails(assessmentId);
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    }
    loadAssessment();
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto animate-pulse">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!data || !data.assessment) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-rose-500 mb-2">Évaluation introuvable</h2>
        <p className="text-muted-foreground mb-4">Cette épreuve n'existe pas ou n'est pas accessible.</p>
        <Link href="/student">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au tableau de bord
          </Button>
        </Link>
      </div>
    );
  }

  const { assessment, existingGrade, existingResponses } = data;
  const isTp = assessment.type === "TP" || assessment.type === "ASSIGNMENT";
  const courseId = assessment.promotionCourse?.courseId;

  // Verification de la date de disponibilité de l'épreuve
  const avail = isAssessmentAvailable(assessment.dueDate);
  const isLockedForFuture = !existingGrade && avail.isFuture;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <Link
          href={courseId ? `/student/courses/${courseId}` : "/student"}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />{" "}
          {courseId ? "Retour au cours" : "Retour au tableau de bord"}
        </Link>
      </div>

      {isLockedForFuture ? (
        <Card className="p-8 text-center max-w-xl mx-auto border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20">
          <CardHeader>
            <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Épreuve non ouverte
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Cette évaluation est programmée pour le{" "}
              <span className="font-semibold text-foreground">{avail.formattedDate}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              L'examen ouvrira automatiquement le jour prévu. Veuillez vous reconnecter à la date indiquée pour composer.
            </p>
            <Link href="/student">
              <Button variant="outline" className="mt-2">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour à mes cours
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : isTp ? (
        <TpSubmissionCard
          assessment={assessment}
          existingGrade={existingGrade}
          existingResponseText={existingResponses[0]?.textAnswer}
        />
      ) : (
        <AssessmentTakingCard
          assessment={assessment}
          existingGrade={existingGrade}
          existingResponses={existingResponses}
        />
      )}
    </div>
  );
}
