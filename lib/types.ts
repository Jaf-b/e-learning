


export type User = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    role: "ADMIN" | "TEACHER" | "STUDENT";
    isActive: boolean | null;
    lastLoginAt: Date | null;
};

export type Module = {
    id: string;
    courseId: string;
    title: string;
    order: number;
};

export type Course = {
    id: string;
    filiereId: string;
    degreeLevelId: string;
    code: string;
    title: string;
    description: string | null;
    credits: number;
    status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
    authorId: string;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
    author: User;
    modules?: Module[];
};

export type EvaluationType = 'EXAM' | 'INTERRO' | 'TP';
export type EvaluationStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface Evaluation {
    id: string;
    title: string;
    type: EvaluationType;
    course: string;
    filiere: string;
    promotion: string;
    date: string;
    weight: number; // Coefficient ou pourcentage (ex: 20%)
    maxScore: number; // Note maximale (ex: /20)
    status: EvaluationStatus;
}