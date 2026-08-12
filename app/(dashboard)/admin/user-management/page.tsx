"use client"
import UserList from "@/components/shared/user-list";
import Header from "@/components/shared/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, {useEffect, useState} from "react";
import StudentList from "@/components/shared/student-list";
import StudentDialog from "@/components/shared/student-dialog";
import { enrollStudent } from "@/lib/action/student-enrollement.actions";
import { getAllUsers } from "@/lib/action/user.actions";
import { getPromotions } from "@/lib/action/promotions.actions";
import { User, Promotion } from "@/types";
import AddUserDialog from "@/components/shared/add-user-dialog";

const UserManagementPage = () => {
    const [role, setRole] = useState<"ALL" | "TEACHER" | "STUDENT">("ALL");
    const [users, setUsers] = useState<User[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);

    useEffect(() => {
        const getData = async () => {
            const [usersResponse, promotionsResponse] = await Promise.all([
                getAllUsers(),
                getPromotions(),
            ]);

            if (usersResponse.success) {
                setUsers(usersResponse.data!);
            }
            if (promotionsResponse.success) {
                setPromotions(promotionsResponse.data!);
            }
        };
        getData();
    }, []);

    const handleEnrollStudent = async (enrollment: any) => {
        await enrollStudent(enrollment);
    }

    const filteredUsers = users.filter(user => {
        if (role === "ALL") return true;
        return user.role === role;
    });

    const students = users.filter(user => user.role === "STUDENT");

  return (
    <div className="p-6 flex flex-col gap-4">
        <Header
            title="User Management"
            description="Manage all users in the system"
        />
        <AddUserDialog />
        <Tabs value={role} onValueChange={setRole} className="mt-4 flex flex-col w-full">
            <TabsList variant="line" className="flex items-center gap-6">
                <TabsTrigger
                    value="ALL"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                    All Users
                </TabsTrigger>

                <TabsTrigger
                    value="TEACHER"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                    Teachers
                </TabsTrigger>

                <TabsTrigger
                    value="STUDENT"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                    Students
                </TabsTrigger>
            </TabsList>

            <TabsContent value="ALL" className="mt-4">
                <UserList users={filteredUsers} />
            </TabsContent>

            <TabsContent value="TEACHER" className="mt-4">
                <UserList users={filteredUsers.filter((u) => u.role === "TEACHER")} />
            </TabsContent>

            <TabsContent value="STUDENT" className="mt-4 flex flex-col gap-4">
                <StudentDialog onSave={handleEnrollStudent} promotions={promotions} />
                <StudentList students={students} />
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default UserManagementPage;