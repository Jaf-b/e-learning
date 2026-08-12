import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, X } from "lucide-react";
import { StudentGradeOverview } from "@/types/academic";
import { useParams } from "next/navigation";
import {updateStudentCourseGrades} from "@/lib/action/courses.actions";

interface GradeTableRowProps {
    record: StudentGradeOverview;
    onSave?: (record: StudentGradeOverview) => void;
}

export const GradeTableRow: React.FC<GradeTableRowProps> = ({
                                                                record,
                                                                onSave,
                                                            }) => {
    const params = useParams();

    const courseId = params.id as string;
    const [editing, setEditing] = useState(false);

    const [values, setValues] = useState({
        quizScore: record.quizScore,
        tpScore: record.tpScore,
        examScore: record.examScore,
    });

    const renderGradeBadge = (score: number | null) => {
        if (score === null || score === undefined) {
            return (
                <Badge
                    variant="outline"
                    className="w-12 justify-center font-mono text-muted-foreground"
                >
                    --
                </Badge>
            );
        }

        const passed = score >= 10;

        return (
            <Badge
                variant="outline"
                className={`w-12 justify-center font-mono font-bold ${
                    passed
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
            >
                {score.toFixed(1)}
            </Badge>
        );
    };

    const handleChange = (
        field: "quizScore" | "tpScore" | "examScore",
        value: string
    ) => {
        setValues((prev) => ({
            ...prev,
            [field]: value === "" ? null : Number(value),
        }));
    };

    const handleCancel = () => {
        setValues({
            quizScore: record.quizScore,
            tpScore: record.tpScore,
            examScore: record.examScore,
        });
        setEditing(false);
    };

    const handleSave = async () => {
        try {
            onSave?.({
                ...record,
                ...values,
            });

            const result = await updateStudentCourseGrades({
                courseId:courseId,
                studentEnrollmentId: record.studentEnrollmentId,
                ...values
            })

            console.log(result)

        }catch (e) {
            setEditing(false);
            console.error(e);
        }
        setEditing(false);
    };

    const validScores = [
        values.quizScore,
        values.tpScore,
        values.examScore,
    ].filter((v): v is number => v !== null);

    const average =
        validScores.length > 0
            ? validScores.reduce((a, b) => a + b, 0) / validScores.length
            : null;

    const renderEditableCell = (
        field: "quizScore" | "tpScore" | "examScore"
    ) => {
        if (!editing) {
            return renderGradeBadge(values[field]);
        }

        return (
            <Input
                type="number"
                min={0}
                max={20}
                step={0.1}
                value={values[field] ?? ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-20 text-center"
            />
        );
    };

    return (
        <TableRow>
            <TableCell>
                <div className="flex flex-col">
                    <span className="font-medium">{record.studentName}</span>

                    <span className="text-xs text-muted-foreground">
            {record.filiereCode} • {record.promotionCode}
          </span>
                </div>
            </TableCell>

            <TableCell className="text-center">
                {renderEditableCell("quizScore")}
            </TableCell>

            <TableCell className="text-center">
                {renderEditableCell("tpScore")}
            </TableCell>

            <TableCell className="text-center">
                {renderEditableCell("examScore")}
            </TableCell>

            <TableCell className="text-center">
                {average !== null ? (
                    <span className="rounded-md bg-muted px-2 py-1 font-mono font-bold">
            {average.toFixed(2)}
          </span>
                ) : (
                    "--"
                )}
            </TableCell>

            <TableCell className="text-right">
                {editing ? (
                    <div className="flex justify-end gap-2">
                        <Button size="icon" onClick={handleSave}>
                            <Check className="h-4 w-4" />
                        </Button>

                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handleCancel}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setEditing(true)}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
};