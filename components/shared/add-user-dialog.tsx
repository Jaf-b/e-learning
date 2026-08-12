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
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, {useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/components/ui/toast";
import { createUser, updateUser } from "@/lib/action/user.actions";
import { getFacultiesWithTree } from "@/lib/action/faculty.actions";
import { getAllDepartments } from "@/lib/action/departement.actions";
import { getAllFilieres } from "@/lib/action/filieres.actions";
import { getPromotions } from "@/lib/action/promotions.actions";
import { getAllDegrees, getAllDegreeLevels } from "@/lib/action/degree.actions";
import { getAcademicYears } from "@/lib/action/academic-years.actions";
import {User, Faculty, Department, Filiere, Promotion, Degree, DegreeLevel, AcademicYear} from "@/types";
import {Field, FieldError, FieldLabel} from "@/components/ui/field";

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().optional(),
    role: z.string(),
    facultyId: z.string().optional(),
    departmentId: z.string().optional(),
    filiereId: z.string().optional(),
    promotionId: z.string().optional(),
    degreeId: z.string().optional(),
    degreeLevelId: z.string().optional(),
    academicYearId: z.string().optional(),
});

interface AddUserDialogProps {
    user?: User;
    children?: React.ReactNode;
}

export default function AddUserDialog({ user, children }: AddUserDialogProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            role: user?.role || "STUDENT",
        },
    });
    const FacultyID = form.watch("facultyId");
    const DepartmentID = form.watch("departmentId");
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [degrees, setDegrees] = useState<Degree[]>([]);
    const [degreeLevels, setDegreeLevels] = useState<DegreeLevel[]>([]);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

    const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
    const [filteredFilieres, setFilteredFilieres] = useState<Filiere[]>([]);

    useEffect(()=>{
        console.log("FacultyID",FacultyID)
        console.log("DepartmentID",DepartmentID)
        if(FacultyID) handleFacultyChange(FacultyID);
        if (DepartmentID) handleDepartmentChange(DepartmentID);

    },[FacultyID,DepartmentID])
    useEffect(() => {
        const getData = async () => {
            const [facultiesResponse, departmentsResponse, filieresResponse, promotionsResponse, degreesResponse, degreeLevelsResponse, academicYearsResponse] = await Promise.all([
                getFacultiesWithTree(),
                getAllDepartments(),
                getAllFilieres(),
                getPromotions(),
                getAllDegrees(),
                getAllDegreeLevels(),
                getAcademicYears(),
            ]);

            if (facultiesResponse.success) setFaculties(facultiesResponse.data!);
            if (departmentsResponse.success) setDepartments(departmentsResponse.data!);
            if (filieresResponse.success) setFilieres(filieresResponse.data!);
            if (promotionsResponse.success) setPromotions(promotionsResponse.data!);
            if (degreesResponse.success) setDegrees(degreesResponse.data!);
            if (degreeLevelsResponse.success) setDegreeLevels(degreeLevelsResponse.data!);
            if (academicYearsResponse.success) setAcademicYears(academicYearsResponse.data!);
        };
        getData();
    }, []);

    const handleFacultyChange = (facultyId: string) => {
        form.setValue("facultyId", facultyId);
        form.setValue("departmentId", "");
        form.setValue("filiereId", "");
        const depts = departments.filter(d => d.facultyId === facultyId);
        setFilteredDepartments(depts);
    }

    const handleDepartmentChange = (departmentId: string) => {
        form.setValue("departmentId", departmentId);
        form.setValue("filiereId", "");
        const fils = filieres.filter(f => f.departmentId === departmentId);
        setFilteredFilieres(fils);
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const { facultyId, departmentId, filiereId, promotionId, degreeId, degreeLevelId, academicYearId, ...userData } = values;
        const userToSave: any = { ...userData, additionalFields: { role: values.role } };

        if (values.role === "STUDENT") {
            userToSave.enrollment = {
                promotionId: values.promotionId,
            };
        }

        const response = user
            ? await updateUser(user.id, userToSave)
            : await createUser(JSON.stringify(userToSave));

        if (response.success) {
            toast.add({
                type:"success",
                description: user ? "User updated successfully." : "User created successfully."
            });
        } else {
            toast.add({
                type:"error",
                description: response.error
            });
        }
    }

    return (
        <Dialog>
            <DialogTrigger className={buttonVariants({ variant: "default", size: "lg" })}>
                {children || "Add User"}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
                    <DialogDescription>
                        {user ? "Edit the details of the user." : "Add a new user to the system."}
                    </DialogDescription>
                </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Controller name="name" control={form.control} render={({field,fieldState})=>(
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Name</FieldLabel>
                                <Input placeholder="John Doe" {...field} />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}/>
                        <Controller name="email" control={form.control} render={({field,fieldState})=>(
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Email</FieldLabel>
                                <Input type="email" placeholder="john.doe@example.com" {...field} />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}/>
                        <Controller name="password" control={form.control} render={({field,fieldState})=>(
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Password</FieldLabel>
                                <Input type="password" placeholder="Leave blank to keep current password" {...field} />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}/>
                        <Controller name="role" control={form.control} render={({field,fieldState})=>(
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Rôle</FieldLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="STUDENT">Student</SelectItem>
                                            <SelectItem value="TEACHER">Teacher</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}/>

                        {form.watch("role") === "STUDENT" && (
                            <>
                                <Controller name="facultyId" control={form.control} render={({field,fieldState})=>(
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Facultés</FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select a Faculty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {faculties.map(faculty => (
                                                        <SelectItem key={faculty.id} value={faculty.id}>{faculty.name}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}/>

                                <Controller name="departmentId" control={form.control} render={({field,fieldState})=>(
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Departement</FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.watch("facultyId")}>
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select a Field" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {filteredDepartments.map(department => (
                                                        <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}/>

                                <Controller name="filiereId" control={form.control} render={({field,fieldState})=>(
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Filiere</FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.watch("departmentId")}>
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select a filiere" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {filteredFilieres.map(filiere => (
                                                        <SelectItem key={filiere.id} value={filiere.id}>{filiere.name}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}/>

                                <Controller name="promotionId" control={form.control} render={({field,fieldState})=>(
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Promotion</FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.watch("filiereId")}>
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select a promotion" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {promotions.map(promotion => (
                                                        <SelectItem key={promotion.id} value={promotion.id}>{promotion.code}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}/>

                                <Controller name="degreeId" control={form.control} render={({field,fieldState})=>(
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Degree</FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.watch("promotionId")}>
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select a degree" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {degrees.map(degree => (
                                                        <SelectItem key={degree.id} value={degree.id}>{degree.name}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}/>

                                <Controller name="degreeLevelId" control={form.control} render={({field,fieldState})=>(
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Degree Level</FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.watch("degreeId")}>
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select a degree level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {academicYears.map(year => (
                                                        <SelectItem key={year.id} value={year.id}>{year.year}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}/>

                                <Controller name="academicYearId" control={form.control} render={({field,fieldState})=>(
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Academic Year</FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.watch("promotionId")}>
                                            <SelectTrigger aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select an academic year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {academicYears.map(year => (
                                                        <SelectItem key={year.id} value={year.id}>{year.year}</SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}/>

                            </>
                        )}
                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
            </DialogContent>
        </Dialog>
    );
}