"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitAssessmentAnswers } from "@/lib/action/student.actions";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Award,
  Send,
  Clock,
  Timer,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useSecureExam } from "@/hooks/use-secure-exam";
import { TabSwitchWarning } from "@/components/student/tab-switch-warning";

interface Option {
  id: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface Question {
  id: string;
  prompt: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "TEXT" | "ESSAY";
  points: string;
  explanation: string | null;
  options: Option[];
}

interface AssessmentTakingCardProps {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    type: "QUIZ" | "EXAM" | "RETAKE_EXAM" | "TP" | "ASSIGNMENT";
    maxScore: string;
    dueDate: string | null;
    questions: Question[];
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
  existingResponses?: {
    questionId: string;
    selectedOptionId: string | null;
    textAnswer: string | null;
    scoreObtained: string | null;
  }[];
}

// Durée standard par défaut pour chaque question : 60 secondes (1 minute)
const DEFAULT_SECONDS_PER_QUESTION = 60;

export function AssessmentTakingCard({
  assessment,
  existingGrade,
  existingResponses = [],
}: AssessmentTakingCardProps) {
  const questions = assessment.questions || [];

  // Initialize form state
  const initialAnswers: Record<string, { selectedOptionId?: string; textAnswer?: string }> = {};
  existingResponses.forEach((resp) => {
    initialAnswers[resp.questionId] = {
      selectedOptionId: resp.selectedOptionId ?? undefined,
      textAnswer: resp.textAnswer ?? undefined,
    };
  });

  const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; textAnswer?: string }>>(
    initialAnswers
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    score: number;
    maxScore: number;
  } | null>(
    existingGrade && existingGrade.score !== null
      ? { score: existingGrade.score, maxScore: Number(assessment.maxScore) || 20 }
      : null
  );

  const isAlreadySubmitted = !!existingGrade || submissionResult !== null;

  // ─── Question Stepper & Minuteur par question ─────────────────────────────
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [secondsPerQuestion] = useState(DEFAULT_SECONDS_PER_QUESTION);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(DEFAULT_SECONDS_PER_QUESTION);
  const [timeExpiredNotice, setTimeExpiredNotice] = useState<string | null>(null);

  const activeQuestion = questions[currentQuestionIndex] ?? null;

  // ─── Mode sécurisé : soumission automatique en cas de changement d'onglet ──
  const SECURE_WARNING_SECONDS = 15;

