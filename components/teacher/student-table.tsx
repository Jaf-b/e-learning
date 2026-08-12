import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StudentRecord } from '@/types/academic';

interface StudentTableProps {
    students: StudentRecord[];
}

export const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

    const renderStatusBadge = (status: StudentRecord['enrollmentStatus']) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Actif</Badge>;
            case 'PASSED':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Admis</Badge>;
            case 'FAILED':
                return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Ajourné</Badge>;
            case 'GRADUATED':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Diplômé</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Étudiant</TableHead>
                        <TableHead>Filière & Promotion</TableHead>
                        <TableHead>Année Académique</TableHead>
                        <TableHead>Statut Inscription</TableHead>
                        <TableHead className="text-right">Contact</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student.id}>
                            {/* Utilisateur */}
                            <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={student.image || undefined} alt={student.name} />
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                                            {getInitials(student.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-foreground">{student.name}</span>
                                </div>
                            </TableCell>

                            {/* Filière (filieres) & Promotion (promotions/degreeLevels) */}
                            <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {student.filiere.name} ({student.filiere.code})
                                    </Badge>
                                    <Badge variant="outline" className="text-purple-700 bg-purple-50/50 border-purple-200">
                                        {student.promotion.code}
                                    </Badge>
                                </div>
                            </TableCell>

                            {/* Année Académique (academicYears) */}
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                {student.promotion.academicYear}
                            </TableCell>

                            {/* Statut (studentEnrollments.status) */}
                            <TableCell className="whitespace-nowrap">
                                {renderStatusBadge(student.enrollmentStatus)}
                            </TableCell>

                            {/* Contact (user.email) */}
                            <TableCell className="text-right text-xs font-mono text-muted-foreground whitespace-nowrap">
                                {student.email}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};