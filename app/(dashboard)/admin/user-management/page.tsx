"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Header from "@/components/shared/header";
import UserList from "@/components/shared/user-list";
import StudentList from "@/components/shared/student-list";
import AddUserDialog from "@/components/shared/add-user-dialog";
import StudentDialog from "@/components/shared/student-dialog";
import { getAllUsers } from "@/lib/action/user.actions";
import { getPromotions } from "@/lib/action/promotions.actions";
import { enrollStudent } from "@/lib/action/student-enrollement.actions";
import { User, Promotion } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, GraduationCap, ShieldCheck, Search, Plus, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type RoleFilter = "ALL" | "TEACHER" | "STUDENT" | "ADMIN";

export default function UserManagementPage() {
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Stabilisation de la fonction d'acquisition de données
  const loadData = useCallback(async () => {
    try {
      const [usersResponse, promotionsResponse] = await Promise.all([
        getAllUsers(),
        getPromotions(),
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
      }
      if (promotionsResponse.success) {
        setPromotions(promotionsResponse.data || []);
      }
    } catch (error) {
      console.error("Error loading user management data:", error);
      toast.add({ type: "error", description: "Impossible de charger les données des utilisateurs." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  // 2. Correction de la syntaxe d'appel async dans useEffect
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await loadData();
    toast.add({ type: "success", description: "Liste des utilisateurs actualisée." });
  };

  const handleEnrollStudent = async (enrollment: { studentId: string; promotionId: string }) => {
    const response = await enrollStudent(enrollment);
    if (response.success) {
      toast.add({ type: "success", description: "Inscription de l'étudiant enregistrée avec succès." });
      await loadData();
    } else {
      toast.add({ type: "error", description: response.error || "Échec de l'inscription." });
    }
  };

  // 3. Mémorisation des statistiques (calcul unique par changement du tableau `users`)
  const metrics = useMemo(() => {
    const counts = { total: users.length, TEACHER: 0, STUDENT: 0, ADMIN: 0 };
    for (const u of users) {
      if (u.role in counts) {
        counts[u.role as keyof typeof counts]++;
      }
    }
    return counts;
  }, [users]);

  // 4. Mémorisation et optimisation de la recherche/filtrage
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = role === "ALL" || user.role === role;
      if (!matchesRole) return false;

      if (!query) return true;
      return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    });
  }, [users, role, searchQuery]);

  return (
      <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        {/* Top Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Header
              title="Gestion des Utilisateurs"
              description="Gérez l'ensemble des comptes utilisateurs, attributions des rôles et inscriptions."
          />
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={refreshing || loading}
                className="text-xs gap-1.5 font-medium"
                title="Actualiser les utilisateurs"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", (refreshing || loading) && "animate-spin")} />
              Rafraîchir
            </Button>
            <StudentDialog promotions={promotions} onSave={handleEnrollStudent} />
            <AddUserDialog onSuccess={loadData}>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
                <Plus className="w-4 h-4" />
                Ajouter un Utilisateur
              </Button>
            </AddUserDialog>
          </div>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Utilisateurs</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{metrics.total}</p>
              <p className="text-[11px] text-muted-foreground">Comptes enregistrés</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Enseignants</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{metrics.TEACHER}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Corps professoral</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Étudiants</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{metrics.STUDENT}</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Inscrits aux parcours</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Administrateurs</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{metrics.ADMIN}</p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Gestionnaires système</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          {/* Role Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/50 border border-border/60 rounded-xl overflow-x-auto">
            {(
                [
                  { key: "ALL", label: `Tous (${metrics.total})` },
                  { key: "TEACHER", label: `Enseignants (${metrics.TEACHER})` },
                  { key: "STUDENT", label: `Étudiants (${metrics.STUDENT})` },
                  { key: "ADMIN", label: `Admins (${metrics.ADMIN})` },
                ] as const
            ).map(({ key, label }) => (
                <button
                    key={key}
                    onClick={() => setRole(key)}
                    className={cn(
                        "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                        role === key
                            ? "bg-card text-foreground shadow-xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                  {label}
                </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Rechercher par nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Main Table Content */}
        {role === "STUDENT" ? (
            <div className="space-y-4">
              <StudentList students={filteredUsers as any} />
            </div>
        ) : (
            <UserList users={filteredUsers} />
        )}
      </div>
  );
}