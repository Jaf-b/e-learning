"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FacultyWithTree, Faculty, Department, Filiere } from "@/types";
import FacultyDialog from "@/components/shared/faculty-dialog";
import DepartmentDialog from "@/components/shared/department-dialog";
import FiliereDialog from "@/components/shared/filiere-dialog";
import {
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from "@/lib/action/faculty.actions";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/lib/action/departement.actions";
import {
  createFiliere,
  updateFiliere,
  deleteFiliere,
} from "@/lib/action/filieres.actions";
import { toast } from "@/components/ui/toast";
import {
  Landmark,
  GitFork,
  GraduationCap,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  Inbox,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FacultyTreeProps {
  Facultytree: FacultyWithTree[];
  faculties: Faculty[];
  departments: Department[];
  filieres: Filiere[];
  onRefresh?: () => Promise<void> | void;
}

export default function FacultyTree({
  Facultytree,
  faculties,
  departments,
  filieres,
  onRefresh,
}: FacultyTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaculties, setExpandedFaculties] = useState<Record<string, boolean>>(() => {
    // Expand all faculties by default
    const init: Record<string, boolean> = {};
    Facultytree?.forEach((f) => {
      init[f.id] = true;
    });
    return init;
  });

  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    Facultytree?.forEach((f) => {
      f.departments?.forEach((d) => {
        init[d.id] = true;
      });
    });
    return init;
  });

  const toggleFaculty = (id: string) => {
    setExpandedFaculties((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDept = (id: string) => {
    setExpandedDepts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const facs: Record<string, boolean> = {};
    const depts: Record<string, boolean> = {};
    Facultytree?.forEach((f) => {
      facs[f.id] = true;
      f.departments?.forEach((d) => {
        depts[d.id] = true;
      });
    });
    setExpandedFaculties(facs);
    setExpandedDepts(depts);
  };

  const collapseAll = () => {
    setExpandedFaculties({});
    setExpandedDepts({});
  };

  // Handlers for Faculty
  const handleSaveFaculty = async (facultyData: any) => {
    try {
      if (facultyData.id) {
        const res = await updateFaculty(facultyData.id, facultyData);
        if (res.success) {
          toast.add({ type: "success", description: `Faculté "${facultyData.name}" mise à jour.` });
        } else {
          toast.add({ type: "error", description: res.error || "Échec de la modification." });
        }
      } else {
        const res = await createFaculty(facultyData);
        if (res.success) {
          toast.add({ type: "success", description: `Faculté "${facultyData.name}" créée.` });
        } else {
          toast.add({ type: "error", description: res.error || "Échec de la création." });
        }
      }
      if (onRefresh) await onRefresh();
    } catch (e) {
      console.error(e);
      toast.add({ type: "error", description: "Une erreur est survenue." });
    }
  };

  const handleDeleteFaculty = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la faculté "${name}" ? Ses départements et filières associés peuvent être affectés.`)) return;
    try {
      const res = await deleteFaculty(id);
      if (res.success) {
        toast.add({ type: "success", description: `Faculté "${name}" supprimée.` });
        if (onRefresh) await onRefresh();
      } else {
        toast.add({ type: "error", description: res.error || "Impossible de supprimer cette faculté." });
      }
    } catch (e) {
      console.error(e);
      toast.add({ type: "error", description: "Erreur lors de la suppression." });
    }
  };

  // Handlers for Department
  const handleSaveDepartment = async (deptData: any) => {
    try {
      if (deptData.id) {
        const res = await updateDepartment(deptData.id, deptData);
        if (res.success) {
          toast.add({ type: "success", description: `Département "${deptData.name}" mis à jour.` });
        } else {
          toast.add({ type: "error", description: res.error || "Échec de la modification." });
        }
      } else {
        const res = await createDepartment(deptData);
        if (res.success) {
          toast.add({ type: "success", description: `Département "${deptData.name}" créé.` });
        } else {
          toast.add({ type: "error", description: res.error || "Échec de la création." });
        }
      }
      if (onRefresh) await onRefresh();
    } catch (e) {
      console.error(e);
      toast.add({ type: "error", description: "Une erreur est survenue." });
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer le département "${name}" ?`)) return;
    try {
      const res = await deleteDepartment(id);
      if (res.success) {
        toast.add({ type: "success", description: `Département "${name}" supprimé.` });
        if (onRefresh) await onRefresh();
      } else {
        toast.add({ type: "error", description: res.error || "Impossible de supprimer ce département." });
      }
    } catch (e) {
      console.error(e);
      toast.add({ type: "error", description: "Erreur lors de la suppression." });
    }
  };

  // Handlers for Filiere
  const handleSaveFiliere = async (filData: any) => {
    try {
      if (filData.id) {
        const res = await updateFiliere(filData.id, filData);
        if (res.success) {
          toast.add({ type: "success", description: `Filière "${filData.name}" mise à jour.` });
        } else {
          toast.add({ type: "error", description: res.error || "Échec de la modification." });
        }
      } else {
        const res = await createFiliere(filData);
        if (res.success) {
          toast.add({ type: "success", description: `Filière "${filData.name}" créée.` });
        } else {
          toast.add({ type: "error", description: res.error || "Échec de la création." });
        }
      }
      if (onRefresh) await onRefresh();
    } catch (e) {
      console.error(e);
      toast.add({ type: "error", description: "Une erreur est survenue." });
    }
  };

  const handleDeleteFiliere = async (id: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer la filière "${name}" ?`)) return;
    try {
      const res = await deleteFiliere(id);
      if (res.success) {
        toast.add({ type: "success", description: `Filière "${name}" supprimée.` });
        if (onRefresh) await onRefresh();
      } else {
        toast.add({ type: "error", description: res.error || "Impossible de supprimer cette filière." });
      }
    } catch (e) {
      console.error(e);
      toast.add({ type: "error", description: "Erreur lors de la suppression." });
    }
  };

  // Filtered Tree according to search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return Facultytree || [];
    const query = searchQuery.trim().toLowerCase();

    return (Facultytree || [])
      .map((fac) => {
        const facMatches =
          fac.name.toLowerCase().includes(query) ||
          fac.code.toLowerCase().includes(query) ||
          (fac.description && fac.description.toLowerCase().includes(query));

        const matchedDepts = (fac.departments || [])
          .map((dept) => {
            const deptMatches =
              dept.name.toLowerCase().includes(query) ||
              dept.code.toLowerCase().includes(query) ||
              (dept.description && dept.description.toLowerCase().includes(query));

            const matchedFilieres = (dept.filieres || []).filter(
              (fil) =>
                fil.name.toLowerCase().includes(query) ||
                fil.code.toLowerCase().includes(query) ||
                (fil.description && fil.description.toLowerCase().includes(query))
            );

            if (deptMatches || matchedFilieres.length > 0) {
              return {
                ...dept,
                filieres: deptMatches ? dept.filieres : matchedFilieres,
              };
            }
            return null;
          })
          .filter(Boolean) as any[];

        if (facMatches || matchedDepts.length > 0) {
          return {
            ...fac,
            departments: facMatches ? fac.departments : matchedDepts,
          };
        }
        return null;
      })
      .filter(Boolean) as FacultyWithTree[];
  }, [Facultytree, searchQuery]);

  if (!Facultytree || Facultytree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-border/80 rounded-2xl bg-card">
        <Landmark className="w-12 h-12 text-muted-foreground/50 mb-3" />
        <h3 className="text-base font-bold text-foreground">Aucune faculté enregistrée</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mb-4">
          La structure académique est vide. Commencez par créer votre première faculté.
        </p>
        <FacultyDialog onSave={handleSaveFaculty} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Control Bar: Search & Expand/Collapse */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une faculté, un département, une filière..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            Développer tout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            Réduire tout
          </Button>
        </div>
      </div>

      {/* Empty Search Results */}
      {filteredTree.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-border/80 rounded-2xl bg-card">
          <Inbox className="w-10 h-10 text-muted-foreground/40 mb-2" />
          <h4 className="text-sm font-bold text-foreground">Aucun résultat trouvé</h4>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
            Aucun élément ne correspond à votre recherche "{searchQuery}".
          </p>
        </div>
      ) : (
        /* Faculty Cards Tree */
        <div className="space-y-4">
          {filteredTree.map((faculty) => {
            const isFacultyExpanded = expandedFaculties[faculty.id] ?? true;
            const deptCount = faculty.departments?.length || 0;
            const totalFilieres =
              faculty.departments?.reduce(
                (sum, d) => sum + (d.filieres?.length || 0),
                0
              ) || 0;

            return (
              <div
                key={faculty.id}
                className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs transition-shadow hover:shadow-md"
              >
                {/* ── Faculty Card Header ── */}
                <div className="p-4 sm:p-5 bg-muted/20 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    {/* Toggle button */}
                    <button
                      type="button"
                      onClick={() => toggleFaculty(faculty.id)}
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0 mt-0.5 sm:mt-0"
                      title={isFacultyExpanded ? "Réduire" : "Développer"}
                    >
                      {isFacultyExpanded ? (
                        <ChevronDown className="w-5 h-5 text-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-foreground" />
                      )}
                    </button>

                    {/* Faculty Icon */}
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Landmark className="w-5 h-5" />
                    </div>

                    {/* Faculty Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                          {faculty.code}
                        </span>
                        <h3 className="text-base font-bold text-foreground truncate">
                          {faculty.name}
                        </h3>
                      </div>
                      {faculty.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {faculty.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges & Faculty Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                      <GitFork className="w-3 h-3" />
                      {deptCount} dép.
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                      <GraduationCap className="w-3 h-3" />
                      {totalFilieres} filières
                    </span>

                    {/* Add Department to this Faculty */}
                    <DepartmentDialog
                      defaultFacultyId={faculty.id}
                      faculties={faculties}
                      onSave={handleSaveDepartment}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs gap-1.5 font-medium"
                          title="Ajouter un département à cette faculté"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Nouveau Dép.</span>
                        </Button>
                      }
                    />

                    {/* Edit Faculty */}
                    <FacultyDialog
                      faculty={faculty}
                      onSave={handleSaveFaculty}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Modifier la faculté"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      }
                    />

                    {/* Delete Faculty */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      onClick={() => handleDeleteFaculty(faculty.id, faculty.name)}
                      title="Supprimer la faculté"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* ── Faculty Departments (Collapsible) ── */}
                {isFacultyExpanded && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {deptCount === 0 ? (
                      <div className="py-8 px-4 text-center border border-dashed border-border/70 rounded-xl bg-muted/10">
                        <p className="text-xs text-muted-foreground">
                          Aucun département n'a été créé dans cette faculté.
                        </p>
                        <div className="mt-2.5">
                          <DepartmentDialog
                            defaultFacultyId={faculty.id}
                            faculties={faculties}
                            onSave={handleSaveDepartment}
                          />
                        </div>
                      </div>
                    ) : (
                      faculty.departments.map((dept) => {
                        const isDeptExpanded = expandedDepts[dept.id] ?? true;
                        const filiereCount = dept.filieres?.length || 0;

                        return (
                          <div
                            key={dept.id}
                            className="rounded-xl border border-border/60 bg-muted/15 overflow-hidden"
                          >
                            {/* Department Header */}
                            <div className="p-3.5 bg-muted/30 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => toggleDept(dept.id)}
                                  className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0"
                                  title={isDeptExpanded ? "Réduire" : "Développer"}
                                >
                                  {isDeptExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-foreground" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-foreground" />
                                  )}
                                </button>

                                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 shrink-0">
                                  <GitFork className="w-4 h-4" />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                                      {dept.code}
                                    </span>
                                    <span className="font-semibold text-sm text-foreground truncate">
                                      {dept.name}
                                    </span>
                                  </div>
                                  {dept.description && (
                                    <p className="text-[11px] text-muted-foreground truncate">
                                      {dept.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Department Actions */}
                              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                <span className="text-[11px] font-medium text-muted-foreground mr-1">
                                  {filiereCount} filière{filiereCount > 1 ? "s" : ""}
                                </span>

                                {/* Add Filiere to this Dept */}
                                <FiliereDialog
                                  defaultDepartmentId={dept.id}
                                  departments={departments}
                                  onSave={handleSaveFiliere}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-[11px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                      title="Ajouter une filière"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Ajouter Filière</span>
                                    </Button>
                                  }
                                />

                                {/* Edit Department */}
                                <DepartmentDialog
                                  department={dept}
                                  faculties={faculties}
                                  onSave={handleSaveDepartment}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                                      title="Modifier ce département"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </Button>
                                  }
                                />

                                {/* Delete Department */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                  onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                  title="Supprimer ce département"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Filieres List */}
                            {isDeptExpanded && (
                              <div className="p-3">
                                {filiereCount === 0 ? (
                                  <p className="text-[11px] text-muted-foreground italic px-2 py-1">
                                    Aucune filière n'est rattachée à ce département.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {dept.filieres.map((fil) => (
                                      <div
                                        key={fil.id}
                                        className="p-3 rounded-lg border border-border/50 bg-card flex items-start justify-between gap-2 hover:border-primary/40 transition-colors group"
                                      >
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                                              {fil.code}
                                            </span>
                                            <span className="font-semibold text-xs text-foreground truncate">
                                              {fil.name}
                                            </span>
                                          </div>
                                          {fil.description && (
                                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                                              {fil.description}
                                            </p>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                          <FiliereDialog
                                            filiere={fil}
                                            departments={departments}
                                            onSave={handleSaveFiliere}
                                            trigger={
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-primary"
                                                title="Modifier la filière"
                                              >
                                                <Pencil className="w-3 h-3" />
                                              </Button>
                                            }
                                          />
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                            onClick={() => handleDeleteFiliere(fil.id, fil.name)}
                                            title="Supprimer la filière"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}