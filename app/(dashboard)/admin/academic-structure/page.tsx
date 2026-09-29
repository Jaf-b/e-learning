"use client";

import React, { useEffect, useState, useCallback } from "react";
import Header from "@/components/shared/header";
import StatisticCard from "@/components/shared/statistic-card";
import {
  getFacultiesWithTree,
  createFaculty,
} from "@/lib/action/faculty.actions";
import {
  getAllDepartments,
  createDepartment,
} from "@/lib/action/departement.actions";
import {
  getAllFilieres,
  createFiliere,
} from "@/lib/action/filieres.actions";
import { FacultiesTreeResponse, Faculty, Department, Filiere } from "@/types";
import FacultyTree from "@/components/admin/FacultyTree";
import FacultyDialog from "@/components/shared/faculty-dialog";
import DepartmentDialog from "@/components/shared/department-dialog";
import FiliereDialog from "@/components/shared/filiere-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  Landmark,
  GitFork,
  GraduationCap,
  Layers,
  Network,
} from "lucide-react";

export default function AcademicStructurePage() {
  const [treeData, setTreeData] = useState<FacultiesTreeResponse | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [treeResponse, departmentsResponse, filieresResponse] =
        await Promise.all([
          getFacultiesWithTree(),
          getAllDepartments(),
          getAllFilieres(),
        ]);

      if (treeResponse.success && treeResponse.data) {
        setTreeData(treeResponse.data);
        setFaculties(treeResponse.data as any);
      }
      if (departmentsResponse.success && departmentsResponse.data) {
        setDepartments(departmentsResponse.data);
      }
      if (filieresResponse.success && filieresResponse.data) {
        setFilieres(filieresResponse.data);
      }
    } catch (error) {
      console.error("Erreur chargement structure académique:", error);
      toast.add({
        type: "error",
        description: "Impossible de charger la structure académique.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateFaculty = async (facultyData: any) => {
    const res = await createFaculty(facultyData);
    if (res.success) {
      toast.add({ type: "success", description: `Faculté "${facultyData.name}" créée.` });
      await loadData();
    } else {
      toast.add({ type: "error", description: res.error || "Échec de création." });
    }
  };

  const handleCreateDepartment = async (deptData: any) => {
    const res = await createDepartment(deptData);
    if (res.success) {
      toast.add({ type: "success", description: `Département "${deptData.name}" créé.` });
      await loadData();
    } else {
      toast.add({ type: "error", description: res.error || "Échec de création." });
    }
  };

  const handleCreateFiliere = async (filData: any) => {
    const res = await createFiliere(filData);
    if (res.success) {
      toast.add({ type: "success", description: `Filière "${filData.name}" créée.` });
      await loadData();
    } else {
      toast.add({ type: "error", description: res.error || "Échec de création." });
    }
  };

  // Metrics calculation
  const totalFaculties = treeData?.length || 0;
  const totalDepartments = departments.length;
  const totalFilieres = filieres.length;
  const avgFilieresPerDept =
    totalDepartments > 0
      ? (totalFilieres / totalDepartments).toFixed(1)
      : "0";

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Page Header with Action Dialogs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Structure Académique"
          description="Organisation hiérarchique de l'établissement : Facultés, Départements et Filières d'études."
        />

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <FacultyDialog onSave={handleCreateFaculty} />
          {faculties.length > 0 && (
            <DepartmentDialog
              faculties={faculties}
              onSave={handleCreateDepartment}
            />
          )}
          {departments.length > 0 && (
            <FiliereDialog
              departments={departments}
              onSave={handleCreateFiliere}
            />
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticCard
          title="Total Facultés"
          value={totalFaculties}
          subtitle="Unités académiques principales"
          icon={<Landmark className="w-5 h-5" />}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatisticCard
          title="Départements"
          value={totalDepartments}
          subtitle="Pôles disciplinaires"
          icon={<GitFork className="w-5 h-5" />}
          iconClassName="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
        />
        <StatisticCard
          title="Filières"
          value={totalFilieres}
          subtitle="Parcours de formation"
          icon={<GraduationCap className="w-5 h-5" />}
          iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <StatisticCard
          title="Ratio Filières / Dép."
          value={avgFilieresPerDept}
          subtitle="Moyenne par département"
          icon={<Network className="w-5 h-5" />}
          iconClassName="bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
        />
      </div>

      {/* Academic Tree Explorer */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <FacultyTree
          Facultytree={treeData || []}
          faculties={faculties}
          departments={departments}
          filieres={filieres}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}