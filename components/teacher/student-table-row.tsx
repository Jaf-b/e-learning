import React from 'react'
import { TableRow, TableCell } from "@/components/ui/table"
import {StudentBadgeInfo} from "@/components/teacher/student-badge-info";

export interface Student {
    id: string;
    registrationNumber: string;
    fullName: string;
    filiere: string;
    promotion: string;
    email: string;
}

interface StudentTableRowProps {
    student: Student;
    onSelect?: (studentId: string) => void;
}

export const StudentTableRow: React.FC<StudentTableRowProps> = ({ student, onSelect }) => {
    return (
        <TableRow
            onClick={() => onSelect && onSelect(student.id)}
            className="cursor-pointer hover:bg-muted/50"
        >
            <TableCell className="font-mono text-xs font-medium text-muted-foreground whitespace-nowrap">
                {student.registrationNumber}
            </TableCell>
            <TableCell className="font-semibold whitespace-nowrap">
                {student.fullName}
            </TableCell>
            <TableCell>
                <StudentBadgeInfo filiere={student.filiere} promotion={student.promotion} />
            </TableCell>
            <TableCell className="text-muted-foreground whitespace-nowrap">
                {student.email}
            </TableCell>
        </TableRow>
    )
}