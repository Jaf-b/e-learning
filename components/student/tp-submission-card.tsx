"use client";

import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitTpAssignment } from "@/lib/action/student.actions";
import {
  Calendar,
  UploadCloud,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Lock,
  FileText,
  X,
  Paperclip,
} from "lucide-react";
import { isAssessmentAvailable } from "@/lib/utils";

interface QuestionOption {
  id: string;
  text: string;
  orderIndex: number;
}

interface Question {
  id: string;
  questionText: string;
  questionType: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
  points: number;
  orderIndex: number;
  options?: QuestionOption[];
}

interface TpSubmissionCardProps {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    type: "TP" | "ASSIGNMENT" | "QUIZ" | "EXAM" | "RETAKE_EXAM";
    maxScore: string;
    weight: string;
    dueDate: string | null;
    questions?: Question[];
    promotionCourse?: {
      course?: {
        title: string;
        code: string;
      };
    };
  };
  existingGrade?: {
    score: number | null;
    feedback: string | null;
    gradedAt: Date | string | null;
  } | null;
  existingResponseText?: string | null;
  existingFileUrl?: string | null;
}

export function TpSubmissionCard({
  assessment,
  existingGrade,
  existingResponseText = "",
  existingFileUrl = null,
}: TpSubmissionCardProps) {
  const questions = assessment.questions ?? [];
  const hasQuestions = questions.length > 0;

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (!hasQuestions) initial.global = existingResponseText || "";
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(!!existingGrade || !!existingResponseText);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(
    questions[0]?.id ?? null
  );

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(existingFileUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const avail = isAssessmentAvailable(assessment.dueDate);
  const isLockedForFuture = !isSubmitted && avail.isFuture;

  const handleAnswerChange = (questionId: string, value: string) => {
    if (isLockedForFuture) return;
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadedFileUrl(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "submission");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      setUploadProgress(90);
      const json = await res.json();
      if (json.success) {
        setUploadedFileUrl(json.url);
        setSelectedFile(null);
        setUploadProgress(100);
      } else {
        alert(json.error || "Echec du telechargement.");
      }
    } catch {
      alert("Echec du telechargement du fichier.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const buildSubmissionContent = () => {
    if (!hasQuestions) return answers["global"] || "";

    return questions
      .map((q, i) => {
        const answer = answers[q.id] || "";
        return `Question ${i + 1}: ${q.questionText}\nReponse: ${answer}`;
      })
      .join("\n\n---\n\n");
  };

  const handleSubmit = async () => {
    if (isLockedForFuture) return;

    const content = buildSubmissionContent();
    if (!content.trim() && !uploadedFileUrl) {
      alert("Veuillez rediger une reponse ou joindre un fichier avant d'envoyer.");
      return;
    }

    setIsSubmitting(true);
    const res = await submitTpAssignment({
      assessmentId: assessment.id,
      submissionContent: content,
      fileUrl: uploadedFileUrl ?? undefined,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsSubmitted(true);
    } else {
      alert(res.error || "Echec de l'envoi du TP.");
    }
  };

  const answeredCount = hasQuestions
    ? questions.filter((q) => (answers[q.id] || "").trim().length > 0).length
    : (answers["global"] || "").trim().length > 0
    ? 1
    : 0;


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Header Card ── */}
      <Card className="shadow-md border-t-4 border-t-blue-600">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-600">
                {assessment.type === "TP" ? "Travail Pratique" : "Devoir à Domicile"}
              </Badge>
              <Badge variant="outline">{assessment.maxScore} points</Badge>
              {hasQuestions && (
                <Badge variant="secondary">{questions.length} question{questions.length > 1 ? "s" : ""}</Badge>
              )}
            </div>

            {/* Date info & Lock status */}
            {avail.formattedDate && (
              <div
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                  isLockedForFuture
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                }`}
              >
                {isLockedForFuture ? <Lock className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                <span>
                  {isLockedForFuture
                    ? `Remise ouverte le : ${avail.formattedDate}`
                    : `Date prévue : ${avail.formattedDate}`}
                </span>
              </div>
            )}
          </div>

          <CardTitle className="text-2xl font-bold">{assessment.title}</CardTitle>
          {assessment.promotionCourse?.course && (
            <CardDescription className="font-medium text-blue-600">
              {assessment.promotionCourse.course.code} — {assessment.promotionCourse.course.title}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Lock Banner if future */}
          {isLockedForFuture && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-start gap-3 text-sm text-amber-900 dark:text-amber-200">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Remise du TP verrouillée</h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  Ce travail pratique est en cours de préparation. La remise des travaux sera automatiquement débloquée le{" "}
                  <strong>{avail.formattedDate}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          {assessment.description && (
            <div className="p-4 rounded-lg bg-muted/60 border text-sm space-y-1">
              <h4 className="font-semibold flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Consigne & Instructions
              </h4>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {assessment.description}
              </p>
            </div>
          )}

          {/* Grade result (if corrected) */}
          {existingGrade && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900 dark:text-blue-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Résultat de l&apos;évaluation
                </span>
                <Badge variant={existingGrade.score !== null ? "default" : "secondary"}>
                  {existingGrade.score !== null
                    ? `${existingGrade.score} / ${assessment.maxScore}`
                    : "En attente de correction"}
                </Badge>
              </div>
              {existingGrade.feedback && (
                <div className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2 pt-2 border-t border-blue-200/60">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Remarque de l&apos;enseignant : </span>
                    {existingGrade.feedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Questions Card ── */}
      {hasQuestions ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-blue-600" />
              Questions du TP
            </h2>
            <span className="text-xs text-muted-foreground">
              {answeredCount} / {questions.length} répondu{answeredCount > 1 ? "s" : ""}
            </span>
          </div>

          {questions.map((q, idx) => {
            const isExpanded = expandedQuestion === q.id;
            return (
              <Card
                key={q.id}
                className={`transition-all border ${
                  isExpanded ? "shadow-md border-blue-300 dark:border-blue-700" : "shadow-sm"
                }`}
              >
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm leading-snug">{q.questionText}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              {q.points} pt{q.points > 1 ? "s" : ""}
                            </Badge>
                            {(answers[q.id] || "").trim().length > 0 && (
                              <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Répondu
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      )}
                    </div>
                  </CardHeader>
                </button>

                {isExpanded && (
                  <CardContent className="pt-0 pb-4 space-y-3">
                    <div className="border-t pt-4">
                      <Textarea
                        placeholder={
                          isLockedForFuture
                            ? "La remise sera ouverte le jour prévu..."
                            : "Rédigez votre réponse développée ici..."
                        }
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        disabled={isLockedForFuture}
                        rows={5}
                        className="text-sm resize-y"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        /* No questions: free-form textarea submission */
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Votre travail</CardTitle>
            <CardDescription>
              Saisissez votre compte-rendu, réponses, ou collez le lien de votre dépôt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={
                isLockedForFuture
                  ? "Remise bloquée jusqu'à la date d'ouverture..."
                  : "Saisissez votre travail, collez votre code, ou un lien Google Drive / GitHub..."
              }
              value={answers["global"] || ""}
              onChange={(e) => handleAnswerChange("global", e.target.value)}
              disabled={isLockedForFuture}
              rows={10}
              className="resize-y text-sm font-mono"
            />
          </CardContent>
        </Card>
      )}

      {/* ── File Upload Card ── */}
      {!isLockedForFuture && (
        <Card className="shadow-sm border-dashed border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-blue-600" />
              Joindre un fichier (optionnel)
            </CardTitle>
            <CardDescription className="text-xs">
              Vous pouvez joindre un document PDF, Word, ZIP ou tout autre fichier illustrant votre travail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Already uploaded */}
            {uploadedFileUrl && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground">Fichier joint</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[220px]">
                      {uploadedFileUrl.split("/").pop()}
                    </div>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-rose-500 hover:text-rose-700 shrink-0"
                  onClick={() => { setUploadedFileUrl(null); setSelectedFile(null); }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {/* File selector */}
            {!uploadedFileUrl && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.rar,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {selectedFile ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-foreground bg-muted rounded-lg px-3 py-2 flex-1 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate font-mono">{selectedFile.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} Mo)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 shrink-0"
                      onClick={handleFileUpload}
                      disabled={isUploading}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      {isUploading ? `Envoi... ${uploadProgress}%` : "Téléverser"}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    Choisir un fichier
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Submit Footer ── */}
      <Card className="shadow-sm">
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {isLockedForFuture
              ? `🔒 Remise verrouillée — disponible le ${avail.formattedDate}`
              : isSubmitted
              ? "✅ TP soumis — vous pouvez modifier et re-soumettre votre travail."
              : "Envoi ouvert"}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLockedForFuture}
            className={`min-w-[180px] ${
              isLockedForFuture
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-65"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? (
              "Envoi en cours..."
            ) : isLockedForFuture ? (
              <>
                <Lock className="w-4 h-4 mr-2" /> Remise bloquée
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-2" />
                {isSubmitted ? "Mettre à jour le TP" : "Soumettre le TP"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
