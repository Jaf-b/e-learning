import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText } from "lucide-react";
import { AssessmentRecord, AssessmentType } from '@/types/academic';

interface EvaluationListProps {
    assessments: AssessmentRecord[];
    onEdit?: (assessment: AssessmentRecord) => void;
    onDelete?: (id: string) => void;
    onSelect?: (assessment: AssessmentRecord) => void;
}

export const EvaluationList: React.FC<EvaluationListProps> = ({
                                                                  assessments,
                                                                  onEdit,
                                                                  onDelete,
                                                                  onSelect,
                                                              }) => {
    const renderTypeBadge = (type: AssessmentType) => {
        switch (type) {
            case 'EXAM':
                return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Examen</Badge>;
            case 'RETAKE_EXAM':
                return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Rattrapage</Badge>;
            case 'TP':
                return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Travail Pratique</Badge>;
            case 'QUIZ':
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Interrogation</Badge>;
            case 'ASSIGNMENT':
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Devoir</Badge>;
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Titre & Cours</TableHead>
                        <TableHead>Type (`assessmentTypeEnum`)</TableHead>
                        <TableHead className="text-center">Note Max (`maxScore`)</TableHead>
                        <TableHead className="text-center">Coefficient (`weight`)</TableHead>
                        <TableHead>Date Limite (`dueDate`)</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assessments.length > 0 ? (
                        assessments.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                                <TableCell className="whitespace-nowrap">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-muted rounded-md text-muted-foreground">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div
                                                onClick={() => onEdit ? onEdit(item) : (onSelect && onSelect(item))}
                                                className="font-semibold text-foreground hover:underline cursor-pointer"
                                            >
                                                {item.title}
                                            </div>
                                            {item.courseTitle && (
                                                <div className="text-xs text-muted-foreground">
                                                    {item.courseTitle}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="whitespace-nowrap">
                                    {renderTypeBadge(item.type)}
                                </TableCell>

                                <TableCell className="text-center font-mono text-xs font-semibold whitespace-nowrap">
                                    /{item.maxScore} pts
                                </TableCell>

                                <TableCell className="text-center font-mono text-xs whitespace-nowrap">
                                    {item.weight}
                                </TableCell>

                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {item.dueDate ? item.dueDate : 'Non définie'}
                                </TableCell>

                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>


                                        <DropdownMenuContent align="end">
                                            <DropdownMenuGroup>
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => onEdit ? onEdit(item) : (onSelect && onSelect(item))}>
                                                    Éditer / Modifier le quiz
                                                </DropdownMenuItem>
                                                {onSelect && (
                                                    <DropdownMenuItem onClick={() => onSelect(item)}>
                                                        Saisir des notes
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuGroup>

                                            <DropdownMenuSeparator />

                                            <DropdownMenuGroup>
                                                <DropdownMenuItem
                                                    onClick={() => onDelete && onDelete(item.id)}
                                                    className="text-rose-600 focus:text-rose-600 cursor-pointer font-medium"
                                                >
                                                    Supprimer l'évaluation
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>

                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                Aucune évaluation enregistrée.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};