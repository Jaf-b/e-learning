import { InferSelectModel } from "drizzle-orm";
import {
    faculties,
    departments,
    filieres,
    user,
    promotions,
    degrees,
    degreeLevels,
    academicYears,
    courses
} from "@/db/schema";

// Types de base pour chaque table
export type Faculty = InferSelectModel<typeof faculties>;
export type Department = InferSelectModel<typeof departments>;
export type Filiere = InferSelectModel<typeof filieres>;
export type User = InferSelectModel<typeof user>;
export type Promotion = InferSelectModel<typeof promotions>;
export type Degree = InferSelectModel<typeof degrees>;
export type DegreeLevel = InferSelectModel<typeof degreeLevels>;
export type AcademicYear = InferSelectModel<typeof academicYears>
export type Course = InferSelectModel<typeof courses>

// Type combiné avec la structure exacte des relations imbriquées
export type FiliereItem = Filiere;

export type DepartmentWithFilieres = Department & {
    filieres: FiliereItem[];
};

export type FacultyWithTree = Faculty & {
    departments: DepartmentWithFilieres[];
};

// Le type final de la réponse (tableau de facultés)
export type FacultiesTreeResponse = FacultyWithTree[];
