"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/shared/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TpSubmissionsList } from "@/components/teacher/tp-submissions-list";
import { getAllTeacherTpSubmissions } from "@/lib/action/courses.actions";
import { TpSubmissionRecord } from "@/lib/types";
import { FileCheck, FolderCode } from "lucide-react";

export default function SubmittedAssignmentsPage() {
  const [submissions, setSubmissions] = useState<(TpSubmissionRecord & { courseTitle?: string; courseCode?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubmissions = async () => {
    setLoading(true);
    const res = await getAllTeacherTpSubmissions();
    if (res.success && res.submissions) {
      setSubmissions(res.submissions);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <Header
        title="Devoirs & Travaux Pratiques Soumis"
        description="Consultez, téléchargez et évaluez les travaux pratiques remis par vos étudiants, classés par TP et par cours."
      />

      <Card className="border shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FolderCode className="w-5 h-5 text-blue-600" />
              Soumissions classées par TP
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Sélectionnez une catégorie de TP pour afficher les travaux correspondants et attribuer les notes.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4 py-4 animate-pulse">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-lg" />
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : (
            <TpSubmissionsList
              submissions={submissions}
              courseId=""
              onRefresh={loadSubmissions}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
