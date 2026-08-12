"use client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash, Save, HelpCircle, AlertCircle, CheckCircle2, Sparkles, Check } from "lucide-react";
import { questions as questionsTable, questionOptions as questionOptionsTable } from "@/db/schema";
import { createQuestion, updateQuestion, deleteQuestion } from "@/lib/action/question.actions";
import { cn } from "@/lib/utils";

type QuestionType = typeof questionsTable.$inferSelect;
type OptionType = typeof questionOptionsTable.$inferSelect;

interface QuestionDetailProps {
    question: (QuestionType & { options?: OptionType[] }) | null;
    assessmentId: string;
    onSave: () => void;
    onDelete?: () => void;
}

function QuestionDetail({ question, assessmentId, onSave, onDelete }: QuestionDetailProps) {
    const [prompt, setPrompt] = useState("");
    const [type, setType] = useState<string>("SINGLE_CHOICE");
    const [points, setPoints] = useState("1.00");
    const [explanation, setExplanation] = useState("");
    const [options, setOptions] = useState<Partial<OptionType>[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Synchronisation de l'état quand la question sélectionnée change
    useEffect(() => {
        if (question) {
            setPrompt(question.prompt || "");
            setType(question.type || "SINGLE_CHOICE");
            setPoints(question.points || "1.00");
            setExplanation(question.explanation || "");
            setOptions(question.options ? [...question.options] : []);
        } else {
            // Réinitialisation pour une nouvelle question
            setPrompt("");
            setType("SINGLE_CHOICE");
            setPoints("1.00");
            setExplanation("");
            setOptions([
                { id: crypto.randomUUID(), optionText: "Option 1", isCorrect: true, orderIndex: 0 },
                { id: crypto.randomUUID(), optionText: "Option 2", isCorrect: false, orderIndex: 1 },
            ]);
        }
        setErrorMsg("");
    }, [question]);

    // Gérer le changement de type de question
    const handleTypeChange = (newType: string | null) => {
        if (!newType) return;
        setType(newType);
        if (newType === "TRUE_FALSE") {
            setOptions([
                { id: crypto.randomUUID(), optionText: "Vrai", isCorrect: true, orderIndex: 0 },
                { id: crypto.randomUUID(), optionText: "Faux", isCorrect: false, orderIndex: 1 },
            ]);
        } else if ((newType === "SINGLE_CHOICE" || newType === "MULTIPLE_CHOICE") && options.length === 0) {
            setOptions([
                { id: crypto.randomUUID(), optionText: "Option 1", isCorrect: true, orderIndex: 0 },
                { id: crypto.randomUUID(), optionText: "Option 2", isCorrect: false, orderIndex: 1 },
            ]);
        }
    };

    const handleSave = async () => {
        if (!prompt.trim()) {
            setErrorMsg("L'énoncé de la question ne peut pas être vide.");
            return;
        }

        if (!assessmentId) {
            setErrorMsg("Veuillez d'abord sauvegarder les informations de l'évaluation.");
            return;
        }

        // Pour QCM ou Vrai/Faux, vérifier qu'au moins une option est marquée comme correcte
        if (["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"].includes(type)) {
            if (options.length === 0) {
                setErrorMsg("Veuillez ajouter au moins une option de réponse.");
                return;
            }
            const hasCorrect = options.some(o => o.isCorrect);
            if (!hasCorrect) {
                setErrorMsg("Veuillez cocher au moins une bonne réponse.");
                return;
            }
        }

        setIsSaving(true);
        setErrorMsg("");

        try {
            const data = {
                prompt,
                type,
                points,
                explanation,
                options: ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"].includes(type) ? options : [],
            };

            let res;
            if (question?.id) {
                res = await updateQuestion(question.id, data);
            } else {
                res = await createQuestion(assessmentId, data);
            }

            if (res.success) {
                onSave();
            } else {
                setErrorMsg(res.error || "Une erreur est survenue.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Échec de la sauvegarde.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!question?.id) return;
        if (!confirm("Voulez-vous vraiment supprimer cette question ?")) return;

        setIsSaving(true);
        try {
            const res = await deleteQuestion(question.id);
            if (res.success) {
                onSave();
                if (onDelete) onDelete();
            } else {
                setErrorMsg(res.error || "Impossible de supprimer.");
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Échec de la suppression.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddOption = () => {
        setOptions([
            ...options,
            {
                id: crypto.randomUUID(),
                optionText: `Option ${options.length + 1}`,
                isCorrect: false,
                orderIndex: options.length,
            },
        ]);
    };

    const handleOptionTextChange = (index: number, text: string) => {
        const updated = [...options];
        updated[index] = { ...updated[index], optionText: text };
        setOptions(updated);
    };

    const handleOptionCorrectToggle = (index: number, isChecked: boolean) => {
        const updated = [...options];
        if (type === "SINGLE_CHOICE" || type === "TRUE_FALSE") {
            // Choix unique : décocher toutes les autres options
            updated.forEach((opt, i) => {
                opt.isCorrect = i === index ? isChecked : false;
            });
        } else {
            // Choix multiple : basculer l'option spécifiée
            updated[index] = { ...updated[index], isCorrect: isChecked };
        }
        setOptions(updated);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2 && type === "TRUE_FALSE") {
            setErrorMsg("Une question Vrai/Faux nécessite exactement 2 choix.");
            return;
        }
        const updated = options.filter((_, i) => i !== index);
        setOptions(updated);
    };

    return (
        <Card className="w-full shadow-md border rounded-xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 p-5 md:p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {question?.id ? "Éditeur de Question" : "Nouvelle Question"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Saisissez l'énoncé, définissez le barème et configurez les choix de réponse.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto justify-start lg:justify-end bg-card p-3 rounded-lg border shadow-xs">
                    <div className="flex items-center gap-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type :</Label>
                        <Select value={type} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-[180px] h-9 text-xs font-medium bg-background">
                                <SelectValue placeholder="Type de question" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SINGLE_CHOICE">Choix unique (QCM)</SelectItem>
                                <SelectItem value="MULTIPLE_CHOICE">Choix multiples (QCM)</SelectItem>
                                <SelectItem value="TRUE_FALSE">Vrai / Faux</SelectItem>
                                <SelectItem value="TEXT">Texte court</SelectItem>
                                <SelectItem value="ESSAY">Rédaction / Dissertation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 border-l pl-4">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points :</Label>
                        <Input
                            type="number"
                            step="0.5"
                            min="0.25"
                            className="w-[90px] h-9 text-sm font-mono font-bold bg-background text-center"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 flex flex-col gap-6">
                {errorMsg && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2.5 shadow-2xs">
                        <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                        <span className="font-medium">{errorMsg}</span>
                    </div>
                )}

                {/* Énoncé de la question */}
                <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold flex items-center justify-between text-foreground">
                        <span>Énoncé de la question <span className="text-rose-500">*</span></span>
                        <span className="text-xs font-normal text-muted-foreground">Texte clair et précis pour l'étudiant</span>
                    </Label>
                    <Textarea
                        className="min-h-[120px] text-base p-3.5 leading-relaxed resize-y border-input focus-visible:ring-primary shadow-2xs"
                        placeholder="Ex: Quelle est la clause SQL permettant de filtrer les résultats après un GROUP BY ?"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>

                {/* Section des Options de Réponses */}
                {["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"].includes(type) && (
                    <div className="flex flex-col gap-4 bg-muted/20 p-5 rounded-xl border">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    Options de réponse
                                    <span className="text-xs font-normal text-muted-foreground bg-background px-2.5 py-0.5 rounded-full border">
                                        {type === "SINGLE_CHOICE" ? "Une seule bonne réponse" : type === "TRUE_FALSE" ? "Choix Vrai ou Faux" : "Une ou plusieurs bonnes réponses"}
                                    </span>
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Saisissez le texte des choix et cochez la case à gauche pour désigner la (ou les) réponse(s) exacte(s).
                                </p>
                            </div>

                            {type !== "TRUE_FALSE" && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-9 text-xs px-3 font-semibold bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-colors shadow-2xs shrink-0"
                                    onClick={handleAddOption}
                                >
                                    <Plus className="mr-1.5 h-4 w-4 text-primary" /> Ajouter une option
                                </Button>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 mt-1">
                            {options.map((option, index) => {
                                const isCorrect = Boolean(option.isCorrect);
                                return (
                                    <div
                                        key={option.id || index}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-all shadow-2xs",
                                            isCorrect
                                                ? "bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/30"
                                                : "bg-card hover:bg-muted/40 border-border"
                                        )}
                                    >
                                        <div className="flex items-center justify-center pl-1">
                                            {type === "SINGLE_CHOICE" || type === "TRUE_FALSE" ? (
                                                <input
                                                    type="radio"
                                                    name={`correct-option-${question?.id || 'new'}`}
                                                    checked={isCorrect}
                                                    onChange={(e) => handleOptionCorrectToggle(index, e.target.checked)}
                                                    className="w-5 h-5 text-emerald-600 accent-emerald-600 cursor-pointer"
                                                />
                                            ) : (
                                                <Checkbox
                                                    checked={isCorrect}
                                                    className="w-5 h-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                    onCheckedChange={(checked) => handleOptionCorrectToggle(index, Boolean(checked))}
                                                />
                                            )}
                                        </div>

                                        <div className="flex-1 flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-muted-foreground w-6">
                                                {String.fromCharCode(65 + index)}.
                                            </span>
                                            <Input
                                                className={cn(
                                                    "h-10 text-sm flex-1 bg-background font-medium",
                                                    isCorrect && "border-emerald-300 font-semibold"
                                                )}
                                                placeholder={`Texte de l'option ${index + 1}`}
                                                value={option.optionText || ""}
                                                disabled={type === "TRUE_FALSE"}
                                                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                                            />
                                        </div>

                                        {isCorrect && (
                                            <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md shrink-0">
                                                <Check className="w-3.5 h-3.5" /> Bonne réponse
                                            </span>
                                        )}

                                        {type !== "TRUE_FALSE" && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                                                onClick={() => handleRemoveOption(index)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Question ouverte / Rédaction */}
                {["TEXT", "ESSAY"].includes(type) && (
                    <div className="bg-blue-50/70 border border-blue-200 text-blue-900 p-4 rounded-xl text-sm flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Zone de réponse libre ({type === "TEXT" ? "Texte court" : "Rédaction / Dissertation"}) :</p>
                            <p className="mt-1 text-blue-800/90 text-xs leading-relaxed">
                                Les étudiants disposeront d'un champ de saisie pour répondre avec leurs propres mots. Vous pourrez évaluer leurs réponses manuellement dans le tableau des soumissions.
                            </p>
                        </div>
                    </div>
                )}

                {/* Explication / Correction pédagogique */}
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Explication ou correction pédagogique (facultatif) :
                    </Label>
                    <Textarea
                        className="min-h-[80px] text-xs resize-y p-3 bg-muted/10"
                        placeholder="Ex: La clause HAVING s'applique après l'agrégation (GROUP BY), contrairement à WHERE qui filtre avant..."
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                    />
                </div>
            </CardContent>

            <Separator />

            <CardFooter className="p-5 flex justify-between items-center bg-muted/20 border-t">
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={!question?.id || isSaving}
                    className="h-9 px-4 text-xs font-medium"
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Supprimer cette question
                </Button>

                <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-9 px-6 font-bold min-w-[120px] shadow-sm"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Enregistrement..." : "Sauvegarder la question"}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default QuestionDetail;
