"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import QuestionCard from "@/components/shared/question-card";
import QuestionDetail from "@/components/shared/question-detail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, FileCheck, AlertCircle, CheckCircle2, HelpCircle, Calendar, Scale, Award } from "lucide-react";
import {
    getQuizInitialData,
    createAssessmentForCourse,
    updateAssessment,
    getQuestionsByAssessmentId
} from "@/lib/action/question.actions";

export default function CreateQuizPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    // États de chargement et données
    const [isLoading, setIsLoading] = useState(true);
    const [course, setCourse] = useState<any>(null);
    const [assessment, setAssessment] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
    const [existingTypes, setExistingTypes] = useState<string[]>([]);

    // Formulaire d'évaluation
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<"QUIZ" | "EXAM" | "RETAKE_EXAM" | "TP" | "ASSIGNMENT">("QUIZ");
    const [maxScore, setMaxScore] = useState("20.00");
    const [weight, setWeight] = useState("1.00");
    const [dueDate, setDueDate] = useState("");

    // États de feedback
    const [isSavingAssessment, setIsSavingAssessment] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Chargement initial des données
    const loadData = async () => {
        if (!id) return;
        setIsLoading(true);
        const res = await getQuizInitialData(id);

        if (res.success) {
            setCourse(res.course);
            setExistingTypes(res.existingTypes || []);

            if (res.isExistingAssessment && res.assessment) {
                setAssessment(res.assessment);
                setTitle(res.assessment.title || "");
                setDescription(res.assessment.description || "");
                setType(res.assessment.type as any);
                setMaxScore(res.assessment.maxScore ? String(res.assessment.maxScore) : "20.00");
                setWeight(res.assessment.weight ? String(res.assessment.weight) : "1.00");
                setDueDate(res.assessment.dueDate || "");
                setQuestions(res.assessment.questions || []);
                if (res.assessment.questions && res.assessment.questions.length > 0) {
                    setSelectedQuestion(res.assessment.questions[0]);
                }
            } else {
                // Déterminer le type par défaut disponible (si QUIZ est pris, proposer TP)
                const isQuizTaken = res.existingTypes?.includes("QUIZ");
                const isExamTaken = res.existingTypes?.includes("EXAM");

                if (!isQuizTaken) {
                    setType("QUIZ");
                } else if (!isExamTaken) {
                    setType("EXAM");
                } else {
                    setType("TP");
                }
                setTitle(course ? `Évaluation - ${course.code}` : "Nouveau Quiz");
            }
        } else {
            setErrorMsg(res.error || "Impossible de charger les données.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [id]);

    // Recharger la liste des questions
    const refreshQuestions = async (assessmentId: string) => {
        const res = await getQuestionsByAssessmentId(assessmentId);
        if (res.success) {
            setQuestions(res.data || []);
            // Garder la sélection ou sélectionner la nouvelle
            if (selectedQuestion?.id) {
                const updatedSel = res.data?.find((q: any) => q.id === selectedQuestion.id);
                setSelectedQuestion(updatedSel || (res.data && res.data.length > 0 ? res.data[0] : null));
            } else if (res.data && res.data.length > 0) {
                setSelectedQuestion(res.data[res.data.length - 1]);
            }
        }
    };

    // Sauvegarder les métadonnées de l'évaluation
    const handleSaveAssessment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setErrorMsg("Le titre de l'évaluation est requis.");
            return;
        }

        setIsSavingAssessment(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            if (assessment?.id) {
                // Mise à jour
                const res = await updateAssessment(assessment.id, {
                    title,
                    description,
                    type,
                    maxScore,
                    weight,
                    dueDate: dueDate || undefined,
                });

                if (res.success) {
                    setAssessment(res.data);
                    setSuccessMsg("Évaluation mise à jour avec succès.");
                } else {
                    setErrorMsg(res.error || "Erreur de mise à jour.");
                }
            } else {
                // Création
                const courseId = course?.id || id;
                const res = await createAssessmentForCourse(courseId, {
                    title,
                    description,
                    type,
                    maxScore,
                    weight,
                    dueDate: dueDate || undefined,
                });

                if (res.success && res.data) {
                    setAssessment(res.data);
                    setSuccessMsg("Évaluation créée avec succès ! Vous pouvez maintenant ajouter des questions.");
                    // Rediriger vers l'URL de l'évaluation créée sans recharger brutalement
                    router.replace(`/teacher/create-quiz/${res.data.id}`);
                } else {
                    setErrorMsg(res.error || "Erreur de création d'évaluation.");
                }
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Une erreur inattendue est survenue.");
        } finally {
            setIsSavingAssessment(false);
        }
    };

    // Ajouter une nouvelle question (brouillon)
    const handleAddQuestion = () => {
        setSelectedQuestion(null);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1">
                            <Skeleton className="h-7 w-48 rounded" />
                            <Skeleton className="h-4 w-72 rounded" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-36 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 space-y-4">
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-96 rounded-xl" />
                    </div>
                    <div className="lg:col-span-8">
                        <Skeleton className="h-[550px] rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    const courseId = course?.id || (assessment?.promotionCourse?.courseId ?? id);
    const isQuizDisabled = existingTypes.includes("QUIZ") && assessment?.type !== "QUIZ";
    const isExamDisabled = existingTypes.includes("EXAM") && assessment?.type !== "EXAM";

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
            {/* Navigation et En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="h-9 w-9">
                        <Link href={`/teacher/courses/${courseId}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            {course?.code && <Badge variant="outline">{course.code}</Badge>}
                            <Badge className="bg-primary/15 text-primary border-primary/20">
                                {assessment ? `Édition : ${assessment.type}` : "Création de Quiz"}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight mt-1">
                            {assessment ? assessment.title : (course ? `Nouveau Quiz : ${course.title}` : "Configuration du Quiz")}
                        </h1>
                    </div>
                </div>

                <Button variant="outline" asChild size="sm">
                    <Link href={`/teacher/courses/${courseId}`}>
                        Retour au cours
                    </Link>
                </Button>
            </div>

            {/* Notifications */}
            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Section 1 : Configuration des métadonnées de l'Évaluation */}
            <Card className="shadow-xs border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-primary" />
                        1. Informations Générales de l'Évaluation
                    </CardTitle>
                    <CardDescription>
                        Définissez le type, le barème et les règles d'évaluation pour ce cours.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveAssessment} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold">Titre de l'évaluation *</Label>
                                <Input
                                    placeholder="Ex: Interrogation Chapitre 1 - Bases de données"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold">Type d'évaluation *</Label>
                                <Select
                                    value={type}
                                    onValueChange={(v: any) => setType(v)}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="QUIZ" disabled={isQuizDisabled}>
                                            Quiz / Interrogation {isQuizDisabled ? "(Déjà créé)" : "(1 max)"}
                                        </SelectItem>
                                        <SelectItem value="EXAM" disabled={isExamDisabled}>
                                            Examen Final {isExamDisabled ? "(Déjà créé)" : "(1 max)"}
                                        </SelectItem>
                                        <SelectItem value="TP">
                                            Travail Pratique (TP) (Multiples)
                                        </SelectItem>
                                        <SelectItem value="ASSIGNMENT">
                                            Devoir à domicile (Multiples)
                                        </SelectItem>
                                        <SelectItem value="RETAKE_EXAM">
                                            Examen de Rattrapage
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5 text-muted-foreground" /> Note Maximale
                                </Label>
                                <Input
                                    type="number"
                                    step="1"
                                    min="1"
                                    className="font-mono text-xs"
                                    value={maxScore}
                                    onChange={(e) => setMaxScore(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold flex items-center gap-1">
                                    <Scale className="w-3.5 h-3.5 text-muted-foreground" /> Coefficient / Poids
                                </Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    className="font-mono text-xs"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Date limite (optionnel)
                                </Label>
                                <Input
                                    type="date"
                                    className="text-xs"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold">Description / Consignes</Label>
                            <Textarea
                                rows={2}
                                className="text-xs resize-y"
                                placeholder="Consignes particulières pour les étudiants..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end mt-1">
                            <Button type="submit" size="sm" disabled={isSavingAssessment}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSavingAssessment ? "Enregistrement..." : (assessment ? "Mettre à jour l'évaluation" : "Créer et passer aux questions")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Section 2 : Éditeur de Questions (Interactive 2-Column Builder) */}
            {assessment ? (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-primary" />
                                2. Conception des Questions
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Ajoutez et configurez les questions de cette évaluation.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
                        {/* Colonne de gauche : Sidebar des questions */}
                        <QuestionCard
                            questions={questions}
                            selectedQuestion={selectedQuestion}
                            onAddQuestion={handleAddQuestion}
                            onSelectQuestion={(q) => setSelectedQuestion(q)}
                            maxScore={parseFloat(maxScore) || 20}
                        />

                        {/* Colonne de droite : Éditeur principal spacieux */}
                        <div className="flex-1 w-full min-w-0">
                            <QuestionDetail
                                question={selectedQuestion}
                                assessmentId={assessment.id}
                                onSave={() => refreshQuestions(assessment.id)}
                                onDelete={() => {
                                    setSelectedQuestion(null);
                                    refreshQuestions(assessment.id);
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-amber-50/70 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                        Veuillez enregistrer les informations générales de l'évaluation ci-dessus pour pouvoir ajouter et configurer les questions.
                    </span>
                </div>
            )}
        </div>
    );

}

