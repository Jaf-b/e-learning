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

type Student = {
    id: string;
    name: string;
}

type Promotion = {
    id: string;
    code: string;
}

interface StudentDialogProps {
    student?: Student;
    promotions: Promotion[];
    onSave: (enrollment: { studentId: string, promotionId: string }) => void;
}

export default function StudentDialog({ student, promotions, onSave }: StudentDialogProps) {
    const [studentId, setStudentId] = React.useState(student?.id || "");
    const [promotionId, setPromotionId] = React.useState("");

    const handleSave = () => {
        onSave({ studentId, promotionId });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>{student ? "Edit Enrollment" : "Enroll Student"}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{student ? "Edit Enrollment" : "Enroll Student"}</DialogTitle>
                    <DialogDescription>
                        {student ? "Edit the student's enrollment." : "Enroll a new student in a promotion."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="student" className="text-right">
                            Student
                        </label>
                        <Input id="student" value={student?.name || ""} readOnly className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="promotion" className="text-right">
                            Promotion
                        </label>
                        <Select onValueChange={setPromotionId} value={promotionId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a promotion" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Promotions</SelectLabel>
                                    {promotions.map(promotion => (
                                        <SelectItem key={promotion.id} value={promotion.id}>{promotion.code}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}