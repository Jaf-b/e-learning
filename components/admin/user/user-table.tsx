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

type User = {
  id: string
  name?: string
  email: string
  role?: string
  isActive?: boolean
  createdAt?: string
}

type UserTableProps = {
  users?: User[]
  pageSize?: number
}

export default function UserTable({ users = [], pageSize = 10 }: UserTableProps) {
  const nameKey = (schema.user.name as any).name ?? "name"
  const emailKey = (schema.user.email as any).name ?? "email"
  const roleKey = (schema.user.role as any).name ?? "role"

  const [pageIndex, setPageIndex] = React.useState(0)

  React.useEffect(() => setPageIndex(0), [users])

  const pageCount = Math.max(1, Math.ceil(users.length / pageSize))
  const start = pageIndex * pageSize
  const pageItems = users.slice(start, start + pageSize)

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
            <TableHead>{nameKey}</TableHead>
            <TableHead>{emailKey}</TableHead>
            <TableHead>{roleKey}</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {pageItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            pageItems.map((u, i) => (
              <TableRow key={u.id}>
                <TableCell>{start + i + 1}</TableCell>
                <TableCell>{u.name ?? "—"}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell className="capitalize">{u.role ?? "student"}</TableCell>
                <TableCell>{u.isActive ? "Yes" : "No"}</TableCell>
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
          Showing {users.length} user{users.length !== 1 ? "s" : ""}
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
