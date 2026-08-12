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

type Department = {
  id: string
  facultyId: string
  code: string
  name: string
}

type Faculty = {
  id: string
  name?: string
}

type DepartementTableProps = {
  faculty: Faculty
  departments?: Department[]
  pageSize?: number
}

export default function DepartementTable({ faculty, departments = [], pageSize = 10 }: DepartementTableProps) {
  const nameColumnKey = (schema.departments.name as any).name ?? "name"
  const codeColumnKey = (schema.departments.code as any).name ?? "code"

  const filtered = React.useMemo(() => departments.filter((d) => d.facultyId === faculty.id), [departments, faculty.id])
  const [pageIndex, setPageIndex] = React.useState(0)

  React.useEffect(() => {
    // reset page if faculty or data changes
    setPageIndex(0)
  }, [faculty.id, departments])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const start = pageIndex * pageSize
  const end = start + pageSize
  const pageItems = filtered.slice(start, end)

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
            <TableHead>{codeColumnKey}</TableHead>
            <TableHead>{nameColumnKey}</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                No departments found for {faculty.name ?? faculty.id}
              </TableCell>
            </TableRow>
          ) : (
            pageItems.map((d, i) => (
              <TableRow key={d.id}>
                <TableCell>{start + i + 1}</TableCell>
                <TableCell>{d.code}</TableCell>
                <TableCell>{d.name}</TableCell>
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
          Showing {filtered.length} department{filtered.length !== 1 ? "s" : ""} for {faculty.name ?? faculty.id}
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
