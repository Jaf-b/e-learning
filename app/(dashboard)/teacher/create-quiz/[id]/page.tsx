"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { ArrowLeft, Save, FileCheck, AlertCircle, CheckCircle2, HelpCircle, Calendar, Scale, Award, Sparkles, FolderCode, BookOpen } from "lucide-react";
import {
    getQuizInitialData,
    createAssessmentForCourse,
    updateAssessment,
    getQuestionsByAssessmentId
} from "@/lib/action/question.actions";

export default function CreateQuizPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params?.id as string;
    const requestedType = searchParams.get("type");

    // États de chargement et données
    const [isLoading, setIsLoading] = useState(true);
    const [course, setCourse] = useState<any>(null);
    const [assessment, setAssessment] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

    // Formulaire d'évaluation (Quiz, Examen, TP, Devoir)
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
                if (requestedType === "TP") {
                    setType("TP");
                    setTitle(res.course ? `TP 1 : ${res.course.title}` : "Nouveau Travail Pratique");
                    setDescription("Consignes du TP :\n1. Objectifs à réaliser\n2. Technologies et environnement\n3. Livrables attendus (code source, rapport, lien GitHub/Drive)");
                } else if (requestedType === "ASSIGNMENT") {
                    setType("ASSIGNMENT");
                    setTitle(res.course ? `Devoir : ${res.course.title}` : "Nouveau Devoir à Domicile");
                } else {
                    const isQuizTaken = res.existingTypes?.includes("QUIZ");
                    if (!isQuizTaken) {
                        setType("QUIZ");
                        setTitle(res.course ? `Interrogation - ${res.course.code}` : "Nouvelle Interrogation");
                    } else {
                        setType("EXAM");
                        setTitle(res.course ? `Examen Final - ${res.course.code}` : "Nouvel Examen");
                    }
                }
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
            if (selectedQuestion?.id) {
                const updatedSel = res.data?.find((q: any) => q.id === selectedQuestion.id);
                setSelectedQuestion(updatedSel || (res.data && res.data.length > 0 ? res.data[0] : null));
            } else if (res.data && res.data.length > 0) {
                setSelectedQuestion(res.data[res.data.length - 1]);
            }
        }
    };

    // Sauvegarder les métadonnées de l'épreuve
    const handleSaveAssessment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setErrorMsg("Le titre de l'épreuve est requis.");
            return;
        }

        setIsSavingAssessment(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            if (assessment?.id) {
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
                    setSuccessMsg("Épreuve mise à jour avec succès.");
                } else {
                    setErrorMsg(res.error || "Erreur de mise à jour.");
                }
            } else {
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
                    setSuccessMsg("Épreuve créée avec succès ! Vous pouvez maintenant ajouter des questions à choix unique.");
                    router.replace(`/teacher/create-quiz/${res.data.id}`);
                } else {
                    setErrorMsg(res.error || "Erreur de création de l'épreuve.");
                }
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Une erreur inattendue est survenue.");
        } finally {
            setIsSavingAssessment(false);
        }
    };

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
                            {type === "TP" ? (
                                <Badge className="bg-blue-600/15 text-blue-700 dark:text-blue-400 border-blue-500/20">
                                    <FolderCode className="w-3.5 h-3.5 mr-1" /> Travail Pratique (TP)
                                </Badge>
                            ) : type === "ASSIGNMENT" ? (
                                <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                                    <BookOpen className="w-3.5 h-3.5 mr-1" /> Devoir à Domicile
                                </Badge>
                            ) : (
                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">
                                    Concepteur de Quiz & Examens
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight mt-1">
                            {assessment
                                ? assessment.title
                                : course
                                ? `${type === "TP" ? "Création TP" : type === "ASSIGNMENT" ? "Création Devoir" : "Création Épreuve"} - ${course.title}`
                                : "Configuration de l'Évaluation"}
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

            {/* Section 1 : Configuration des paramètres de l'évaluation */}
            <Card className="shadow-xs border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        {type === "TP" ? (
                            <FolderCode className="w-5 h-5 text-blue-600" />
                        ) : type === "ASSIGNMENT" ? (
                            <BookOpen className="w-5 h-5 text-emerald-600" />
                        ) : (
                            <FileCheck className="w-5 h-5 text-amber-600" />
                        )}
                        1. Paramètres {type === "TP" ? "du Travail Pratique (TP)" : type === "ASSIGNMENT" ? "du Devoir" : "de l'Interrogation / Examen"}
                    </CardTitle>
                    <CardDescription>
                        {type === "TP" || type === "ASSIGNMENT"
                            ? "Définissez le sujet, les consignes détaillées, le barème et la date limite de remise."
                            : "Définissez le type d'épreuve (Interrogation ou Examen), le barème et la date de l'évaluation."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSaveAssessment} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 flex flex-col gap-1.5">
                                <Label className="text-xs font-semibold">Titre de l'évaluation *</Label>
                                <Input
                                    placeholder={
                                        type === "TP"
                                            ? "Ex: TP 1 : Mise en place de l'API REST et Base de données"
                                            : type === "ASSIGNMENT"
                                            ? "Ex: Devoir de recherche : Les microservices"
                                            : "Ex: Interrogation Chapitre 1 ou Examen de Session"
                                    }
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
                                    <SelectTrigger className="h-9 text-xs font-medium">
                                        <SelectValue placeholder="Sélectionner le type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TP">
                                            Travail Pratique (TP / Projet)
                                        </SelectItem>
                                        <SelectItem value="ASSIGNMENT">
                                            Devoir à Domicile
                                        </SelectItem>
                                        <SelectItem value="QUIZ">
                                            Quiz / Interrogation (Choix Unique)
                                        </SelectItem>
                                        <SelectItem value="EXAM">
                                            Examen Final (Choix Unique)
                                        </SelectItem>
                                        <SelectItem value="RETAKE_EXAM">
                                            Examen de Rattrapage (Choix Unique)
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
                                    <Scale className="w-3.5 h-3.5 text-muted-foreground" /> Coefficient
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
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                    {type === "TP" || type === "ASSIGNMENT" ? "Date limite de rendu *" : "Date de l'épreuve *"}
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
                            <Label className="text-xs font-semibold">
                                {type === "TP" || type === "ASSIGNMENT"
                                    ? "Énoncé, consignes et livrables attendus *"
                                    : "Consignes de l'épreuve"}
                            </Label>
                            <Textarea
                                rows={type === "TP" || type === "ASSIGNMENT" ? 6 : 3}
                                className="text-xs resize-y"
                                placeholder={
                                    type === "TP" || type === "ASSIGNMENT"
                                        ? "Détaillez ici les objectifs du TP, les étapes à accomplir, l'environnement requis et les modalités de remise (ex: lien GitHub, archive ZIP, rapport écrit)..."
                                        : "Consignes particulières, durée de l'épreuve..."
                                }
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end mt-1">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSavingAssessment}
                                className={
                                    type === "TP"
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : type === "ASSIGNMENT"
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : "bg-amber-600 hover:bg-amber-700"
                                }
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSavingAssessment
                                    ? "Enregistrement..."
                                    : assessment
                                    ? "Mettre à jour l'évaluation"
                                    : type === "TP"
                                    ? "Créer le TP"
                                    : type === "ASSIGNMENT"
                                    ? "Créer le Devoir"
                                    : "Enregistrer et ajouter des questions"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Section 2 : Éditeur de Questions (QCM ou tâches spécifiques) */}
            {assessment ? (
                <div className="flex flex-col gap-4">
                    {(type === "TP" || type === "ASSIGNMENT") && (
                        <div className="p-4 rounded-xl border bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-sm flex items-start gap-3 text-blue-900 dark:text-blue-200">
                            <FolderCode className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold">Mode Travail Pratique</h4>
                                <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                                    Les consignes ci-dessus constituent le sujet officiel du TP. Les étudiants pourront directement soumettre leur travail (dépôt GitHub, code, compte-rendu ou lien).
                                    Si vous souhaitez découper le TP en sous-questions ou critères d&apos;évaluation, vous pouvez les ajouter ci-dessous.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-600" />
                                2. Questions & Barème {type === "TP" || type === "ASSIGNMENT" ? "(Optionnel pour TP)" : "(QCM Choix Unique)"}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {type === "TP" || type === "ASSIGNMENT"
                                    ? "Ajoutez des questions ou critères d'évaluation si vous souhaitez une notation détaillée par question."
                                    : "Ajoutez les questions de votre quiz ou examen. Chaque question aura une seule réponse correcte."}
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

                        {/* Colonne de droite : Éditeur de question */}
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
                        Veuillez enregistrer les paramètres ci-dessus pour accéder à la gestion des questions de cette évaluation.
                    </span>
                </div>
            )}
        </div>
    );
}