  const performSubmit = useCallback(
    async (skipConfirm = false) => {
      if (isAlreadySubmitted || isSubmitting) return;

      if (!skipConfirm) {
        if (!confirm("Êtes-vous sûr de vouloir soumettre vos réponses ? Cette action enregistrera vos résultats finaux.")) {
          return;
        }
      }

      setIsSubmitting(true);

      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        questionId: qId,
        selectedOptionId: val.selectedOptionId || null,
        textAnswer: val.textAnswer || null,
      }));

      const res = await submitAssessmentAnswers({
        assessmentId: assessment.id,
        answers: formattedAnswers,
      });

      setIsSubmitting(false);

      if (res.success && res.score !== undefined) {
        setSubmissionResult({
          score: res.score,
          maxScore: res.maxScore || Number(assessment.maxScore) || 20,
        });
      } else {
        alert(res.error || "Échec de la soumission de l'évaluation.");
      }
    },
    [isAlreadySubmitted, isSubmitting, answers, assessment.id, assessment.maxScore]
  );

  const handleAutoSubmit = useCallback(() => {
    performSubmit(true);
  }, [performSubmit]);

  // Hook sécurisé de surveillance de changement d'onglet
  const { isWarningVisible, countdown, tabSwitchCount } = useSecureExam({
    warningDurationSeconds: SECURE_WARNING_SECONDS,
    onAutoSubmit: handleAutoSubmit,
    enabled: !isAlreadySubmitted,
  });

  // ─── MINUTEUR PAR QUESTION ────────────────────────────────────────────────
  const performSubmitRef = useRef(performSubmit);
  useEffect(() => {
    performSubmitRef.current = performSubmit;
  }, [performSubmit]);

  const currentIndexRef = useRef(currentQuestionIndex);
  useEffect(() => {
    currentIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  const totalQuestions = questions.length;

  useEffect(() => {
    if (isAlreadySubmitted || totalQuestions === 0) return;

    // Réinitialiser le chronomètre pour la question courante
    setQuestionTimeRemaining(secondsPerQuestion);

    const interval = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          // TEMPS ÉCOULÉ POUR CETTE QUESTION
          const idx = currentIndexRef.current;
          if (idx < totalQuestions - 1) {
            // Passer automatiquement à la question suivante
            setTimeExpiredNotice(`Temps écoulé pour la Question ${idx + 1} ! Passage automatique à la suivante.`);
            setTimeout(() => setTimeExpiredNotice(null), 3000);
            setCurrentQuestionIndex(idx + 1);
            return secondsPerQuestion;
          } else {
            // Dernière question : soumission automatique de l'examen
            clearInterval(interval);
            setTimeExpiredNotice("Temps écoulé sur la dernière question ! Soumission de l'épreuve...");
            performSubmitRef.current(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, isAlreadySubmitted, totalQuestions, secondsPerQuestion]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (isAlreadySubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOptionId: optionId,
      },
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "QUIZ":
        return { label: "Interrogation / Quiz", variant: "default" as const };
      case "EXAM":
        return { label: "Examen de Session", variant: "destructive" as const };
      case "RETAKE_EXAM":
        return { label: "Rattrapage", variant: "outline" as const };
      default:
        return { label: "Évaluation", variant: "secondary" as const };
    }
  };

  const typeInfo = getTypeLabel(assessment.type);

  // Ratio et couleur du minuteur
  const timerRatio = Math.max(0, Math.min(100, (questionTimeRemaining / secondsPerQuestion) * 100));
  const isTimeCritical = questionTimeRemaining <= 10;
  const isTimeWarning = questionTimeRemaining <= 20 && !isTimeCritical;

  const answeredCount = questions.filter((q) => answers[q.id]?.selectedOptionId).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overlay mode sécurisé : affiché si l'étudiant quitte l'onglet */}
      {isWarningVisible && (
        <TabSwitchWarning
          countdown={countdown}
          tabSwitchCount={tabSwitchCount}
          totalSeconds={SECURE_WARNING_SECONDS}
        />
      )}

      {/* ── Entête de l'épreuve ── */}
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
              {!isAlreadySubmitted && (
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/30 gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  {secondsPerQuestion}s par question
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Barème : <span className="font-semibold text-foreground">{assessment.maxScore} pts</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{assessment.title}</CardTitle>
          {assessment.promotionCourse?.course && (
            <CardDescription className="font-medium text-primary">
              {assessment.promotionCourse.course.code} - {assessment.promotionCourse.course.title}
            </CardDescription>
          )}
          {assessment.description && (
            <p className="text-sm text-muted-foreground mt-2">{assessment.description}</p>
          )}
        </CardHeader>
      </Card>

      {/* ── Notification de temps écoulé ── */}
      {timeExpiredNotice && (
        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{timeExpiredNotice}</span>
        </div>
      )}

      {/* ── Résultat obtenu si déjà soumis ── */}
      {submissionResult && (
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <CardTitle className="text-emerald-900 dark:text-emerald-300 text-xl font-bold">
                Résultat : {submissionResult.score} / {submissionResult.maxScore} pts
              </CardTitle>
              <CardDescription className="text-emerald-700 dark:text-emerald-400">
                Votre évaluation a été enregistrée avec succès. Vous pouvez consulter les détails et explications pédagogiques ci-dessous.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* MODE EN COURS : MINUTEUR PAR QUESTION & NAVIGATION QUESTION PAR QUESTION */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {!isAlreadySubmitted && questions.length > 0 && activeQuestion && (
        <div className="space-y-4">
          {/* BARRE DU MINUTEUR PAR QUESTION */}
          <Card
            className={`shadow-md border-2 transition-all ${
              isTimeCritical
                ? "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 animate-pulse"
                : isTimeWarning
                ? "border-amber-500 bg-amber-50/30 dark:bg-amber-950/20"
                : "border-primary/30 bg-card"
            }`}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Minuteur visuel */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-mono font-bold text-lg shadow-inner ${
                      isTimeCritical
                        ? "bg-rose-600 text-white"
                        : isTimeWarning
                        ? "bg-amber-500 text-white"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {questionTimeRemaining}s
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <Clock
                        className={`w-4 h-4 ${
                          isTimeCritical
                            ? "text-rose-600 animate-spin"
                            : isTimeWarning
                            ? "text-amber-500"
                            : "text-primary"
                        }`}
                      />
                      <span
                        className={
                          isTimeCritical
                            ? "text-rose-600 dark:text-rose-400"
                            : isTimeWarning
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-foreground"
                        }
                      >
                        {isTimeCritical
                          ? "Temps presque écoulé !"
                          : "Minuteur pour cette question"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Passage automatique à la question suivante à 0s.
                    </p>
                  </div>
                </div>

                {/* Progression globale */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Question {currentQuestionIndex + 1} sur {questions.length}
                  </span>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {answeredCount} / {questions.length} répondue{answeredCount > 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>

              {/* Barre de progression du minuteur */}
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden mt-4">
                <div
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                    isTimeCritical
                      ? "bg-rose-500"
                      : isTimeWarning
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                  style={{ width: `${timerRatio}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stepper des questions (Pills de navigation rapide) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const isAnswered = Boolean(answers[q.id]?.selectedOptionId);

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 border ${
                    isCurrent
                      ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/30"
                      : isAnswered
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 hover:bg-emerald-100"
                      : "bg-card text-muted-foreground border-border hover:bg-accent"
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  {isAnswered && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* CARTE DE LA QUESTION ACTIVE */}
          <Card className="shadow-md border">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="font-semibold text-primary">
                  Question {currentQuestionIndex + 1} sur {questions.length}
                </span>
                <Badge variant="outline" className="font-mono">
                  {activeQuestion.points} pt{parseFloat(activeQuestion.points) > 1 ? "s" : ""}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold leading-relaxed">
                {activeQuestion.prompt}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              <RadioGroup
                value={answers[activeQuestion.id]?.selectedOptionId || ""}
                onValueChange={(val) => handleSelectOption(activeQuestion.id, val)}
                className="space-y-2.5"
              >
                {activeQuestion.options.map((opt, optIdx) => {
                  const isSelected = answers[activeQuestion.id]?.selectedOptionId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(activeQuestion.id, opt.id)}
                      className={`border rounded-xl p-3.5 flex items-center space-x-3 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 border-primary ring-1 ring-primary shadow-xs font-medium"
                          : "hover:bg-accent/60 border-border"
                      }`}
                    >
                      <RadioGroupItem value={opt.id} id={opt.id} />
                      <span className="font-mono text-xs font-bold text-muted-foreground w-5">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <Label htmlFor={opt.id} className="flex-1 cursor-pointer text-sm">
                        {opt.optionText}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>

            {/* Barre d'action Stepper */}
            <CardFooter className="flex items-center justify-between border-t p-4 bg-muted/10">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="w-4 h-4" /> Précédente
              </Button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    size="sm"
                    onClick={handleNextQuestion}
                    className="gap-1 text-xs font-bold"
                  >
                    Suivante <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => performSubmit(false)}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Envoi..." : "Terminer et Soumettre"}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* MODE CORRIGÉ / CONSULTATION (QUAND DÉJÀ SOUMIS)                           */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {isAlreadySubmitted && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Correction détaillée de l&apos;épreuve ({questions.length} questions)
            </h3>
            <Badge variant="outline" className="text-xs">
              Note finale : {submissionResult?.score ?? existingGrade?.score ?? 0} /{" "}
              {submissionResult?.maxScore ?? assessment.maxScore}
            </Badge>
          </div>

          {questions.map((q, idx) => {
            const currentAns = answers[q.id];
            return (
              <Card key={q.id} className="shadow-sm border">
                <CardHeader className="pb-3 bg-muted/20 border-b">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-primary">Question {idx + 1}</span>
                    <Badge variant="outline">{q.points} pt(s)</Badge>
                  </div>
                  <CardTitle className="text-base font-semibold">{q.prompt}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = currentAns?.selectedOptionId === opt.id;
                      let itemStyle =
                        "border rounded-lg p-3 flex items-center space-x-3 transition-colors";

                      if (opt.isCorrect) {
                        itemStyle +=
                          " bg-emerald-100/70 dark:bg-emerald-950/50 border-emerald-500 font-medium text-emerald-950 dark:text-emerald-200";
                      } else if (isSelected && !opt.isCorrect) {
                        itemStyle +=
                          " bg-rose-100/70 dark:bg-rose-950/50 border-rose-500 text-rose-950 dark:text-rose-200";
                      } else {
                        itemStyle += " bg-muted/20 opacity-70";
                      }

                      return (
                        <div key={opt.id} className={itemStyle}>
                          <span className="font-mono text-xs font-bold text-muted-foreground w-5">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="flex-1 text-sm">{opt.optionText}</span>
                          {opt.isCorrect && (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Bonne réponse
                            </span>
                          )}
                          {isSelected && !opt.isCorrect && (
                            <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded shrink-0">
                              <XCircle className="w-3.5 h-3.5" /> Votre choix (Incorrect)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explication pédagogique */}
                  {q.explanation && (
                    <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 mt-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Explication de l&apos;enseignant : </span>
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cas où aucune question n'est configurée */}
      {questions.length === 0 && (
        <Card className="p-8 text-center border-dashed">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-semibold">Aucune question dans cette épreuve</h3>
          <p className="text-xs text-muted-foreground mt-1">
            L&apos;enseignant n&apos;a pas encore ajouté de questions.
          </p>
        </Card>
      )}

      {/* Bouton de soumission manuelle globale */}
      {!isAlreadySubmitted && questions.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-4">
          <p className="text-xs text-muted-foreground">
            {answeredCount} sur {questions.length} question{questions.length > 1 ? "s" : ""} renseignée{answeredCount > 1 ? "s" : ""}.
          </p>
          <Button
            size="lg"
            onClick={() => performSubmit(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[220px] font-bold"
          >
            {isSubmitting ? (
              "Soumission en cours..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Valider et Soumettre l&apos;épreuve
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
