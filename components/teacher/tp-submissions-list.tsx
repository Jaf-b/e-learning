"use client";

import React, { useState, useMemo } from "react";
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
  Layers,
  Filter,
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
      alert("La note doit être comprise entre 0 et " + sub.maxScore + ".");
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
      alert(res.error || "Erreur lors de l'enregistrement.");
    }
  };

  const initials = sub.studentName
    ? sub.studentName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "ET";

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
        className="flex items-center justify-between p-4 cursor-pointer gap-4 flex-wrap hover:bg-muted/30 transition-colors rounded-xl"
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
          <span className="text-xs text-muted-foreground font-medium max-w-[200px] truncate">
            {sub.assessmentTitle}
          </span>

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
                  <span>Télécharger</span>
                </a>
              </div>
            )}

            {sub.textAnswer ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  Réponse de l&apos;étudiant
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
                    placeholder="Excellent travail ! / À revoir..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                {saved && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Note enregistrée
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
                  {saving ? "Enregistrement..." : sub.isGraded ? "Mettre à jour la note" : "Valider la note"}
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
  // Catégorie TP sélectionnée ("all" ou l'id spécifique du TP)
  const [selectedTpId, setSelectedTpId] = useState<string>("all");
  // Filtre par statut ("all", "pending", "graded")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "graded">("all");
  // Toggle vue groupée ou vue à plat
  const [collapsedTps, setCollapsedTps] = useState<Record<string, boolean>>({});

  // 1. Extraire et catégoriser les TP uniques
  const tpCategories = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        title: string;
        type: string;
        maxScore: number;
        total: number;
        pending: number;
        graded: number;
      }
    >();

    submissions.forEach((sub) => {
      const existing = map.get(sub.assessmentId);
      if (!existing) {
        map.set(sub.assessmentId, {
          id: sub.assessmentId,
          title: sub.assessmentTitle,
          type: sub.assessmentType,
          maxScore: sub.maxScore,
          total: 1,
          pending: sub.isGraded ? 0 : 1,
          graded: sub.isGraded ? 1 : 0,
        });
      } else {
        existing.total += 1;
        if (sub.isGraded) existing.graded += 1;
        else existing.pending += 1;
      }
    });

    return Array.from(map.values());
  }, [submissions]);

  // 2. Filtrage des soumissions selon le TP et le statut
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchesTp = selectedTpId === "all" || s.assessmentId === selectedTpId;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
          ? !s.isGraded
          : s.isGraded;
      return matchesTp && matchesStatus;
    });
  }, [submissions, selectedTpId, statusFilter]);

  // 3. Regroupement par TP pour la vue catégorisée
  const groupedByTp = useMemo(() => {
    const groups: {
      category: {
        id: string;
        title: string;
        type: string;
        maxScore: number;
        total: number;
        pending: number;
        graded: number;
      };
      items: TpSubmissionRecord[];
    }[] = [];

    tpCategories.forEach((cat) => {
      if (selectedTpId !== "all" && cat.id !== selectedTpId) return;

      const items = submissions.filter((s) => {
        if (s.assessmentId !== cat.id) return false;
        if (statusFilter === "pending") return !s.isGraded;
        if (statusFilter === "graded") return s.isGraded;
        return true;
      });

      if (items.length > 0 || selectedTpId === cat.id) {
        groups.push({ category: cat, items });
      }
    });

    return groups;
  }, [tpCategories, submissions, selectedTpId, statusFilter]);

  const toggleTpCollapse = (tpId: string) => {
    setCollapsedTps((prev) => ({ ...prev, [tpId]: !prev[tpId] }));
  };

  const totalPending = submissions.filter((s) => !s.isGraded).length;
  const totalGraded = submissions.filter((s) => s.isGraded).length;

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <Inbox className="w-12 h-12 mb-3 opacity-40" />
        <h3 className="text-base font-semibold text-foreground">Aucune soumission de TP</h3>
        <p className="text-sm mt-1 max-w-xs">
          Les travaux pratiques et devoirs soumis par vos étudiants apparaîtront ici pour correction et notation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 1. BARRE DE SÉLECTION DE CATÉGORIE PAR TP ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Catégorie par Travail Pratique ({tpCategories.length} TP répertorié{tpCategories.length > 1 ? "s" : ""})
          </span>
          {selectedTpId !== "all" && (
            <button
              onClick={() => setSelectedTpId("all")}
              className="text-primary hover:underline lowercase font-normal"
            >
              Afficher tous les TP
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <Button
            size="sm"
            variant={selectedTpId === "all" ? "default" : "outline"}
            className="text-xs h-8 shrink-0 font-medium"
            onClick={() => setSelectedTpId("all")}
          >
            Tous les TP ({submissions.length})
          </Button>

          {tpCategories.map((cat) => {
            const isSelected = selectedTpId === cat.id;
            return (
              <Button
                key={cat.id}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                className={`text-xs h-8 shrink-0 gap-1.5 font-medium ${
                  isSelected ? "" : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedTpId(cat.id)}
              >
                <FolderCode className="w-3.5 h-3.5 text-blue-500" />
                <span className="max-w-[160px] truncate">{cat.title}</span>
                <Badge
                  variant={isSelected ? "secondary" : "outline"}
                  className="text-[10px] px-1.5 py-0 h-4 ml-1"
                >
                  {cat.total}
                </Badge>
                {cat.pending > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" title={`${cat.pending} en attente`} />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* ── 2. FILTRES DE STATUT ── */}
      <div className="flex items-center justify-between gap-3 border-y py-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Statut :</span>
          <Button
            size="sm"
            variant={statusFilter === "all" ? "secondary" : "ghost"}
            className="text-xs h-7 px-2.5"
            onClick={() => setStatusFilter("all")}
          >
            Tous ({selectedTpId === "all" ? submissions.length : filteredSubmissions.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "pending" ? "secondary" : "ghost"}
            className="text-xs h-7 px-2.5 gap-1 text-amber-600"
            onClick={() => setStatusFilter("pending")}
          >
            <Clock className="w-3 h-3" />
            En attente ({totalPending})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "graded" ? "secondary" : "ghost"}
            className="text-xs h-7 px-2.5 gap-1 text-emerald-600"
            onClick={() => setStatusFilter("graded")}
          >
            <CheckCircle2 className="w-3 h-3" />
            Notés ({totalGraded})
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          {filteredSubmissions.length} résultat{filteredSubmissions.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* ── 3. LISTE DES SOUMISSIONS GROUPÉES PAR CATÉGORIE DE TP ── */}
      {groupedByTp.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground border border-dashed rounded-xl">
          <FolderCode className="w-10 h-10 mx-auto mb-2 opacity-40 text-blue-500" />
          <p className="font-semibold text-foreground">Aucune soumission pour ce filtre</p>
          <p className="text-xs mt-1">Essayez de sélectionner un autre statut ou affichez tous les TP.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByTp.map(({ category, items }) => {
            const isCollapsed = Boolean(collapsedTps[category.id]);
            return (
              <Card key={category.id} className="border shadow-xs overflow-hidden">
                {/* En-tête de catégorie TP */}
                <div
                  className="p-4 bg-muted/30 border-b flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleTpCollapse(category.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FolderCode className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] bg-blue-50/50 text-blue-700 dark:text-blue-300">
                          {category.type === "TP" ? "Travail Pratique" : "Devoir"}
                        </Badge>
                        <h3 className="font-bold text-sm text-foreground truncate">
                          {category.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Barème : {category.maxScore} pts • {category.total} soumission{category.total > 1 ? "s" : ""} au total
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {category.pending > 0 && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50/50 text-xs gap-1">
                        <Clock className="w-3 h-3" />
                        {category.pending} en attente
                      </Badge>
                    )}
                    {category.graded > 0 && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50/50 text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {category.graded} noté{category.graded > 1 ? "s" : ""}
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Corps avec les soumissions de ce TP */}
                {!isCollapsed && (
                  <CardContent className="p-4 space-y-3">
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center italic">
                        Aucune soumission ne correspond aux filtres pour ce TP.
                      </p>
                    ) : (
                      items.map((sub) => (
                        <SubmissionCard
                          key={sub.id}
                          sub={sub}
                          courseId={courseId}
                          onRefresh={onRefresh}
                        />
                      ))
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}