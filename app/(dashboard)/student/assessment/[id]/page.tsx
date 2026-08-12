"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStudentAssessmentDetails } from "@/lib/action/student.actions";
import { AssessmentTakingCard } from "@/components/student/assessment-taking-card";
import { TpSubmissionCard } from "@/components/student/tp-submission-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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

      {isTp ? (
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
