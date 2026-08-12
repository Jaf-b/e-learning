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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import React from "react";
import AddUserDialog from "./add-user-dialog";
import { deleteUser } from "@/lib/action/user.actions";
import {Pencil} from "lucide-react";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  isActive: boolean;
  lastLoginAt: Date;
};

type UserListProps = {
  users: User[];
};

const UserList = ({ users }: UserListProps) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const usersPerPage = 5;
    const totalPages = Math.ceil(users.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    }

    const handleDelete = async (id: string) => {
        await deleteUser(id);
    }


  return (
      <div>
          <Table>
              <TableCaption>A list of your recent users.</TableCaption>
              <TableHeader>
                  <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {currentUsers.map((user) => (
                      <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{user.isActive ? "Yes" : "No"}</TableCell>
                          <TableCell>{new Date(user.lastLoginAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                              <AddUserDialog user={user}>
                                  <Button variant="ghost" size="icon"><Pencil className="size-4" /></Button>
                              </AddUserDialog>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
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

export default UserList;