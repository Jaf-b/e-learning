"use client"

import * as React from "react"
import * as schema from "@/db/schema"

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
} from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Edit2, Trash } from "lucide-react"

type Course = {
    id: string
    filiereId?: string
    degreeLevelId?: string
    code: string
    title: string
    description?: string
    credits?: number
    status?: string
    authorId?: string
    createdAt?: string
}

type CoursesTableProps = {
    courses?: Course[]
    pageSize?: number
}

export default function CoursesTable({ courses = [], pageSize = 10 }: CoursesTableProps) {
    const codeKey = (schema.courses.code as any).name ?? "code"
    const titleKey = (schema.courses.title as any).name ?? "title"
    const creditsKey = (schema.courses.credits as any).name ?? "credits"
    const statusKey = (schema.courses.status as any).name ?? "status"

    const [pageIndex, setPageIndex] = React.useState(0)

    React.useEffect(() => setPageIndex(0), [courses])

    const pageCount = Math.max(1, Math.ceil(courses.length / pageSize))
    const start = pageIndex * pageSize
    const pageItems = courses.slice(start, start + pageSize)

    function gotoPage(i: number) {
        if (i < 0) i = 0
        if (i >= pageCount) i = pageCount - 1
        setPageIndex(i)
    }

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>{codeKey}</TableHead>
                        <TableHead>{titleKey}</TableHead>
                        <TableHead>{creditsKey}</TableHead>
                        <TableHead>{statusKey}</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {pageItems.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                                No courses found
                            </TableCell>
                        </TableRow>
                    ) : (
                        pageItems.map((c, i) => (
                            <TableRow key={c.id}>
                                <TableCell>{start + i + 1}</TableCell>
                                <TableCell>{c.code}</TableCell>
                                <TableCell>{c.title}</TableCell>
                                <TableCell>{c.credits ?? "—"}</TableCell>
                                <TableCell className="capitalize">{c.status ?? "DRAFT"}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="ghost" className="px-2">
                                            <Edit2 className="size-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="px-2">
                                            <Trash className="size-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>

                <TableCaption>
                    Showing {courses.length} course{courses.length !== 1 ? "s" : ""}
                </TableCaption>
            </Table>

            <Pagination className="mt-4">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious onClick={() => gotoPage(pageIndex - 1)} text="Prev" />
                    </PaginationItem>

                    {Array.from({ length: pageCount }).map((_, i) => (
                        <PaginationItem key={i}>
                            <PaginationLink isActive={i === pageIndex} onClick={() => gotoPage(i)}>
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext onClick={() => gotoPage(pageIndex + 1)} text="Next" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
