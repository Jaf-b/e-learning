"use client"
import CourseList from "@/components/shared/course-list";
import Header from "@/components/shared/header";
import StatisticCard from "@/components/shared/statistic-card";
import CourseFilter from "@/components/shared/course-filter";
import React, {useEffect, useState} from "react";
import CourseDialog from "@/components/shared/course-dialog";
import { createCourse, updateCourse, getAllCourses } from "@/lib/action/courses.actions";
import { getAllFilieres } from "@/lib/action/filieres.actions";
import { getAllDegreeLevels } from "@/lib/action/degree.actions";
import { getAllUsers } from "@/lib/action/user.actions";
import { Course, Filiere, DegreeLevel, User } from "@/types";

const CoursesPage = () => {
    const [filters, setFilters] = React.useState({
        name: "",
        department: "",
        promotion: "",
    });
    const [courses, setCourses] = useState<Course[]>([]);
    const [filieres, setFilieres] = useState<Filiere[]>([]);
    const [degreeLevels, setDegreeLevels] = useState<DegreeLevel[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const getData = async () => {
            const [coursesResponse, filieresResponse, degreeLevelsResponse, usersResponse] = await Promise.all([
                getAllCourses(),
                getAllFilieres(),
                getAllDegreeLevels(),
                getAllUsers(),
            ]);

            if (coursesResponse.success) {
                setCourses(coursesResponse.data!);
            }
            if (filieresResponse.success) {
                setFilieres(filieresResponse.data!);
            }
            if (degreeLevelsResponse.success) {
                setDegreeLevels(degreeLevelsResponse.data!);
            }
            if (usersResponse.success) {
                setUsers(usersResponse.data!);
            }
        };
        getData();
    }, []);

    const handleFilterChange = (filterName: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleFilterReset = () => {
        setFilters({
            name: "",
            department: "",
            promotion: "",
        });
    };

    const handleSaveCourse = async (course: any) => {
        if (course.id) {
            await updateCourse(course.id, course);
        } else {
            await createCourse(course);
        }
    }

    const filteredCourses = courses.filter(course => {
        return (
            course.title.toLowerCase().includes(filters.name.toLowerCase())
        );
    });

    const totalCourses = filteredCourses.length;
    const publishedCourses = filteredCourses.filter(course => course.status === "PUBLISHED").length;
    const draftCourses = filteredCourses.filter(course => course.status === "DRAFT").length;
  return (
    <div className="p-6">
        <Header
            title="Courses"
            description="Manage all courses in the system"
        />
        <CourseDialog onSave={handleSaveCourse} filieres={filieres} degreeLevels={degreeLevels} authors={users} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 my-4">
            <StatisticCard title="Total Courses" value={totalCourses} />
            <StatisticCard title="Published Courses" value={publishedCourses} />
            <StatisticCard title="Draft Courses" value={draftCourses} />
        </div>
        <CourseFilter
            onFilterChange={handleFilterChange}
            onFilterReset={handleFilterReset}
            filters={filters}
            departmentOptions={[]}
            promotionOptions={[]}
        />
      <CourseList courses={filteredCourses} />
    </div>
  );
};

export default CoursesPage;