import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {GradeTableRow} from "@/components/teacher/grade-table-row";
import {StudentGradeOverview} from "@/types/academic";

interface GradeTableProps {
    records: StudentGradeOverview[];
}

export const GradeTable: React.FC<GradeTableProps> = ({ records }) => {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[35%]">Étudiant</TableHead>
                        <TableHead className="text-center w-[20%]">Interrogations (QUIZ)</TableHead>
                        <TableHead className="text-center w-[20%]">Travaux Pratiques (TP)</TableHead>
                        <TableHead className="text-center w-[20%]">Examens (EXAM)</TableHead>
                        <TableHead className="text-right w-[100px]">Moyenne</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.length > 0 ? (
                        records.map((record,index) => (
                            <GradeTableRow key={index} record={record} />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                Aucune note enregistrée.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};