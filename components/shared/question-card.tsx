"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "../ui/item";
import { ChevronRightIcon, Plus, HelpCircle, CheckCircle2 } from "lucide-react";
import { questions as questionsTable } from '@/db/schema';
import { cn } from '@/lib/utils';

type QuestionType = typeof questionsTable.$inferSelect;

interface QuestionCardProps {
    questions: QuestionType[];
    selectedQuestion: QuestionType | null;
    onAddQuestion: () => void;
    onSelectQuestion: (question: QuestionType) => void;
    maxScore?: number;
}

function getTypeBadge(type: string) {
    switch (type) {
        case "SINGLE_CHOICE":
            return <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Choix unique</Badge>;
        case "MULTIPLE_CHOICE":
            return <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">Choix multiple</Badge>;
        case "TRUE_FALSE":
            return <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Vrai / Faux</Badge>;
        case "TEXT":
            return <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Texte court</Badge>;
        case "ESSAY":
            return <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200">Rédaction</Badge>;
        default:
            return <Badge variant="outline" className="text-[10px]">{type}</Badge>;
    }
}

function QuestionCard({ questions, selectedQuestion, onAddQuestion, onSelectQuestion, maxScore }: QuestionCardProps) {
    const totalPoints = questions.reduce((sum, q) => sum + (parseFloat(q.points) || 0), 0);

    return (
        <Card className="w-full lg:w-72 shrink-0 h-fit shadow-sm border">
            <CardHeader className="flex flex-row justify-between items-center pb-3 p-4 bg-muted/20 border-b">
                <div>
                    <CardTitle className="text-base font-bold flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        Plan du Quiz
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {questions.length} Q. • {totalPoints} / {maxScore ?? 20} pts
                    </p>
                </div>
                <Button size="sm" onClick={onAddQuestion} className="h-8 px-2 text-xs font-semibold">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Ajouter
                </Button>
            </CardHeader>
            <CardContent className="p-2.5 flex flex-col gap-2 max-h-[600px] overflow-y-auto">
                {questions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                        <HelpCircle className="w-8 h-8 text-muted-foreground/30" />
                        <p>Aucune question.</p>
                        <Button variant="outline" size="sm" onClick={onAddQuestion} className="mt-1 text-xs h-7">
                            <Plus className="mr-1 h-3 w-3" /> Créer la 1ère
                        </Button>
                    </div>
                ) : (
                    questions.map((question, index) => {
                        const isSelected = selectedQuestion?.id === question.id;
                        return (
                            <Item
                                key={question.id || index}
                                render={
                                    <div
                                        onClick={() => onSelectQuestion(question)}
                                        className={cn(
                                            "cursor-pointer p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2",
                                            isSelected
                                                ? "bg-primary/10 border-primary shadow-xs font-semibold"
                                                : "hover:bg-muted/60 border-transparent hover:border-border"
                                        )}
                                    >
                                        <ItemContent className="overflow-hidden">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="font-bold text-xs font-mono text-muted-foreground">
                                                    Q{index + 1}.
                                                </span>
                                                {getTypeBadge(question.type)}
                                                <span className="ml-auto text-[11px] font-bold text-muted-foreground font-mono">
                                                    {question.points} pt{parseFloat(question.points) > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <ItemTitle className="text-xs font-medium text-foreground line-clamp-1">
                                                {question.prompt || "Sans titre..."}
                                            </ItemTitle>
                                        </ItemContent>
                                        <ItemActions>
                                            <ChevronRightIcon className={cn("size-4 transition-transform", isSelected ? "text-primary translate-x-0.5" : "text-muted-foreground")} />
                                        </ItemActions>
                                    </div>
                                }
                            />
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}


export default QuestionCard;