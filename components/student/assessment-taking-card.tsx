"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { submitAssessmentAnswers } from "@/lib/action/student.actions";
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, Award, Send } from "lucide-react";

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

export function AssessmentTakingCard({
  assessment,
  existingGrade,
  existingResponses = [],
}: AssessmentTakingCardProps) {
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

  const handleTextAnswer = (questionId: string, text: string) => {
    if (isAlreadySubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        textAnswer: text,
      },
    }));
  };

  const handleSubmit = async () => {
    if (isAlreadySubmitted) return;

    if (!confirm("Êtes-vous sûr de vouloir soumettre vos réponses ? Cette action enregistrera vos résultats.")) {
      return;
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Entête de l'épreuve */}
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
            <div className="text-sm text-muted-foreground">
              Note max : <span className="font-semibold text-foreground">{assessment.maxScore} pts</span>
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

      {/* Résultat obtenu si déjà soumis */}
      {submissionResult && (
        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <CardTitle className="text-emerald-900 dark:text-emerald-300 text-xl">
                Résultat : {submissionResult.score} / {submissionResult.maxScore}
              </CardTitle>
              <CardDescription className="text-emerald-700 dark:text-emerald-400">
                Votre évaluation a été enregistrée avec succès. Vous pouvez consulter les détails ci-dessous.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Liste des questions */}
      {assessment.questions.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-semibold">Aucune question dans cette épreuve</h3>
          <p className="text-xs text-muted-foreground mt-1">L'enseignant n'a pas encore ajouté de questions.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessment.questions.map((q, idx) => {
            const currentAns = answers[q.id];
            return (
              <Card key={q.id} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-primary">Question {idx + 1}</span>
                    <Badge variant="outline">{q.points} pt(s)</Badge>
                  </div>
                  <CardTitle className="text-base font-semibold">{q.prompt}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  {/* SINGLE CHOICE / TRUE FALSE */}
                  {(q.type === "SINGLE_CHOICE" || q.type === "TRUE_FALSE" || q.type === "MULTIPLE_CHOICE") && (
                    <RadioGroup
                      value={currentAns?.selectedOptionId || ""}
                      onValueChange={(val) => handleSelectOption(q.id, val)}
                      disabled={isAlreadySubmitted}
                      className="space-y-2"
                    >
                      {q.options.map((opt) => {
                        const isSelected = currentAns?.selectedOptionId === opt.id;
                        let itemStyle = "border rounded-lg p-3 flex items-center space-x-3 transition-colors cursor-pointer";

                        if (isAlreadySubmitted) {
                          if (opt.isCorrect) {
                            itemStyle += " bg-emerald-100/70 dark:bg-emerald-950/50 border-emerald-500 font-medium";
                          } else if (isSelected && !opt.isCorrect) {
                            itemStyle += " bg-rose-100/70 dark:bg-rose-950/50 border-rose-500";
                          }
                        } else if (isSelected) {
                          itemStyle += " bg-primary/10 border-primary font-medium";
                        } else {
                          itemStyle += " hover:bg-accent";
                        }

                        return (
                          <div key={opt.id} className={itemStyle}>
                            <RadioGroupItem value={opt.id} id={opt.id} />
                            <Label htmlFor={opt.id} className="flex-1 cursor-pointer text-sm">
                              {opt.optionText}
                            </Label>
                            {isAlreadySubmitted && opt.isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {isAlreadySubmitted && isSelected && !opt.isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}

                  {/* TEXT / ESSAY */}
                  {(q.type === "TEXT" || q.type === "ESSAY") && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Rédigez votre réponse ici..."
                        value={currentAns?.textAnswer || ""}
                        onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                        disabled={isAlreadySubmitted}
                        rows={4}
                        className="resize-y"
                      />
                    </div>
                  )}

                  {/* Explication après soumission */}
                  {isAlreadySubmitted && q.explanation && (
                    <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground mt-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">Explication : </span>
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

      {/* Action Footer */}
      {!isAlreadySubmitted && assessment.questions.length > 0 && (
        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isSubmitting ? (
              "Soumission en cours..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Valider et Soumettre
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
