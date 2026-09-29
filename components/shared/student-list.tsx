"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { GraduationCap, BookOpen, Calendar, Inbox } from "lucide-react";

type Student = {
  id: string;
  name: string;
  email: string;
  enrollment?: {
    promotion?: {
      code?: string;
      degreeLevel?: {
        name?: string;
        degree?: {
          name?: string;
        };
      };
      academicYear?: {
        year?: string;
      };
    };
  };
};

type StudentListProps = {
  students: Student[];
};

export default function StudentList({ students }: StudentListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(students.length / studentsPerPage));
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "E";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-border/80 rounded-2xl bg-card">
        <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-base font-bold text-foreground">Aucun étudiant inscrit</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Aucun étudiant n'est inscrit dans cette liste actuellement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-xs py-3.5">Étudiant</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Promotion</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Diplôme & Niveau</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Année Académique</TableHead>
              <TableHead className="font-semibold text-xs py-3.5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStudents.map((student) => {
              const promoCode = student.enrollment?.promotion?.code;
              const degreeName = student.enrollment?.promotion?.degreeLevel?.degree?.name;
              const levelName = student.enrollment?.promotion?.degreeLevel?.name;
              const academicYear = student.enrollment?.promotion?.academicYear?.year;

              return (
                <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                  {/* Student Info */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-foreground">{student.name}</span>
                        <span className="text-xs text-muted-foreground">{student.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Promotion Code */}
                  <TableCell className="py-3">
                    {promoCode ? (
                      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-mono text-xs">
                        {promoCode}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Non inscrit</span>
                    )}
                  </TableCell>

                  {/* Degree & Level */}
                  <TableCell className="py-3">
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-foreground">{degreeName || "N/A"}</span>
                      <span className="text-muted-foreground">{levelName || "N/A"}</span>
                    </div>
                  </TableCell>

                  {/* Academic Year */}
                  <TableCell className="py-3 text-xs text-muted-foreground">
                    {academicYear ? (
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/60" />
                        <span>{academicYear}</span>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium">
                        Détails
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Footer pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
          <div>
            Affichage de <span className="font-semibold text-foreground">{indexOfFirstStudent + 1}</span> à{" "}
            <span className="font-semibold text-foreground">
              {Math.min(indexOfLastStudent, students.length)}
            </span>{" "}
            sur <span className="font-semibold text-foreground">{students.length}</span> étudiant
            {students.length > 1 ? "s" : ""}
          </div>

          {totalPages > 1 && (
            <Pagination className="m-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(i + 1)}
                      isActive={currentPage === i + 1}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}