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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    description: z.string().optional(),
    facultyId: z.string({ required_error: "Please select a faculty." }),
});

type Department = {
    id: string;
    facultyId: string;
    code: string;
    name: string;
    description: string | null;
}

type Faculty = {
    id: string;
    name: string;
}

interface DepartmentDialogProps {
    department?: Department;
    faculties: Faculty[];
    onSave: (department: Omit<Department, "id" | "code"> & { code?: string }) => void;
    children?: React.ReactNode;
}

export default function DepartmentDialog({ department, faculties, onSave, children }: DepartmentDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: department?.name || "",
            description: department?.description || "",
            facultyId: department?.facultyId || "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const code = values.name.substring(0, 4).toUpperCase();
        const response = await onSave({ ...values, code });

        if (response.success) {
            toast.success(department ? "Department updated successfully." : "Department created successfully.");
        } else {
            toast.error(response.error);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || <Button>{department ? "Edit Department" : "Add Department"}</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{department ? "Edit Department" : "Add Department"}</DialogTitle>
                    <DialogDescription>
                        {department ? "Edit the details of the department." : "Add a new department to the system."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="facultyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Faculty</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a faculty" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {faculties.map(faculty => (
                                                <SelectItem key={faculty.id} value={faculty.id}>{faculty.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Department of Physics" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="A short description of the department" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}