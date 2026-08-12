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

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    description: z.string().optional(),
});

type Faculty = {
    id: string;
    code: string;
    name: string;
    description: string | null;
}

interface FacultyDialogProps {
    faculty?: Faculty;
    onSave: (faculty: Omit<Faculty, "id" | "code"> & { code?: string }) => void;
    children?: React.ReactNode;
}

export default function FacultyDialog({ faculty, onSave, children }: FacultyDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: faculty?.name || "",
            description: faculty?.description || "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const code = values.name.substring(0, 4).toUpperCase();
        const response = await onSave({ ...values, code });

        if (response.success) {
            toast.success(faculty ? "Faculty updated successfully." : "Faculty created successfully.");
        } else {
            toast.error(response.error);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || <Button>{faculty ? "Edit Faculty" : "Add Faculty"}</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{faculty ? "Edit Faculty" : "Add Faculty"}</DialogTitle>
                    <DialogDescription>
                        {faculty ? "Edit the details of the faculty." : "Add a new faculty to the system."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Faculty of Science" {...field} />
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
                                        <Textarea placeholder="A short description of the faculty" {...field} />
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