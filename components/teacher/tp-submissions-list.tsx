"use client";

import React, { useState } from "react";
import { TpSubmissionRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { gradeSubmission } from "@/lib/action/courses.actions";
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
  ClipboardList,
  AlertCircle,
  Inbox,
  FolderCode,
} from "lucide-react";

interface TpSubmissionsListProps {
  submissions: TpSubmissionRecord[];
  courseId: string;
  onRefresh: () => void;
}

function SubmissionCard({
  sub,
  courseId,
  onRefresh,
}: {
  sub: TpSubmissionRecord;
  courseId: string;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [score, setScore] = useState<string>(sub.score !== null ? String(sub.score) : "");
  const [feedback, setFeedback] = useState<string>(sub.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > sub.maxScore) {
      alert("La note doit etre comprise entre 0 et " + sub.maxScore + ".");
      return;
    }
    setSaving(true);
    const res = await gradeSubmission({
      gradeId: sub.gradeId!,
      score: numScore,
      feedback: feedback || undefined,
      courseId,
    });
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onRefresh();
    } else {
      alert(res.error || "Erreur lors de l enregistrement.");
    }
  };

  const initials = sub.studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const submittedDate = sub.submittedAt
    ? new Date(sub.submittedAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <div className={`rounded-xl border bg-card transition-all ${expanded ? "shadow-md" : "shadow-xs"}`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer gap-4 flex-wrap"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarImage src={sub.studentImage ?? ""} alt={sub.studentName} />
            <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{sub.studentName}</div>
            <div className="text-[11px] text-muted-foreground truncate">{sub.studentEmail}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Badge variant="secondary" className="text-xs">
            {sub.assessmentType === "TP" ? "TP" : "Devoir"}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">{sub.assessmentTitle}</span>

          {sub.isGraded ? (
            <Badge className="bg-emerald-600 text-white text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {sub.score} / {sub.maxScore}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-400 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              En attente
            </Badge>
          )}

          {sub.fileUrl && (
            <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs gap-1">
              <FileText className="w-3 h-3" />
              Fichier joint
            </Badge>
          )}

          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t">
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Soumis le {submittedDate}</span>
            </div>

            {sub.fileUrl && (
              <div className="p-3.5 rounded-xl border bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-700 dark:text-blue-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-foreground">Fichier soumis</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[220px]">
                      {sub.fileUrl.split("/").pop()}
                    </div>
                  </div>
                </div>
                <a
                  href={sub.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Telecharger</span>
                </a>
              </div>
            )}

            {sub.textAnswer ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Reponse de l etudiant
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border text-xs leading-relaxed whitespace-pre-wrap font-mono max-h-[280px] overflow-y-auto">
                  {sub.textAnswer}
                </div>
              </div>
            ) : !sub.fileUrl ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground border border-dashed rounded-lg p-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Aucun contenu textuel soumis.</span>
              </div>
            ) : null}

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Star className="w-4 h-4 text-amber-500" />
                Notation
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Note (/ {sub.maxScore} pts)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={sub.maxScore}
                    step={0.5}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder={"0 - " + sub.maxScore}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Commentaire (optionnel)
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Excellent travail ! / A revoir la partie..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                {saved && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Note enregistree
                  </span>
                )}
                <Button
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  disabled={saving}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {saving ? "Enregistrement..." : sub.isGraded ? "Mettre a jour la note" : "Valider la note"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TpSubmissionsList({ submissions, courseId, onRefresh }: TpSubmissionsListProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "graded">("all");

  const filtered = submissions.filter((s) => {
    if (filter === "pending") return !s.isGraded;
    if (filter === "graded") return s.isGraded;
    return true;
  });

  const pendingCount = submissions.filter((s) => !s.isGraded).length;
  const gradedCount = submissions.filter((s) => s.isGraded).length;

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <Inbox className="w-12 h-12 mb-3 opacity-40" />
        <h3 className="text-base font-semibold text-foreground">Aucune soumission TP</h3>
        <p className="text-sm mt-1 max-w-xs">
          Les travaux pratiques soumis par les etudiants apparaitront ici pour correction et notation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} className="text-xs h-8" onClick={() => setFilter("all")}>
          Tous ({submissions.length})
        </Button>
        <Button size="sm" variant={filter === "pending" ? "default" : "outline"} className="text-xs h-8 gap-1.5" onClick={() => setFilter("pending")}>
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          En attente ({pendingCount})
        </Button>
        <Button size="sm" variant={filter === "graded" ? "default" : "outline"} className="text-xs h-8 gap-1.5" onClick={() => setFilter("graded")}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Notes ({gradedCount})
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
            Aucune soumission dans cette categorie.
          </div>
        ) : (
          filtered.map((sub) => (
            <SubmissionCard key={sub.id} sub={sub} courseId={courseId} onRefresh={onRefresh} />
          ))
        )}
      </div>
    </div>
  );
}