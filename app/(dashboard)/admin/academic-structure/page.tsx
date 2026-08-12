"use client"

import React, {useEffect, useState} from "react"
import Header from "@/components/shared/header"
import StatisticCard from "@/components/shared/statistic-card"
import {getFacultiesWithTree} from "@/lib/action/faculty.actions";
import {getAllDepartments} from "@/lib/action/departement.actions";
import {getAllFilieres} from "@/lib/action/filieres.actions";
import {FacultiesTreeResponse, Faculty, Department, Filiere} from "@/types";
import FacultyTree from "@/components/admin/FacultyTree";
import { Skeleton } from "@/components/ui/skeleton";

export default function AcademicStructure() {
  const [treeData, setTreeData] = useState<FacultiesTreeResponse | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const getData = async () => {
      const [treeResponse, facultiesResponse, departmentsResponse, filieresResponse] = await Promise.all([
        getFacultiesWithTree(),
        getFacultiesWithTree(),
        getAllDepartments(),
        getAllFilieres(),
      ]);

      if (treeResponse.success) {
        setTreeData(treeResponse.data!);
      }
      if (facultiesResponse.success) {
        setFaculties(facultiesResponse.data!);
      }
      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.data!);
      }
      if (filieresResponse.success) {
        setFilieres(filieresResponse.data!);
      }
      setLoading(false);
    };
    getData();
  },[])

  if (loading) {
    return (
      <div className="p-6 flex flex-col gap-4 animate-pulse">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl mt-4" />
      </div>
    );
  }

  const mock = {
    title: "Communication & Presenting",
    description:
      "Master the art of clear and confident business communication. This page offers a curated selection of courses designed to help you enhance your skills in a range of areas, from crafting emails to confident public speaking.",
  }

  const stat = {
    title: "Students Attendance",
    value: "1,025",
    subtitle: "Students Present Today",
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <Header title={mock.title} description={mock.description} linkHref="#" />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticCard title={stat.title} value={stat.value} subtitle={stat.subtitle} />
        <StatisticCard title={stat.title} value={stat.value} subtitle={stat.subtitle} />
        <StatisticCard title={stat.title} value={stat.value} subtitle={stat.subtitle} />
        <StatisticCard title={stat.title} value={stat.value} subtitle={stat.subtitle} />
      </div>
        <FacultyTree Facultytree={treeData!} faculties={faculties} departments={departments} filieres={filieres} />
    </div>
  )
}