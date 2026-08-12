"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Course = {
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
};

type Filiere = {
    id: string;
    name: string;
}

type DegreeLevel = {
    id: string;
    name: string;
}

type User = {
    id: string;
    name: string;
}

interface CourseDialogProps {
    course?: Course;
    filieres: Filiere[];
    degreeLevels: DegreeLevel[];
    authors: User[];
    onSave: (course: Omit<Course, "id" | "code" | "status"> & { code?: string, status?: string }) => void;
}

export default function CourseDialog({ course, filieres, degreeLevels, authors, onSave }: CourseDialogProps) {
    const [filiereId, setFiliereId] = React.useState(course?.filiereId || "");
    const [degreeLevelId, setDegreeLevelId] = React.useState(course?.degreeLevelId || "");
    const [title, setTitle] = React.useState(course?.title || "");
    const [description, setDescription] = React.useState(course?.description || "");
    const [credits, setCredits] = React.useState(course?.credits || 0);
    const [authorId, setAuthorId] = React.useState(course?.authorId || "");
    const [rejectionReason, setRejectionReason] = React.useState(course?.rejectionReason || "");

    const handleSave = () => {
        const code = title.substring(0, 4).toUpperCase();
        const status = "DRAFT";
        onSave({ filiereId, degreeLevelId, title, description, credits, authorId, rejectionReason, code, status });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>{course ? "Edit Course" : "Add Course"}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{course ? "Edit Course" : "Add Course"}</DialogTitle>
                    <DialogDescription>
                        {course ? "Edit the details of the course." : "Add a new course to the system."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="filiere" className="text-right">
                            Filiere
                        </label>
                        <Select onValueChange={setFiliereId} value={filiereId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a filiere" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Filieres</SelectLabel>
                                    {filieres.map(filiere => (
                                        <SelectItem key={filiere.id} value={filiere.id}>{filiere.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="degreeLevel" className="text-right">
                            Degree Level
                        </label>
                        <Select onValueChange={setDegreeLevelId} value={degreeLevelId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a degree level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Degree Levels</SelectLabel>
                                    {degreeLevels.map(level => (
                                        <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="title" className="text-right">
                            Title
                        </label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="description" className="text-right">
                            Description
                        </label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="credits" className="text-right">
                            Credits
                        </label>
                        <Input id="credits" type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value))} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="author" className="text-right">
                            Author
                        </label>
                        <Select onValueChange={setAuthorId} value={authorId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select an author" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Authors</SelectLabel>
                                    {authors.map(author => (
                                        <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    {course?.status === "REJECTED" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="rejectionReason" className="text-right">
                                Rejection Reason
                            </label>
                            <Textarea id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="col-span-3" />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}