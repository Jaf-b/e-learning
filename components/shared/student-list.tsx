"use client"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import React from "react";

type Student = {
    id: string;
    name: string;
    email: string;
    enrollment: {
        promotion: {
            code: string;
            degreeLevel: {
                name: string;
                degree: {
                    name: string;
                }
            }
            academicYear: {
                year: string;
            }
        }
    }
};

type StudentListProps = {
  students: Student[];
};

const StudentList = ({ students }: StudentListProps) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const studentsPerPage = 5;
    const totalPages = Math.ceil(students.length / studentsPerPage);
    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    }


  return (
      <div>
          <Table>
              <TableCaption>A list of your students.</TableCaption>
              <TableHeader>
                  <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Promotion</TableHead>
                      <TableHead>Degree</TableHead>
                      <TableHead>Degree Level</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {currentStudents.map((student) => (
                      <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.enrollment.promotion.code}</TableCell>
                          <TableCell>{student.enrollment.promotion.degreeLevel.degree.name}</TableCell>
                          <TableCell>{student.enrollment.promotion.degreeLevel.name}</TableCell>
                          <TableCell>{student.enrollment.promotion.academicYear.year}</TableCell>
                          <TableCell>
                              <Button variant="outline" size="sm" className="mr-2">
                                  Edit
                              </Button>
                              <Button variant="destructive" size="sm">
                                  Delete
                              </Button>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
          <Pagination>
              <PaginationContent>
                  <PaginationItem>
                      <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                          <PaginationLink onClick={() => handlePageChange(i + 1)} isActive={currentPage === i + 1}>
                              {i + 1}
                          </PaginationLink>
                      </PaginationItem>
                  ))}
                  <PaginationItem>
                      <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                  </PaginationItem>
              </PaginationContent>
          </Pagination>
      </div>
  );
};

export default StudentList;