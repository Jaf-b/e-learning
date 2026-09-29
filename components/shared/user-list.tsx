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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AddUserDialog from "./add-user-dialog";
import { deleteUser } from "@/lib/action/user.actions";
import { Pencil, Trash2, Shield, GraduationCap, BookOpen, Clock, UserCheck, Inbox, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  isActive?: boolean | null;
  lastLoginAt?: Date | null;
};

type UserListProps = {
  users: User[];
  onRefresh?: () => Promise<void> | void;
};

export default function UserList({ users, onRefresh }: UserListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const usersPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(users.length / usersPerPage));
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer l'utilisateur "${name}" ? Cette action est irréversible.`)) return;

    setDeletingId(id);
    try {
      const response = await deleteUser(id);
      if (response.success) {
        toast.add({ type: "success", description: `Utilisateur "${name}" supprimé avec succès.` });
        if (onRefresh) await onRefresh();
      } else {
        toast.add({ type: "error", description: response.error || "Impossible de supprimer cet utilisateur." });
      }
    } catch (err: any) {
      toast.add({ type: "error", description: err?.message || "Erreur lors de la suppression." });
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800 flex items-center gap-1 font-semibold text-[11px] w-fit">
            <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            Admin
          </Badge>
        );
      case "TEACHER":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 flex items-center gap-1 font-semibold text-[11px] w-fit">
            <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Enseignant
          </Badge>
        );
      case "STUDENT":
        return (
          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800 flex items-center gap-1 font-semibold text-[11px] w-fit">
            <GraduationCap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Étudiant
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-border/80 rounded-2xl bg-card">
        <Inbox className="w-12 h-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-base font-bold text-foreground">Aucun utilisateur trouvé</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Aucun compte d'utilisateur ne correspond à vos critères actuels.
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
              <TableHead className="font-semibold text-xs py-3.5">Utilisateur</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Rôle</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Statut</TableHead>
              <TableHead className="font-semibold text-xs py-3.5">Dernière Connexion</TableHead>
              <TableHead className="font-semibold text-xs py-3.5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.map((userItem) => (
              <TableRow key={userItem.id} className="hover:bg-muted/30 transition-colors">
                {/* User Info (Avatar + Name + Email) */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={userItem.image || undefined} alt={userItem.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {getInitials(userItem.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground">{userItem.name}</span>
                      <span className="text-xs text-muted-foreground">{userItem.email}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Role */}
                <TableCell className="py-3">{getRoleBadge(userItem.role)}</TableCell>

                {/* Status */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        userItem.isActive !== false ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                    <span>{userItem.isActive !== false ? "Actif" : "Inactif"}</span>
                  </div>
                </TableCell>

                {/* Last Login */}
                <TableCell className="py-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <span>
                      {userItem.lastLoginAt
                        ? new Date(userItem.lastLoginAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Jamais connecté"}
                    </span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <AddUserDialog user={userItem as any} onSuccess={onRefresh}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Modifier l'utilisateur">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </AddUserDialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      onClick={() => handleDelete(userItem.id, userItem.name)}
                      disabled={deletingId === userItem.id}
                      title="Supprimer l'utilisateur"
                    >
                      {deletingId === userItem.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Footer pagination info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/60 bg-muted/20 text-xs text-muted-foreground">
          <div>
            Affichage de <span className="font-semibold text-foreground">{indexOfFirstUser + 1}</span> à{" "}
            <span className="font-semibold text-foreground">
              {Math.min(indexOfLastUser, users.length)}
            </span>{" "}
            sur <span className="font-semibold text-foreground">{users.length}</span> utilisateur
            {users.length > 1 ? "s" : ""}
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