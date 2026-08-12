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

type Filiere = {
    id: string;
    departmentId: string;
    code: string;
    name: string;
    description: string | null;
}

type Department = {
    id: string;
    name: string;
}

interface FiliereDialogProps {
    filiere?: Filiere;
    departments: Department[];
    onSave: (filiere: Omit<Filiere, "id" | "code"> & { code?: string }) => void;
    children?: React.ReactNode;
}

export default function FiliereDialog({ filiere, departments, onSave, children }: FiliereDialogProps) {
    const [departmentId, setDepartmentId] = React.useState(filiere?.departmentId || "");
    const [name, setName] = React.useState(filiere?.name || "");
    const [description, setDescription] = React.useState(filiere?.description || "");

    const handleSave = () => {
        const code = name.substring(0, 4).toUpperCase();
        onSave({ departmentId, name, description, code });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || <Button>{filiere ? "Edit Filiere" : "Add Filiere"}</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{filiere ? "Edit Filiere" : "Add Filiere"}</DialogTitle>
                    <DialogDescription>
                        {filiere ? "Edit the details of the filiere." : "Add a new filiere to the system."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="department" className="text-right">
                            Department
                        </label>
                        <Select onValueChange={setDepartmentId} value={departmentId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Departments</SelectLabel>
                                    {departments.map(department => (
                                        <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right">
                            Name
                        </label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="description" className="text-right">
                            Description
                        </label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}