"use client"
import React from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Button} from "@/components/ui/button";
import {ChevronsUpDown, Pencil} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {Item, ItemActions, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {FacultyWithTree, Faculty, Department, Filiere} from "@/types";
import EmptyMessage from "@/components/shared/empty-message";
import FacultyDialog from "@/components/shared/faculty-dialog";
import DepartmentDialog from "@/components/shared/department-dialog";
import FiliereDialog from "@/components/shared/filiere-dialog";
import { createFaculty, updateFaculty } from "@/lib/action/faculty.actions";
import { createDepartment, updateDepartment } from "@/lib/action/departement.actions";
import { createFiliere, updateFiliere } from "@/lib/action/filieres.actions";

interface FacultyTreeProps {
    Facultytree: FacultyWithTree[];
    faculties: Faculty[];
    departments: Department[];
    filieres: Filiere[];
}

function FacultyTree({Facultytree, faculties, departments, filieres}: FacultyTreeProps) {

    const handleSaveFaculty = async (faculty: any) => {
        if (faculty.id) {
            await updateFaculty(faculty.id, faculty);
        } else {
            await createFaculty(faculty);
        }
    }

    const handleSaveDepartment = async (department: any) => {
        if (department.id) {
            await updateDepartment(department.id, department);
        } else {
            await createDepartment(department);
        }
    }

    const handleSaveFiliere = async (filiere: any) => {
        if (filiere.id) {
            await updateFiliere(filiere.id, filiere);
        } else {
            await createFiliere(filiere);
        }
    }

   if (!Facultytree || Facultytree.length === 0)
    return (
        <div>
            <EmptyMessage />
            <FacultyDialog onSave={handleSaveFaculty} />
        </div>
    )

    return (
        <div>
            <FacultyDialog onSave={handleSaveFaculty} />
            {Facultytree?.map((element,index)=>(
                <Collapsible key={index}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CollapsibleTrigger render={<Button variant="ghost" size="icon" className="size-8"><ChevronsUpDown /></Button>} />
                                    {element.name}
                                    <FacultyDialog faculty={element} onSave={handleSaveFaculty}>
                                        <Button variant="ghost" size="icon"><Pencil className="size-4" /></Button>
                                    </FacultyDialog>
                                </div>
                                <DepartmentDialog onSave={handleSaveDepartment} faculties={faculties} />
                            </CardTitle>
                            <CardDescription>{element.description}</CardDescription>
                        </CardHeader>
                        <Separator />
                        <CollapsibleContent className="flex flex-col gap-2">
                            <CardContent>
                            {element.departments.map((dept,index) =>(
                                    <Collapsible key={index}>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <CollapsibleTrigger render={<Button variant="ghost" size="icon" className="size-8"><ChevronsUpDown /></Button>} />
                                                        {dept.name}
                                                        <DepartmentDialog department={dept} onSave={handleSaveDepartment} faculties={faculties}>
                                                            <Button variant="ghost" size="icon"><Pencil className="size-4" /></Button>
                                                        </DepartmentDialog>
                                                    </div>
                                                    <FiliereDialog onSave={handleSaveFiliere} departments={departments} />
                                                </CardTitle>
                                                <CardDescription>
                                                    {dept.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <Separator />
                                            <CardContent>
                                                <CollapsibleContent>
                                                    {dept.filieres.map((fil,index)=>(
                                                        <Item variant="muted" key={index}>
                                                            <ItemContent>
                                                                <ItemTitle>
                                                                    {fil.name}
                                                                    <FiliereDialog filiere={fil} onSave={handleSaveFiliere} departments={departments}>
                                                                        <Button variant="ghost" size="icon"><Pencil className="size-4" /></Button>
                                                                    </FiliereDialog>
                                                                </ItemTitle>
                                                                <ItemDescription>
                                                                    {fil.description}
                                                                </ItemDescription>
                                                            </ItemContent>
                                                        </Item>
                                                    ))}
                                                </CollapsibleContent>
                                            </CardContent>
                                        </Card>
                                    </Collapsible>
                            ))}
                            </CardContent>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            ))}
        </div>
    )
}

export default FacultyTree